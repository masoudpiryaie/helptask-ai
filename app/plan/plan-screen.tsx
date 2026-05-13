"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { generateAiPlan } from "lib/ai/generate-ai-plan";
import { useTodayStore } from "lib/stores/today-store";
import { AiLoadingLogo } from "components/ui/ai-loading-logo";
import {
  ArrowRight,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useAuthStore } from "lib/stores/auth-store";
import { useTaskStore } from "lib/stores/task-store";
import { usePlanStore } from "lib/stores/plan-store";
import { useFocusStore } from "lib/stores/focus-store";
import { generateLocalDailyPlan } from "lib/planner/local-ai-planner";
import { saveCurrentPlanToFirestore } from "lib/firebase/ai-plan-service";
import { updateTaskStatusInFirestore } from "lib/firebase/task-service";
import { useUiStore } from "lib/stores/ui-store";
export function PlanScreen() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);

  const tasks = useTaskStore((state) => state.tasks);

  const currentPlan = usePlanStore((state) => state.currentPlan);
  const generatePlan = usePlanStore((state) => state.generatePlan);

  const startFocusTask = useFocusStore((state) => state.startFocusTask);

  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const mood = useTodayStore((state) => state.mood);
  const energyLevel = useTodayStore((state) => state.energyLevel);
  const wakeUpTime = useTodayStore((state) => state.wakeUpTime);
  const sleepTime = useTodayStore((state) => state.sleepTime);

  const setCurrentPlan = usePlanStore((state) => state.setCurrentPlan);

  const [isGenerating, setIsGenerating] = useState(false);
  const showToast = useUiStore((state) => state.showToast);
  const previewPlan = useMemo(() => {
    return generateLocalDailyPlan(tasks);
  }, [tasks]);

  const plan = currentPlan ?? previewPlan;

  async function handleRegenerate() {
    if (!user) return;

    setIsGenerating(true);

    try {
      const result = await generateAiPlan({
        tasks,
        mood,
        energyLevel,
        wakeUpTime,
        sleepTime,
        weather: {
          city: "Berlin",
          condition: "Cloudy",
          temperature: "8°C",
        },
      });

      setCurrentPlan(result.plan);
      await saveCurrentPlanToFirestore(user.uid, result.plan);
      showToast({
        type: result.usedFallback ? "info" : "success",
        message: result.usedFallback
          ? "I made a simple plan because AI was not available."
          : "Your AI plan is ready.",
      });
      if (result.plan.items.length > 0) {
        setOpenItemId(result.plan.items[0].id);
      }
    } catch (error) {
      console.error("Generate AI plan error:", error);
      const fallbackPlan = generatePlan(tasks);
      setCurrentPlan(fallbackPlan);
      await saveCurrentPlanToFirestore(user.uid, fallbackPlan);
      showToast({
        type: "info",
        message: "I made a simple plan so you can still start.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleAcceptPlan() {
    if (!user) return;
    if (!plan || plan.items.length === 0) return;

    try {
      await Promise.all(
        plan.items.map((item) =>
          updateTaskStatusInFirestore(user.uid, item.taskId, "scheduled"),
        ),
      );
      showToast({
        type: "success",
        message: "Plan accepted. Your tasks are scheduled.",
      });
    } catch (error) {
      showToast({
        type: "error",
        message: "Could not accept the plan. Please try again.",
      });
      console.error("Accept plan error:", error);
    }
  }

  async function handleMakeLighter() {
    if (!user) return;

    setIsGenerating(true);

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

    try {
      await saveCurrentPlanToFirestore(user.uid, lighterPlan);

      if (lighterPlan.items.length > 0) {
        setOpenItemId(lighterPlan.items[0].id);
      }
    } catch (error) {
      console.error("Save lighter plan error:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleStartPlanItem(taskId: string, minutes: number) {
    if (!user) return;

    try {
      await updateTaskStatusInFirestore(user.uid, taskId, "started");
      startFocusTask(taskId, minutes);
      router.push("/focus");
    } catch (error) {
      console.error("Start plan item error:", error);
    }
  }

  function toggleItem(itemId: string) {
    setOpenItemId((current) => (current === itemId ? null : itemId));
  }

  return (
    <div className="px-5 pb-28 pt-6 text-[#1F2937]">
      <header className="mb-6">
        <p className="text-sm font-medium text-[#4F8DFD]">Task AI</p>

        <h1 className="mt-1 text-[30px] font-bold tracking-[-0.03em]">
          Today&apos;s AI Plan
        </h1>

        <p className="mt-2 text-[15px] leading-6 text-[#6B7280]">
          A calm plan made from your tasks and current energy.
        </p>
      </header>
      {isGenerating ? (
        <section className="mb-5 rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <AiLoadingLogo
            size="md"
            label="AI is building a calm plan..."
            sublabel="Checking your tasks, energy, mood, and realistic time blocks."
          />
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FF]">
              <Sparkles size={22} className="animate-pulse text-[#4F8DFD]" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                AI is building a calm plan...
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                I am checking your tasks, energy, mood, and realistic time
                blocks.
              </p>
            </div>
          </div>
        </section>
      ) : null}
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
            disabled={isGenerating}
            className="mt-5 rounded-2xl bg-[#4F8DFD] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isGenerating ? "Building plan..." : "Build today&apos;s plan"}
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
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-sm font-semibold text-[#1F2937] shadow-sm disabled:opacity-60"
              >
                <Wand2 size={17} />
                {isGenerating ? "Adjusting..." : "Lighter"}
              </button>

              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-sm font-semibold text-[#1F2937] shadow-sm disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={isGenerating ? "animate-spin" : ""}
                />
                {isGenerating ? "Thinking..." : "Regenerate"}
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
