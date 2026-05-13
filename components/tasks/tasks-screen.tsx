"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "lib/stores/auth-store";
import {
  deleteTaskFromFirestore,
  updateTaskStatusInFirestore,
} from "lib/firebase/task-service";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Home,
  Plus,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import { useTaskStore } from "lib/stores/task-store";
import { useFocusStore } from "lib/stores/focus-store";
import type { Task, TaskCategory, TaskStatus } from "types/task";

type Filter =
  | "All"
  | "Today"
  | "Flexible"
  | "Fixed"
  | "Started"
  | "Done"
  | "Study"
  | "Work";

const filters: Filter[] = [
  "All",
  "Today",
  "Flexible",
  "Fixed",
  "Started",
  "Done",
  "Study",
  "Work",
];

function getCategoryIcon(category: TaskCategory) {
  const className = "text-[#4F8DFD]";

  switch (category) {
    case "Study":
      return <GraduationCap size={18} className={className} />;
    case "Work":
      return <Briefcase size={18} className={className} />;
    case "Home":
      return <Home size={18} className={className} />;
    case "Health":
      return <HeartPulse size={18} className={className} />;
    case "Finance":
      return <Wallet size={18} className={className} />;
    case "Personal":
      return <Dumbbell size={18} className={className} />;
    case "Errand":
      return <Clock size={18} className={className} />;
    default:
      return <CheckCircle2 size={18} className={className} />;
  }
}

function matchesFilter(task: Task, filter: Filter) {
  if (filter === "All") return true;
  if (filter === "Today") return task.deadlineLabel?.toLowerCase() === "today";
  if (filter === "Flexible") return !task.hasFixedTime;
  if (filter === "Fixed") return task.hasFixedTime;
  if (filter === "Started") return task.status === "started";
  if (filter === "Done") return task.status === "done";
  if (filter === "Study") return task.category === "Study";
  if (filter === "Work") return task.category === "Work";

  return true;
}

function getStatusLabel(status: TaskStatus) {
  if (status === "pending") return "Pending";
  if (status === "scheduled") return "Scheduled";
  if (status === "started") return "Started";
  if (status === "done") return "Done";
  if (status === "skipped") return "Skipped";

  return "Pending";
}

function getStatusClassName(status: TaskStatus) {
  if (status === "done") {
    return "bg-green-50 text-[#2F946A]";
  }

  if (status === "started") {
    return "bg-[#EAF3FF] text-[#4F8DFD]";
  }

  if (status === "scheduled") {
    return "bg-purple-50 text-[#7C3AED]";
  }

  if (status === "skipped") {
    return "bg-orange-50 text-[#C76A21]";
  }

  return "bg-[#F8FAFC] text-[#6B7280]";
}

function getFocusMinutes(task: Task) {
  if (task.category === "Study") return 25;

  return Math.min(task.estimatedMinutes, 45);
}

function getTimeLabel(task: Task) {
  if (task.hasFixedTime) {
    return task.fixedTimeLabel || "Fixed time";
  }

  return task.deadlineLabel || "Flexible";
}

function getTaskMeta(task: Task) {
  const method = task.category === "Study" ? "Pomodoro" : "Focus";
  const timeLabel = getTimeLabel(task);

  return `${task.estimatedMinutes} min · ${method} · ${timeLabel}`;
}

export function TasksScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const tasks = useTaskStore((state) => state.tasks);

  const startFocusTask = useFocusStore((state) => state.startFocusTask);

  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const filterMatch = matchesFilter(task, activeFilter);
      const searchMatch = task.title
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      return filterMatch && searchMatch;
    });
  }, [tasks, activeFilter, search]);

  async function handleStartTask(task: Task) {
    if (!user) return;

    const minutes = getFocusMinutes(task);

    try {
      await updateTaskStatusInFirestore(user.uid, task.id, "started");
      startFocusTask(task.id, minutes);
      router.push("/focus");
    } catch (error) {
      console.error("Start task error:", error);
    }
  }

  async function handleScheduleTask(task: Task) {
    if (!user) return;

    try {
      await updateTaskStatusInFirestore(user.uid, task.id, "scheduled");
    } catch (error) {
      console.error("Schedule task error:", error);
    }
  }

  async function handleUndoDone(task: Task) {
    if (!user) return;

    try {
      await updateTaskStatusInFirestore(user.uid, task.id, "pending");
    } catch (error) {
      console.error("Undo task error:", error);
    }
  }

  async function handleDeleteTask(task: Task) {
    if (!user) return;

    try {
      await deleteTaskFromFirestore(user.uid, task.id);
    } catch (error) {
      console.error("Delete task error:", error);
    }
  }

  return (
    <div className="px-5 pb-28 pt-6 text-[#1F2937]">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#4F8DFD]">Task AI</p>

            <h1 className="mt-1 text-[32px] font-bold tracking-[-0.03em]">
              My Tasks
            </h1>

            <p className="mt-2 text-[15px] leading-6 text-[#6B7280]">
              Keep everything in one calm place.
            </p>
          </div>

          <Link
            href="/tasks/new"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4F8DFD] text-white shadow-sm"
            aria-label="Add task"
          >
            <Plus size={22} />
          </Link>
        </div>
      </header>

      <section className="mb-5">
        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeFilter === filter
                  ? "border-[#4F8DFD] bg-[#EAF3FF] text-[#4F8DFD]"
                  : "border-[#E5E7EB] bg-white text-[#6B7280]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
          <Search size={18} className="text-[#6B7280]" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks"
            className="w-full bg-transparent text-[15px] outline-none"
          />
        </div>
      </section>

      <section className="grid gap-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 text-center shadow-sm">
            <p className="text-base font-semibold">No tasks found</p>

            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Add one small task and start calmly.
            </p>

            <Link
              href="/tasks/new"
              className="mt-5 inline-flex rounded-2xl bg-[#4F8DFD] px-5 py-3 text-sm font-semibold text-white"
            >
              Add task
            </Link>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === "done";
            const isStarted = task.status === "started";

            return (
              <article
                key={task.id}
                className={`rounded-[24px] border p-4 shadow-sm transition ${
                  isDone
                    ? "border-green-100 bg-green-50/40"
                    : "border-[#E5E7EB] bg-white"
                }`}
              >
                <div className="flex gap-3">
                  <Link
                    href={`/tasks/${task.id}`}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                      isDone ? "bg-white" : "bg-[#EAF3FF]"
                    }`}
                    aria-label={`Open ${task.title}`}
                  >
                    {isDone ? (
                      <CheckCircle2 size={18} className="text-[#2F946A]" />
                    ) : (
                      getCategoryIcon(task.category)
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/tasks/${task.id}`} className="min-w-0">
                        <h2
                          className={`truncate text-[16px] font-semibold leading-6 ${
                            isDone ? "text-[#2F946A] line-through" : ""
                          }`}
                        >
                          {task.title}
                        </h2>

                        <p className="mt-1 text-sm text-[#6B7280]">
                          {getTaskMeta(task)}
                        </p>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task)}
                        className="shrink-0 rounded-full p-2 text-[#9CA3AF] transition hover:bg-[#F8FAFC]"
                        aria-label="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(
                          task.status,
                        )}`}
                      >
                        {getStatusLabel(task.status)}
                      </span>

                      <div className="flex shrink-0 gap-2">
                        {isDone ? (
                          <button
                            type="button"
                            onClick={() => handleUndoDone(task)}
                            className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#1F2937]"
                          >
                            Undo
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartTask(task)}
                              className="rounded-full bg-[#4F8DFD] px-4 py-2 text-xs font-semibold text-white"
                            >
                              {isStarted ? "Continue" : "Start"}
                            </button>

                            {!task.hasFixedTime &&
                            task.status !== "scheduled" ? (
                              <button
                                type="button"
                                onClick={() => handleScheduleTask(task)}
                                className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#1F2937]"
                              >
                                Schedule
                              </button>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
