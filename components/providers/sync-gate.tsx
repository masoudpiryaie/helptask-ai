"use client";

import { Sparkles } from "lucide-react";
import { useAuthStore } from "lib/stores/auth-store";
import { useTaskStore } from "lib/stores/task-store";
import { useProgressStore } from "lib/stores/progress-store";
import { useTodayStore } from "lib/stores/today-store";
import { usePlanStore } from "lib/stores/plan-store";
import type { ReactNode } from "react";

type SyncGateProps = {
  children: ReactNode;
};

export function SyncGate({ children }: SyncGateProps) {
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const isTaskSyncReady = useTaskStore((state) => state.isTaskSyncReady);
  const isProgressSyncReady = useProgressStore(
    (state) => state.isProgressSyncReady,
  );
  const isTodaySyncReady = useTodayStore((state) => state.isTodaySyncReady);
  const isPlanSyncReady = usePlanStore((state) => state.isPlanSyncReady);

  const isReady =
    isAuthReady &&
    isTaskSyncReady &&
    isProgressSyncReady &&
    isTodaySyncReady &&
    isPlanSyncReady;

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#EAF3FF] px-6 py-10 text-[#1F2937]">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[430px] items-center justify-center rounded-[32px] bg-[#F8FAFC] shadow-sm">
          <div className="px-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm">
              <Sparkles size={28} className="text-[#4F8DFD]" />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-[-0.03em]">
              MindTask AI
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#6B7280]">
              Preparing your calm workspace.
            </p>

            <div className="mx-auto mt-6 h-2 w-32 overflow-hidden rounded-full bg-[#EAF3FF]">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[#4F8DFD]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
