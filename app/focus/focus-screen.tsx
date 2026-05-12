"use client";
// import { useProgressStore } from "lib/stores/progress-store";
// import type { FocusFeedback } from "types/progress";
import { useEffect, useMemo, useState } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Timer,
  Wind,
} from "lucide-react";
import { useTaskStore } from "lib/stores/task-store";
import { useFocusStore } from "lib/stores/focus-store";
import type { Task } from "types/task";
import { useProgressStore } from "lib/stores/progress-store";
import { FocusFeedback } from "types/progress";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

type FocusTimerProps = {
  currentTask: Task;
  sessionMinutes: number;
};

function FocusTimer({ currentTask, sessionMinutes }: FocusTimerProps) {
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus);
  const addFocusSession = useProgressStore((state) => state.addFocusSession);
  const clearFocusTask = useFocusStore((state) => state.clearFocusTask);
  const setSessionMinutes = useFocusStore((state) => state.setSessionMinutes);

  const initialSeconds = sessionMinutes * 60;

  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [focusFeedback, setFocusFeedback] = useState<FocusFeedback | null>(
    null,
  );
  useEffect(() => {
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft === 0) {
      setIsRunning(false);
    }
  }, [secondsLeft]);

  function handleStartPause() {
    setIsRunning((current) => !current);
  }

  function handleReset() {
    setIsRunning(false);
    setSecondsLeft(initialSeconds);
  }

  function handleFinish() {
    updateTaskStatus(currentTask.id, "done");

    addFocusSession({
      taskId: currentTask.id,
      taskTitle: currentTask.title,
      minutes: sessionMinutes,
      feedback: focusFeedback || undefined,
    });

    setIsRunning(false);
    clearFocusTask();
  }

  function handleTakeBreak() {
    setSessionMinutes(5);
  }

  function handleContinueFiveMinutes() {
    setSessionMinutes(5);
  }

  const progress = initialSeconds > 0 ? 1 - secondsLeft / initialSeconds : 0;

  const progressPercent = Math.min(Math.max(progress * 100, 0), 100);
  const feedbackOptions: FocusFeedback[] = [
    "Easy",
    "Okay",
    "Hard",
    "Could not focus",
  ];
  return (
    <>
      <section className="rounded-[32px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="rounded-[26px] bg-[#EAF3FF] p-5">
          <p className="text-sm font-semibold text-[#4F8DFD]">Current task</p>

          <h2 className="mt-2 text-[20px] font-bold leading-7">
            {currentTask.title}
          </h2>

          <p className="mt-2 text-sm text-[#6B7280]">
            {currentTask.category === "Study" ? "Pomodoro" : "Focus session"} ·{" "}
            {currentTask.category}
          </p>
        </div>

        <div className="mt-8 text-center">
          <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full border-[12px] border-[#EAF3FF] bg-white shadow-sm">
            <div>
              <p className="text-[48px] font-bold tracking-[-0.05em]">
                {formatTime(secondsLeft)}
              </p>

              <p className="mt-2 text-sm font-medium text-[#6B7280]">
                Focus session 1 of 4
              </p>
            </div>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#EAF3FF]">
            <div
              className="h-full rounded-full bg-[#4F8DFD] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleStartPause}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#4F8DFD] px-4 py-4 text-[15px] font-semibold text-white"
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
            {isRunning ? "Pause focus" : "Start focus"}
          </button>

          <button
            type="button"
            onClick={handleFinish}
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-[15px] font-semibold text-[#1F2937]"
          >
            <Square size={17} />
            Finish
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-[15px] font-semibold text-[#1F2937]"
        >
          <RotateCcw size={17} />
          Reset
        </button>
      </section>

      <section className="mt-5 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50">
            <Wind size={20} className="text-[#C76A21]" />
          </div>

          <div>
            <h2 className="text-[17px] font-semibold">I got distracted</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              It happens. Take one breath and continue for 5 more minutes.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinueFiveMinutes}
          className="mt-4 w-full rounded-2xl bg-[#FDBA74] px-4 py-3 text-sm font-semibold text-white"
        >
          Continue for 5 more minutes
        </button>
      </section>

      <section className="mt-5 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Sparkles size={19} className="text-[#4F8DFD]" />
          <h2 className="text-[17px] font-semibold">How did it feel?</h2>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {feedbackOptions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFocusFeedback(item)}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                focusFeedback === item
                  ? "border-[#4F8DFD] bg-[#EAF3FF] text-[#4F8DFD]"
                  : "border-[#E5E7EB] bg-white text-[#6B7280]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleTakeBreak}
            className="rounded-2xl border border-[#E5E7EB] bg-white px-3 py-3 text-sm font-semibold text-[#1F2937]"
          >
            Take a break
          </button>

          <button
            type="button"
            onClick={handleContinueFiveMinutes}
            className="rounded-2xl border border-[#E5E7EB] bg-white px-3 py-3 text-sm font-semibold text-[#1F2937]"
          >
            Continue
          </button>

          <button
            type="button"
            onClick={handleFinish}
            className="rounded-2xl border border-[#E5E7EB] bg-white px-3 py-3 text-sm font-semibold text-[#1F2937]"
          >
            Stop today
          </button>
        </div>
      </section>
    </>
  );
}

export function FocusScreen() {
  const tasks = useTaskStore((state) => state.tasks);
  const currentTaskId = useFocusStore((state) => state.currentTaskId);
  const sessionMinutes = useFocusStore((state) => state.sessionMinutes);

  const currentTask = useMemo(() => {
    return tasks.find((task) => task.id === currentTaskId) || null;
  }, [tasks, currentTaskId]);

  if (!currentTask) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] px-5 pb-28 pt-6 text-[#1F2937]">
        <header className="mb-6">
          <p className="text-sm font-medium text-[#4F8DFD]">MindTask AI</p>
          <h1 className="mt-1 text-[32px] font-bold tracking-[-0.03em]">
            Focus Mode
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-[#6B7280]">
            Choose a task first, then start with one calm focus session.
          </p>
        </header>

        <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3FF]">
            <Timer size={24} className="text-[#4F8DFD]" />
          </div>

          <h2 className="mt-5 text-lg font-semibold">No focus task selected</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Go to Tasks or Plan and tap Start. I will bring the task here.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-5 pb-28 pt-6 text-[#1F2937]">
      <header className="mb-6">
        <p className="text-sm font-medium text-[#4F8DFD]">MindTask AI</p>
        <h1 className="mt-1 text-[32px] font-bold tracking-[-0.03em]">
          Focus Mode
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-[#6B7280]">
          Start small. Staying for a few minutes already counts.
        </p>
      </header>

      <FocusTimer
        key={`${currentTask.id}-${sessionMinutes}`}
        currentTask={currentTask}
        sessionMinutes={sessionMinutes}
      />
    </main>
  );
}
