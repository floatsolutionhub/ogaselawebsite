import { HubConnectionBuilder, HttpTransportType, LogLevel, type HubConnection } from "@microsoft/signalr";
import { cookies } from "next/headers";

import { env } from "@/config/env";
import type { Message } from "@/lib/api/types";
import { COOKIE } from "@/lib/auth/cookies";

// Live updates for the signed-in browser, as Server-Sent Events. The API's SignalR hub needs the
// access token, and the browser never has it - so this server holds the hub connection and relays
// only what the page needs: new messages, and the unread counts for the Messages and bell badges.
//
// Each stream closes after STREAM_MS; EventSource reconnects on its own, and that new request
// passes through src/proxy.ts, which refreshes the token first. So a long-open tab never keeps
// using an expired token.

const STREAM_MS = 8 * 60_000;
const HEARTBEAT_MS = 25_000;
const COUNTS_EVERY_MS = 60_000;

export async function GET(request: Request) {
  const token = (await cookies()).get(COOKIE.access)?.value;
  if (!token) return new Response(null, { status: 401 });

  const encoder = new TextEncoder();
  let hub: HubConnection | null = null;
  const timers: ReturnType<typeof setInterval>[] = [];
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      const close = () => {
        if (closed) return;
        closed = true;
        timers.forEach(clearInterval);
        hub?.stop().catch(() => {});
        try {
          controller.close();
        } catch {
          // Already closed by the client.
        }
      };

      // Runs from timers and hub events after this handler has returned, so it uses the token
      // captured above rather than the request-scoped cookies() the API client reads.
      const count = async (path: string): Promise<number | null> => {
        const response = await fetch(`${env.apiUrl}${path}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          cache: "no-store",
          signal: AbortSignal.timeout(10_000),
        });
        if (response.status === 401) {
          // Token expired mid-stream - end it; the reconnect gets a refreshed one.
          close();
          return null;
        }
        const value: unknown = response.ok ? await response.json() : null;
        return typeof value === "number" ? value : null;
      };
      const sendCounts = async () => {
        const [messages, notifications] = await Promise.all([
          count("/conversations/unread-count").catch(() => null),
          count("/me/inbox/unread-count").catch(() => null),
        ]);
        send("counts", { messages, notifications });
      };

      hub = new HubConnectionBuilder()
        .withUrl(`${env.apiOrigin}/hubs/messaging`, {
          accessTokenFactory: () => token,
          transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
        })
        .configureLogging(LogLevel.None)
        .build();

      hub.on("ReceiveMessage", (message: Message) => {
        send("message", {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          content: message.content,
          imageUrl: message.imageUrl,
          sentAt: message.sentAt,
          readAt: message.readAt,
        } satisfies Message);
        sendCounts().catch(() => {});
      });
      hub.onclose(close);

      hub.start().catch(() => {
        // Live push unavailable - counts still refresh on the timer below.
      });

      sendCounts().catch(() => {});
      timers.push(setInterval(() => sendCounts().catch(() => {}), COUNTS_EVERY_MS));
      timers.push(setInterval(() => !closed && controller.enqueue(encoder.encode(": keep-alive\n\n")), HEARTBEAT_MS));
      timers.push(setInterval(close, STREAM_MS));
      request.signal.addEventListener("abort", close);
    },
    cancel() {
      closed = true;
      timers.forEach(clearInterval);
      hub?.stop().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
