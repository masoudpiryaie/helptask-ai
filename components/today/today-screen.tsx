"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "lib/stores/auth-store";
import { saveTodayCheckInToFirestore } from "lib/firebase/today-service";
import { saveCurrentPlanToFirestore } from "lib/firebase/ai-plan-service";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Cloud,
  ChevronDown,
  ChevronUp,
  Flame,
  Play,
  Sparkles,
  SunMedium,
  Timer,
} from "lucide-react";
import { useTaskStore } from "lib/stores/task-store";
import { useTodayStore } from "lib/stores/today-store";
import { usePlanStore } from "lib/stores/plan-store";
import { useFocusStore } from "lib/stores/focus-store";
import { useProgressStore } from "lib/stores/progress-store";
import {
  getNextBestTask,
  getNextBestTaskReason,
} from "lib/planner/next-best-task";
import type { EnergyLevel, Mood } from "types/today";
import type { Task } from "types/task";

const energyOptions: EnergyLevel[] = ["Low", "Okay", "Good"];

const moodOptions: Mood[] = [
  "Calm",
  "Tired",
  "Stressed",
  "Motivated",
  "Normal",
];

function isToday(dateText: string) {
  const date = new Date(dateText);
  const today = new Date();

  return date.toDateString() === today.toDateString();
}

function getFocusMinutesForToday(
  focusSessions: { completedAt: string; minutes: number }[],
) {
  return focusSessions
    .filter((session) => isToday(session.completedAt))
    .reduce((total, session) => total + session.minutes, 0);
}

function getFocusMinutes(task: Task) {
  if (task.category === "Study") return 25;

  return Math.min(task.estimatedMinutes, 45);
}

export function TodayScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const tasks = useTaskStore((state) => state.tasks);
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus);

  const mood = useTodayStore((state) => state.mood);
  const energyLevel = useTodayStore((state) => state.energyLevel);
  const setMood = useTodayStore((state) => state.setMood);
  const setEnergyLevel = useTodayStore((state) => state.setEnergyLevel);

  const generatePlan = usePlanStore((state) => state.generatePlan);
  const startFocusTask = useFocusStore((state) => state.startFocusTask);

  const focusSessions = useProgressStore((state) => state.focusSessions);

  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  const nextBestTask = useMemo(() => {
    return getNextBestTask(tasks, mood, energyLevel);
  }, [tasks, mood, energyLevel]);

  const nextBestTaskReason = useMemo(() => {
    if (!nextBestTask) return "";

    return getNextBestTaskReason(nextBestTask, mood, energyLevel);
  }, [nextBestTask, mood, energyLevel]);

  const todayStats = useMemo(() => {
    const startedTasks = tasks.filter(
      (task) => task.status === "started" || task.status === "done",
    );

    const completedTasks = tasks.filter((task) => task.status === "done");

    const focusMinutes = getFocusMinutesForToday(focusSessions);

    return {
      startedTasks: startedTasks.length,
      completedTasks: completedTasks.length,
      focusMinutes,
    };
  }, [tasks, focusSessions]);

  async function handleBuildPlan() {
    if (!user) return;

    const newPlan = generatePlan(tasks);

    try {
      await saveCurrentPlanToFirestore(user.uid, newPlan);
      router.push("/plan");
    } catch (error) {
      console.error("Build plan error:", error);
    }
  }

  function handleStartTask(task: Task) {
    const minutes = getFocusMinutes(task);

    updateTaskStatus(task.id, "started");
    startFocusTask(task.id, minutes);
    router.push("/focus");
  }
  async function handleEnergyChange(item: EnergyLevel) {
    setEnergyLevel(item);

    if (!user) return;

    try {
      await saveTodayCheckInToFirestore(user.uid, {
        energyLevel: item,
      });
    } catch (error) {
      console.error("Save energy error:", error);
    }
  }

  async function handleMoodChange(item: Mood) {
    setMood(item);

    if (!user) return;

    try {
      await saveTodayCheckInToFirestore(user.uid, {
        mood: item,
      });
    } catch (error) {
      console.error("Save mood error:", error);
    }
  }
  return (
    <div className="px-5 pb-28 pt-6 text-[#1F2937]">
      <header className="mb-6">
        <p className="text-sm font-medium text-[#4F8DFD]">MindTask AI</p>

        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[31px] font-bold tracking-[-0.03em]">
              Good morning, Eddi
            </h1>

            <p className="mt-2 text-[15px] leading-6 text-[#6B7280]">
              Today can be simple.
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <SunMedium size={22} className="text-[#FDBA74]" />
          </div>
        </div>
      </header>

      <section className="rounded-[32px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FF]">
            <Sparkles size={22} className="text-[#4F8DFD]" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">Your calm start</h2>

            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Energy: {energyLevel} · Mood: {mood}
            </p>

            <button
              type="button"
              onClick={() => setShowCheckIn((current) => !current)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#1F2937]"
            >
              Update check-in
              {showCheckIn ? (
                <ChevronUp size={17} />
              ) : (
                <ChevronDown size={17} />
              )}
            </button>
          </div>
        </div>

        {showCheckIn ? (
          <div className="mt-5 border-t border-[#E5E7EB] pt-5">
            <div>
              <p className="text-sm font-semibold">Energy</p>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {energyOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleEnergyChange(item)}
                    className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${
                      energyLevel === item
                        ? "border-[#4F8DFD] bg-[#EAF3FF] text-[#4F8DFD]"
                        : "border-[#E5E7EB] bg-white text-[#6B7280]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold">Mood</p>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {moodOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleMoodChange(item)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
                      mood === item
                        ? "border-[#A78BFA] bg-purple-50 text-[#7C3AED]"
                        : "border-[#E5E7EB] bg-white text-[#6B7280]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-4 rounded-[28px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FF]">
            <Cloud size={20} className="text-[#4F8DFD]" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Berlin · Cloudy · 8°C</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Good day for indoor focus tasks.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-[32px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50">
            <Play size={20} className="text-[#2F946A]" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Next best task</h2>
            <p className="text-sm text-[#6B7280]">
              A gentle suggestion for now.
            </p>
          </div>
        </div>

        {nextBestTask ? (
          <>
            <div className="rounded-2xl bg-[#F8FAFC] p-4">
              <h3 className="text-[17px] font-semibold">
                {nextBestTask.title}
              </h3>

              <p className="mt-1 text-sm text-[#6B7280]">
                {getFocusMinutes(nextBestTask)} min ·{" "}
                {nextBestTask.category === "Study" ? "Pomodoro" : "Focus"} ·{" "}
                {nextBestTask.category}
              </p>

              <button
                type="button"
                onClick={() => setShowWhy((current) => !current)}
                className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#4F8DFD]"
              >
                Why this task?
                {showWhy ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showWhy ? (
                <p className="mt-3 text-sm leading-6 text-[#6B7280]">
                  {nextBestTaskReason}
                </p>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleStartTask(nextBestTask)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#64C59A] px-4 py-4 text-[15px] font-semibold text-white"
              >
                Start small
                <Timer size={18} />
              </button>

              <button
                type="button"
                onClick={handleBuildPlan}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-[15px] font-semibold text-[#1F2937]"
              >
                Plan day
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-2xl bg-[#F8FAFC] p-4">
              <p className="text-sm leading-6 text-[#6B7280]">
                No active task for now. Add one small task when you are ready.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/tasks/new")}
              className="mt-4 w-full rounded-2xl bg-[#4F8DFD] px-5 py-4 text-[15px] font-semibold text-white"
            >
              Add a task
            </button>
          </>
        )}
      </section>

      <section className="mt-4 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50">
            <Flame size={20} className="text-[#C76A21]" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Small wins today</h2>
            <p className="text-sm text-[#6B7280]">
              Starting counts, not only finishing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-[#F8FAFC] p-4">
            <CalendarDays size={19} className="text-[#4F8DFD]" />
            <p className="mt-3 text-2xl font-bold">{todayStats.startedTasks}</p>
            <p className="mt-1 text-xs font-medium text-[#6B7280]">started</p>
          </div>

          <div className="rounded-2xl bg-[#F8FAFC] p-4">
            <CheckCircle2 size={19} className="text-[#64C59A]" />
            <p className="mt-3 text-2xl font-bold">
              {todayStats.completedTasks}
            </p>
            <p className="mt-1 text-xs font-medium text-[#6B7280]">done</p>
          </div>

          <div className="rounded-2xl bg-[#F8FAFC] p-4">
            <Timer size={19} className="text-[#A78BFA]" />
            <p className="mt-3 text-2xl font-bold">{todayStats.focusMinutes}</p>
            <p className="mt-1 text-xs font-medium text-[#6B7280]">minutes</p>
          </div>
        </div>
      </section>
    </div>
  );
}
