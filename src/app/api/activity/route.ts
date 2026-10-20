// A no-op the browser pings (at most once a minute) while someone is using the page. Like any
// request it passes through src/proxy.ts, which records it as activity - so typing a long ad
// description counts as being active, the same as touching the screen does on the app.
export function POST() {
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
