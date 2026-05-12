"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Gauge,
  Pencil,
  Play,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { useTaskStore } from "lib/stores/task-store";
import { useFocusStore } from "lib/stores/focus-store";
import type { Task, TaskStatus } from "types/task";

type TaskDetailScreenProps = {
  taskId: string;
};

function getFocusMinutes(task: Task) {
  if (task.category === "Study") return 25;

  return Math.min(task.estimatedMinutes, 45);
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
  if (status === "done") return "bg-green-50 text-[#2F946A]";
  if (status === "started") return "bg-[#EAF3FF] text-[#4F8DFD]";
  if (status === "scheduled") return "bg-purple-50 text-[#7C3AED]";
  if (status === "skipped") return "bg-orange-50 text-[#C76A21]";

  return "bg-[#F8FAFC] text-[#6B7280]";
}

export function TaskDetailScreen({ taskId }: TaskDetailScreenProps) {
  const router = useRouter();

  const tasks = useTaskStore((state) => state.tasks);
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const startFocusTask = useFocusStore((state) => state.startFocusTask);

  const task = tasks.find((item) => item.id === taskId);

  function handleStartTask(currentTask: Task) {
    const minutes = getFocusMinutes(currentTask);

    updateTaskStatus(currentTask.id, "started");
    startFocusTask(currentTask.id, minutes);
    router.push("/focus");
  }

  function handleScheduleTask(currentTask: Task) {
    updateTaskStatus(currentTask.id, "scheduled");
  }

  function handleMarkDone(currentTask: Task) {
    updateTaskStatus(currentTask.id, "done");
  }

  function handleUndoDone(currentTask: Task) {
    updateTaskStatus(currentTask.id, "pending");
  }

  function handleDelete(currentTask: Task) {
    deleteTask(currentTask.id);
    router.push("/tasks");
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

  const isDone = task.status === "done";

  return (
    <div className="px-5 pb-28 pt-6 text-[#1F2937]">
      <header className="mb-6">
        <Link
          href="/tasks"
          className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white shadow-sm"
          aria-label="Back to tasks"
        >
          <ArrowLeft size={20} />
        </Link>

        <p className="text-sm font-medium text-[#4F8DFD]">MindTask AI</p>

        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1
              className={`text-[30px] font-bold tracking-[-0.03em] ${
                isDone ? "text-[#2F946A] line-through" : ""
              }`}
            >
              {task.title}
            </h1>

            <p className="mt-2 text-[15px] leading-6 text-[#6B7280]">
              {task.category} · {task.estimatedMinutes} min
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(
              task.status,
            )}`}
          >
            {getStatusLabel(task.status)}
          </span>
        </div>
      </header>

      <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#F8FAFC] p-4">
            <Clock size={20} className="text-[#4F8DFD]" />
            <p className="mt-3 text-sm font-semibold">Duration</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              {task.estimatedMinutes} min
            </p>
          </div>

          <div className="rounded-2xl bg-[#F8FAFC] p-4">
            <Calendar size={20} className="text-[#A78BFA]" />
            <p className="mt-3 text-sm font-semibold">
              {task.hasFixedTime ? "Fixed time" : "Deadline"}
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">
              {task.hasFixedTime
                ? task.fixedTimeLabel || "Fixed time"
                : task.deadlineLabel || "No deadline"}
            </p>
          </div>

          <div className="rounded-2xl bg-[#F8FAFC] p-4">
            <Gauge size={20} className="text-[#FDBA74]" />
            <p className="mt-3 text-sm font-semibold">Difficulty</p>
            <p className="mt-1 text-sm text-[#6B7280]">{task.difficulty}</p>
          </div>

          <div className="rounded-2xl bg-[#F8FAFC] p-4">
            <Zap size={20} className="text-[#64C59A]" />
            <p className="mt-3 text-sm font-semibold">Energy</p>
            <p className="mt-1 text-sm text-[#6B7280]">{task.energyNeeded}</p>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50">
            <Flame size={20} className="text-[#C76A21]" />
          </div>

          <div>
            <h2 className="text-[17px] font-semibold">Priority</h2>
            <p className="mt-1 text-sm leading-6 text-[#6B7280]">
              {task.priority}
            </p>
          </div>
        </div>
      </section>

      {task.aiSuggestion ? (
        <section className="mt-4 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FF]">
              <Sparkles size={20} className="text-[#4F8DFD]" />
            </div>

            <div>
              <h2 className="text-[17px] font-semibold">AI suggestion</h2>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                {task.aiSuggestion}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-5 grid gap-3">
        {isDone ? (
          <button
            type="button"
            onClick={() => handleUndoDone(task)}
            className="rounded-2xl bg-[#4F8DFD] px-5 py-4 text-[15px] font-semibold text-white"
          >
            Undo done
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => handleStartTask(task)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#4F8DFD] px-5 py-4 text-[15px] font-semibold text-white"
            >
              <Play size={18} />
              {task.status === "started" ? "Continue focus" : "Start focus"}
            </button>

            <button
              type="button"
              onClick={() => handleMarkDone(task)}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 text-[15px] font-semibold text-[#1F2937]"
            >
              <CheckCircle2 size={18} />
              Mark as done
            </button>

            {!task.hasFixedTime && task.status !== "scheduled" ? (
              <button
                type="button"
                onClick={() => handleScheduleTask(task)}
                className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 text-[15px] font-semibold text-[#1F2937]"
              >
                Schedule task
              </button>
            ) : null}
          </>
        )}

        <Link
          href={`/tasks/${task.id}/edit`}
          className="flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 text-[15px] font-semibold text-[#1F2937]"
        >
          <Pencil size={18} />
          Edit task
        </Link>

        <button
          type="button"
          onClick={() => handleDelete(task)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-[15px] font-semibold text-red-500"
        >
          <Trash2 size={18} />
          Delete task
        </button>
      </section>
    </div>
  );
}
