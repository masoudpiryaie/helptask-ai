"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "lib/stores/auth-store";
import { updateTaskInFirestore } from "lib/firebase/task-service";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Sparkles,
  Timer,
} from "lucide-react";
import { useTaskStore } from "lib/stores/task-store";
import type {
  TaskCategory,
  TaskDifficulty,
  TaskEnergy,
  TaskPriority,
} from "types/task";

type EditTaskScreenProps = {
  taskId: string;
};

const categories: TaskCategory[] = [
  "Study",
  "Work",
  "Home",
  "Health",
  "Personal",
  "Finance",
  "Errand",
];

const durationOptions = [10, 25, 45, 60];

const difficulties: TaskDifficulty[] = ["Easy", "Medium", "Hard"];

const energyLevels: TaskEnergy[] = ["Low", "Medium", "High"];

const priorities: TaskPriority[] = ["Low", "Normal", "High", "Urgent"];

function getDefaultAiSuggestion(
  category: TaskCategory,
  difficulty: TaskDifficulty,
  energyNeeded: TaskEnergy,
  estimatedMinutes: number,
) {
  if (category === "Study") {
    return "A 25-minute Pomodoro can make this easier to start.";
  }

  if (difficulty === "Hard") {
    return "Start with the smallest possible step. You do not need to finish it all now.";
  }

  if (estimatedMinutes <= 10) {
    return "This is short enough for a quick win.";
  }

  if (energyNeeded === "Low") {
    return "This can fit a lower-energy moment.";
  }

  return "AI will help you find a realistic time for this task.";
}

export function EditTaskScreen({ taskId }: EditTaskScreenProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const tasks = useTaskStore((state) => state.tasks);

  const task = useMemo(() => {
    return tasks.find((item) => item.id === taskId) || null;
  }, [tasks, taskId]);

  const [title, setTitle] = useState(task?.title || "");
  const [category, setCategory] = useState<TaskCategory>(
    task?.category || "Study",
  );
  const [hasFixedTime, setHasFixedTime] = useState(task?.hasFixedTime || false);
  const [fixedTimeLabel, setFixedTimeLabel] = useState(
    task?.fixedTimeLabel || "",
  );
  const [deadlineLabel, setDeadlineLabel] = useState(task?.deadlineLabel || "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    task?.estimatedMinutes || 25,
  );
  const [customDuration, setCustomDuration] = useState("");
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(
    task?.difficulty || "Medium",
  );
  const [energyNeeded, setEnergyNeeded] = useState<TaskEnergy>(
    task?.energyNeeded || "Medium",
  );
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority || "Normal",
  );
  const [error, setError] = useState("");

  function getFinalDuration() {
    if (!isCustomDuration) {
      return estimatedMinutes;
    }

    const parsed = Number(customDuration);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return estimatedMinutes;
    }

    return Math.min(Math.round(parsed), 240);
  }

  async function handleSave() {
    if (!task) return;

    if (!title.trim()) {
      setError("Please add a task title.");
      return;
    }

    if (!user) {
      setError("Please wait a moment and try again.");
      return;
    }

    const finalDuration = getFinalDuration();

    try {
      await updateTaskInFirestore(user.uid, task.id, {
        title,
        category,
        hasFixedTime,
        fixedTimeLabel: hasFixedTime
          ? fixedTimeLabel || "Fixed time"
          : undefined,
        deadlineLabel: deadlineLabel || "No deadline",
        estimatedMinutes: finalDuration,
        difficulty,
        energyNeeded,
        priority,
        aiSuggestion: getDefaultAiSuggestion(
          category,
          difficulty,
          energyNeeded,
          finalDuration,
        ),
      });

      router.push(`/tasks/${task.id}`);
    } catch (error) {
      console.error("Update task error:", error);
      setError("Could not save changes. Please try again.");
    }
  }

  if (!task) {
    return (
      <div className="px-5 pb-28 pt-6 text-[#1F2937]">
        <Link
          href="/tasks"
          className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white shadow-sm"
          aria-label="Back to tasks"
        >
          <ArrowLeft size={20} />
        </Link>

        <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold">Task not found</h1>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            This task may have been deleted.
          </p>

          <Link
            href="/tasks"
            className="mt-5 inline-flex rounded-2xl bg-[#4F8DFD] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to tasks
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="px-5 pb-28 pt-6 text-[#1F2937]">
      <header className="mb-6">
        <Link
          href={`/tasks/${task.id}`}
          className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white shadow-sm"
          aria-label="Back to task details"
        >
          <ArrowLeft size={20} />
        </Link>

        <p className="text-sm font-medium text-[#4F8DFD]">Task AI</p>
        <h1 className="mt-1 text-[30px] font-bold tracking-[-0.03em]">
          Edit task
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-[#6B7280]">
          Adjust the task so it feels realistic.
        </p>
      </header>

      <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <label className="text-sm font-semibold">Task title</label>

        <input
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setError("");
          }}
          placeholder="Example: Apply for one job"
          className="mt-3 w-full rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-[15px] outline-none transition focus:border-[#4F8DFD] focus:bg-white"
        />

        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}

        <div className="mt-5">
          <p className="text-sm font-semibold">Category</p>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  category === item
                    ? "border-[#4F8DFD] bg-[#EAF3FF] text-[#4F8DFD]"
                    : "border-[#E5E7EB] bg-white text-[#6B7280]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF3FF]">
            <Timer size={19} className="text-[#4F8DFD]" />
          </div>

          <div>
            <h2 className="text-[17px] font-semibold">Time</h2>
            <p className="text-sm text-[#6B7280]">
              Update the estimate if needed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {durationOptions.map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => {
                setEstimatedMinutes(duration);
                setIsCustomDuration(false);
              }}
              className={`rounded-2xl border px-2 py-3 text-sm font-semibold ${
                !isCustomDuration && estimatedMinutes === duration
                  ? "border-[#4F8DFD] bg-[#EAF3FF] text-[#4F8DFD]"
                  : "border-[#E5E7EB] bg-white text-[#6B7280]"
              }`}
            >
              {duration}
              <span className="block text-[11px] font-medium">min</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsCustomDuration(true)}
          className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${
            isCustomDuration
              ? "border-[#4F8DFD] bg-[#EAF3FF] text-[#4F8DFD]"
              : "border-[#E5E7EB] bg-white text-[#6B7280]"
          }`}
        >
          Custom duration
        </button>

        {isCustomDuration ? (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
            <Clock size={18} className="text-[#6B7280]" />
            <input
              value={customDuration}
              onChange={(event) => setCustomDuration(event.target.value)}
              inputMode="numeric"
              placeholder="Example: 90"
              className="w-full bg-transparent text-[15px] outline-none"
            />
            <span className="text-sm font-medium text-[#6B7280]">min</span>
          </div>
        ) : null}
      </section>

      <section className="mt-4 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50">
            <Calendar size={19} className="text-[#7C3AED]" />
          </div>

          <div>
            <h2 className="text-[17px] font-semibold">Schedule</h2>
            <p className="text-sm text-[#6B7280]">Keep it fixed or flexible.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setHasFixedTime(false)}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              !hasFixedTime
                ? "border-[#4F8DFD] bg-[#EAF3FF] text-[#4F8DFD]"
                : "border-[#E5E7EB] bg-white text-[#6B7280]"
            }`}
          >
            Flexible
          </button>

          <button
            type="button"
            onClick={() => setHasFixedTime(true)}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              hasFixedTime
                ? "border-[#4F8DFD] bg-[#EAF3FF] text-[#4F8DFD]"
                : "border-[#E5E7EB] bg-white text-[#6B7280]"
            }`}
          >
            Fixed time
          </button>
        </div>

        {hasFixedTime ? (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
            <Clock size={18} className="text-[#6B7280]" />
            <input
              value={fixedTimeLabel}
              onChange={(event) => setFixedTimeLabel(event.target.value)}
              placeholder="Example: 14:30"
              className="w-full bg-transparent text-[15px] outline-none"
            />
          </div>
        ) : (
          <div className="mt-3 rounded-2xl bg-[#EAF3FF] p-4">
            <div className="flex gap-3">
              <Sparkles size={18} className="mt-0.5 text-[#4F8DFD]" />
              <p className="text-sm leading-6 text-[#1F2937]">
                AI can suggest a calm time for this task.
              </p>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
          <Calendar size={18} className="text-[#6B7280]" />
          <input
            value={deadlineLabel}
            onChange={(event) => setDeadlineLabel(event.target.value)}
            placeholder="Deadline: Today, Friday, No deadline"
            className="w-full bg-transparent text-[15px] outline-none"
          />
        </div>
      </section>

      <section className="mt-4 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h2 className="text-[17px] font-semibold">Task effort</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          This helps AI choose a better time.
        </p>

        <div className="mt-5">
          <p className="text-sm font-semibold">Difficulty</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {difficulties.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDifficulty(item)}
                className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${
                  difficulty === item
                    ? "border-[#A78BFA] bg-purple-50 text-[#7C3AED]"
                    : "border-[#E5E7EB] bg-white text-[#6B7280]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold">Energy needed</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {energyLevels.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setEnergyNeeded(item)}
                className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${
                  energyNeeded === item
                    ? "border-[#64C59A] bg-green-50 text-[#2F946A]"
                    : "border-[#E5E7EB] bg-white text-[#6B7280]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold">Priority</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {priorities.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPriority(item)}
                className={`rounded-2xl border px-2 py-3 text-sm font-semibold ${
                  priority === item
                    ? "border-[#FDBA74] bg-orange-50 text-[#C76A21]"
                    : "border-[#E5E7EB] bg-white text-[#6B7280]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={handleSave}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4F8DFD] px-5 py-4 text-[15px] font-semibold text-white shadow-sm"
      >
        <Check size={18} />
        Save changes
      </button>
    </div>
  );
}
