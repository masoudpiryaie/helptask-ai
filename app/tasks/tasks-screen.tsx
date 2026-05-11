import Link from "next/link";
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  HeartPulse,
  Home,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Play,
  BrushCleaning,
  Brain,
} from "lucide-react";

import { mockTasks } from "@/data/mock-tasks";
import { Task, TaskCategory } from "@/types/task";

const filters = [
  "All",
  "Today",
  "Flexible",
  "Fixed",
  "Study",
  "Work",
  "Personal",
];

export function TasksScreen() {
  return (
    <div className="space-y-5">
      <Header />

      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[34px] font-bold leading-tight tracking-[-0.04em] text-[#111827]">
            My Tasks
          </h1>
          <p className="mt-1 text-lg text-[#6B7280]">
            Keep everything in one calm place.
          </p>
        </div>

        <Link
          href="/tasks/new"
          className="mt-1 flex h-12 shrink-0 items-center justify-center gap-2 rounded-[18px] bg-[#4F8DFD] px-4 font-semibold text-white shadow-[0_10px_24px_rgba(79,141,253,0.30)]"
        >
          <Plus size={20} />
          Add
        </Link>
      </section>

      <FilterChips />
      <SearchBar />

      <section className="space-y-4">
        {mockTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </section>
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Brain className="text-[#4F8DFD]" size={30} />
        <p className="text-xl font-bold">
          MindTask <span className="text-[#4F8DFD]">AI</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-full bg-white p-2 shadow-sm">
          <Bell size={22} className="text-[#4B5563]" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#4F8DFD]" />
        </button>

        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#EAF3FF] to-[#F3E8FF] p-1">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-[#4F8DFD]">
            S
          </div>
        </div>
      </div>
    </header>
  );
}

function FilterChips() {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <div className="flex gap-2">
        {filters.map((filter) => {
          const active = filter === "All";

          return (
            <button
              key={filter}
              className={`h-11 shrink-0 rounded-full border px-5 text-sm font-semibold ${
                active
                  ? "border-[#4F8DFD] bg-[#4F8DFD] text-white"
                  : "border-[#E5E7EB] bg-white text-[#4B5563]"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SearchBar() {
  return (
    <div className="flex gap-3">
      <div className="flex h-14 flex-1 items-center gap-3 rounded-[20px] border border-[#E5E7EB] bg-white px-4">
        <Search size={22} className="text-[#6B7280]" />
        <input
          placeholder="Search tasks..."
          className="w-full bg-transparent text-base outline-none placeholder:text-[#9CA3AF]"
        />
      </div>

      <button className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-[#E5E7EB] bg-white">
        <SlidersHorizontal size={22} className="text-[#6B7280]" />
      </button>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const Icon = getCategoryIcon(task.category);
  const colors = getCategoryColors(task.category);

  return (
    <article className="rounded-[24px] border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="flex gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${colors.iconBg}`}
        >
          <Icon size={28} className={colors.iconText} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold leading-tight tracking-[-0.03em] text-[#111827]">
                {task.title}
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                {task.category}
                {" · "}
                {task.hasFixedTime
                  ? task.fixedTimeLabel
                  : `${task.estimatedMinutes} min`}
                {" · "}
                {task.energyNeeded} energy
              </p>
            </div>

            <button className="rounded-full p-1 text-[#6B7280]">
              <MoreHorizontal size={22} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {task.hasFixedTime ? (
              <Badge type="fixed" label="Fixed" />
            ) : (
              <Badge type="flexible" label="Flexible" />
            )}

            {task.deadlineLabel && (
              <Badge
                type="deadline"
                label={`Deadline: ${task.deadlineLabel}`}
              />
            )}
          </div>

          {task.aiSuggestion && (
            <div className="mt-4 flex items-center justify-between rounded-[16px] border border-[#D7E6FF] bg-[#F4F8FF] px-3 py-3">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles size={17} className="text-[#4F8DFD]" />
                <span className="font-semibold text-[#4F8DFD]">
                  AI suggestion:
                </span>
                <span className="text-[#6B7280]">{task.aiSuggestion}</span>
              </div>
              <span className="text-[#6B7280]">›</span>
            </div>
          )}

          {!task.hasFixedTime && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#4F8DFD] font-semibold text-white shadow-[0_8px_18px_rgba(79,141,253,0.25)]">
                <Play size={16} fill="white" />
                Start
              </button>

              <button className="flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[#E5E7EB] bg-white font-semibold text-[#4B5563]">
                <CalendarDays size={18} />
                Schedule
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function Badge({
  type,
  label,
}: {
  type: "flexible" | "deadline" | "fixed";
  label: string;
}) {
  const styles = {
    flexible: "border-[#DDD6FE] bg-[#FAF5FF] text-[#7C3AED]",
    deadline: "border-[#FED7AA] bg-[#FFF7ED] text-[#EA580C]",
    fixed: "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[type]}`}
    >
      {label}
    </span>
  );
}

function getCategoryIcon(category: TaskCategory) {
  const icons = {
    Study: BookOpen,
    Work: BriefcaseBusiness,
    Home: BrushCleaning,
    Health: HeartPulse,
    Personal: CheckCircle2,
    Finance: CalendarDays,
    Errand: Home,
  };

  return icons[category];
}

function getCategoryColors(category: TaskCategory) {
  const colors = {
    Study: {
      iconBg: "bg-[#EAF7EF]",
      iconText: "text-[#2F9461]",
    },
    Work: {
      iconBg: "bg-[#EAF3FF]",
      iconText: "text-[#4F8DFD]",
    },
    Home: {
      iconBg: "bg-[#FFF3DD]",
      iconText: "text-[#F59E0B]",
    },
    Health: {
      iconBg: "bg-[#FCE7F3]",
      iconText: "text-[#EC4899]",
    },
    Personal: {
      iconBg: "bg-[#F3E8FF]",
      iconText: "text-[#7C3AED]",
    },
    Finance: {
      iconBg: "bg-[#DCFCE7]",
      iconText: "text-[#16A34A]",
    },
    Errand: {
      iconBg: "bg-[#F3E8FF]",
      iconText: "text-[#7C3AED]",
    },
  };

  return colors[category];
}
