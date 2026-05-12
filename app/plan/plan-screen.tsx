"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useTaskStore } from "lib/stores/task-store";
import { usePlanStore } from "lib/stores/plan-store";
import { useFocusStore } from "lib/stores/focus-store";
import { generateLocalDailyPlan } from "lib/planner/local-ai-planner";

export function PlanScreen() {
  const router = useRouter();

  const tasks = useTaskStore((state) => state.tasks);
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus);

  const currentPlan = usePlanStore((state) => state.currentPlan);
  const generatePlan = usePlanStore((state) => state.generatePlan);

  const startFocusTask = useFocusStore((state) => state.startFocusTask);

  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const previewPlan = useMemo(() => {
    return generateLocalDailyPlan(tasks);
  }, [tasks]);

  const plan = currentPlan ?? previewPlan;

  function handleRegenerate() {
    const newPlan = generatePlan(tasks);

    if (newPlan.items.length > 0) {
      setOpenItemId(newPlan.items[0].id);
    }
  }

  function handleAcceptPlan() {
    plan.items.forEach((item) => {
      updateTaskStatus(item.taskId, "scheduled");
    });
  }

  function handleMakeLighter() {
    const lightTasks = tasks.filter(
      (task) =>
        task.status !== "done" &&
        !task.hasFixedTime &&
        (task.energyNeeded === "Low" ||
          task.estimatedMinutes <= 25 ||
          task.difficulty === "Easy"),
    );

    const lighterPlan = generatePlan(
      lightTasks.length > 0 ? lightTasks : tasks,
    );

    if (lighterPlan.items.length > 0) {
      setOpenItemId(lighterPlan.items[0].id);
    }
  }

  function handleStartPlanItem(taskId: string, minutes: number) {
    updateTaskStatus(taskId, "started");
    startFocusTask(taskId, minutes);
    router.push("/focus");
  }

  function toggleItem(itemId: string) {
    setOpenItemId((current) => (current === itemId ? null : itemId));
  }

  return (
    <div className="px-5 pb-28 pt-6 text-[#1F2937]">
      <header className="mb-6">
        <p className="text-sm font-medium text-[#4F8DFD]">MindTask AI</p>

        <h1 className="mt-1 text-[30px] font-bold tracking-[-0.03em]">
          Today&apos;s AI Plan
        </h1>

        <p className="mt-2 text-[15px] leading-6 text-[#6B7280]">
          A calm plan made from your tasks and current energy.
        </p>
      </header>

      {plan.items.length === 0 ? (
        <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3FF]">
            <Sparkles size={24} className="text-[#4F8DFD]" />
          </div>

          <h2 className="mt-5 text-lg font-semibold">No plan yet</h2>

          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Add some flexible tasks first, then I can build a realistic plan for
            your day.
          </p>

          <button
            type="button"
            onClick={handleRegenerate}
            className="mt-5 rounded-2xl bg-[#4F8DFD] px-5 py-3 text-sm font-semibold text-white"
          >
            Build today&apos;s plan
          </button>
        </section>
      ) : (
        <>
          <section className="mb-5 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FF]">
                <CalendarCheck size={22} className="text-[#4F8DFD]" />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold">{plan.title}</h2>

                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  {plan.importantTasks} important tasks · {plan.shortBreaks}{" "}
                  short breaks · {plan.backupTasks} backup task
                </p>

                <p className="mt-3 text-sm leading-6 text-[#1F2937]">
                  {plan.summary}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-3">
            {plan.items.map((item) => {
              const isOpen = openItemId === item.id;

              return (
                <article
                  key={item.id}
                  className="rounded-[24px] border border-[#E5E7EB] bg-white p-4 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="flex w-full items-start justify-between gap-4 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#4F8DFD]">
                        {item.startTime} - {item.endTime}
                      </p>

                      <h2 className="mt-1 truncate text-[16px] font-semibold leading-6">
                        {item.title}
                      </h2>

                      <p className="mt-1 text-sm text-[#6B7280]">
                        {item.durationMinutes} min · {item.method} ·{" "}
                        {item.category}
                      </p>
                    </div>

                    <div className="mt-1 shrink-0 rounded-full bg-[#F8FAFC] p-2 text-[#6B7280]">
                      {isOpen ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                  </button>

                  {isOpen ? (
                    <div className="mt-4 rounded-2xl bg-[#F8FAFC] p-4">
                      <div className="flex gap-3">
                        <Sparkles
                          size={17}
                          className="mt-0.5 shrink-0 text-[#4F8DFD]"
                        />

                        <div>
                          <p className="text-sm font-semibold">Why now?</p>
                          <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                            {item.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleStartPlanItem(item.taskId, item.durationMinutes)
                      }
                      className="rounded-full bg-[#4F8DFD] px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Start
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#1F2937]"
                    >
                      {isOpen ? "Hide why" : "Why now?"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={handleAcceptPlan}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#4F8DFD] px-5 py-4 text-[15px] font-semibold text-white shadow-sm"
            >
              Accept plan
              <ArrowRight size={18} />
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleMakeLighter}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-sm font-semibold text-[#1F2937] shadow-sm"
              >
                <Wand2 size={17} />
                Lighter
              </button>

              <button
                type="button"
                onClick={handleRegenerate}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-sm font-semibold text-[#1F2937] shadow-sm"
              >
                <RefreshCw size={17} />
                Regenerate
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
