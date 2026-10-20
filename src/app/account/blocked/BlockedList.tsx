"use client";

import { useState, useTransition } from "react";
import { Ban } from "lucide-react";

import { setBlocked } from "@/app/actions/listings";
import { EmptyState } from "@/components/market/Badges";
import { useToast } from "@/components/providers/ToastProvider";
import { Dialog } from "@/components/ui/Dialog";
import { buttonClass, cardClass } from "@/components/ui/styles";
import type { BlockedUser } from "@/lib/api/types";
import { timeAgo } from "@/lib/format";

const nameOf = (user: BlockedUser) => user.displayName?.trim() || "Ogasela user";

export function BlockedList({ initial }: { initial: BlockedUser[] }) {
  const toast = useToast();
  const [users, setUsers] = useState(initial);
  const [confirming, setConfirming] = useState<BlockedUser | null>(null);
  const [working, startWorking] = useTransition();

  if (users.length === 0) {
    return (
      <EmptyState icon={Ban} title="You haven't blocked anyone">
        Block someone from a chat to stop them messaging you.
      </EmptyState>
    );
  }

  return (
    <>
      <ul className={`${cardClass} divide-y divide-canvas-dark/60 overflow-hidden`}>
        {users.map((user) => (
          <li key={user.userId} className="flex items-center gap-3 px-5 py-4">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{nameOf(user)}</span>
              <span className="text-sm text-ink-500">Blocked {timeAgo(user.blockedAt)}</span>
            </span>
            <button type="button" onClick={() => setConfirming(user)} className={buttonClass("outline", "sm")}>
              Unblock
            </button>
          </li>
        ))}
      </ul>
      <Dialog
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        size="sm"
        title={`Unblock ${confirming ? nameOf(confirming) : ""}?`}
        description="They'll be able to message you again."
        footer={
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirming(null)} className={buttonClass("outline", "md", "flex-1")}>
              Cancel
            </button>
            <button
              type="button"
              disabled={working}
              onClick={() =>
                startWorking(async () => {
                  if (!confirming) return;
                  const result = await setBlocked(confirming.userId, false);
                  if (result.ok) {
                    setUsers((prev) => prev.filter((u) => u.userId !== confirming.userId));
                    toast.success(`${nameOf(confirming)} unblocked`);
                  } else toast.error("Couldn't unblock", result.error);
                  setConfirming(null);
                })
              }
              className={buttonClass("primary", "md", "flex-1")}
            >
              Unblock
            </button>
          </div>
        }
      />
    </>
  );
}
