import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Clock,
  DollarSign,
  Flag,
  Grid2X2,
  Heart,
  Home,
  ListChecks,
  ShoppingCart,
  Sparkles,
  User,
  Zap,
  BarChart3,
} from "lucide-react";

const categories = [
  { label: "Study", icon: BookOpen },
  { label: "Work", icon: BriefcaseBusiness },
  { label: "Home", icon: Home },
  { label: "Health", icon: Heart },
  { label: "Personal", icon: User },
  { label: "Finance", icon: DollarSign },
  { label: "Errand", icon: ShoppingCart },
];

const durations = ["10 min", "25 min", "45 min", "60 min", "Custom"];
const difficulties = ["Easy", "Medium", "Hard"];
const energyLevels = ["Low", "Medium", "High"];
const priorities = ["Low", "Normal", "High", "Urgent"];

export function AddTaskScreen() {
  return (
    <div className="space-y-5">
      <header className="relative flex items-center justify-center">
        <Link
          href="/tasks"
          className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-[18px] bg-white shadow-sm"
        >
          <ArrowLeft size={22} className="text-[#374151]" />
        </Link>

        <div className="text-center">
          <h1 className="text-[30px] font-bold tracking-[-0.04em] text-[#111827]">
            Add a new task
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            You can keep it simple. AI can help with the rest.
          </p>
        </div>
      </header>

      <section className="rounded-[26px] border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
        <div className="space-y-6">
          <FieldGroup icon={<ListChecks size={20} />} title="Task title">
            <input
              placeholder="Example: Study chapter 3"
              className="h-14 w-full rounded-[18px] border border-[#E5E7EB] bg-white px-4 text-base outline-none placeholder:text-[#9CA3AF] focus:border-[#4F8DFD]"
            />
          </FieldGroup>

          <FieldGroup icon={<Grid2X2 size={20} />} title="Category">
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const active = category.label === "Study";

                return (
                  <button
                    key={category.label}
                    className={`flex h-12 items-center justify-center gap-2 rounded-[16px] border text-sm font-semibold ${
                      active
                        ? "border-[#4F8DFD] bg-[#EAF3FF] text-[#4F8DFD]"
                        : "border-[#E5E7EB] bg-white text-[#4B5563]"
                    }`}
                  >
                    <Icon size={18} />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </FieldGroup>

          <FieldGroup
            icon={<Clock size={20} />}
            title="Does it have a fixed time?"
          >
            <div className="grid h-12 grid-cols-2 rounded-[16px] border border-[#E5E7EB] bg-white p-1">
              <button className="rounded-[13px] text-sm font-semibold text-[#6B7280]">
                Yes
              </button>
              <button className="rounded-[13px] bg-[#EAF3FF] text-sm font-semibold text-[#4F8DFD]">
                No
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-[16px] bg-[#F4F8FF] px-3 py-3 text-sm text-[#6B7280]">
              <Sparkles size={18} className="text-[#4F8DFD]" />
              AI will find a good time for this task.
            </div>
          </FieldGroup>

          <FieldGroup icon={<Clock size={20} />} title="Estimated duration">
            <OptionGrid
              options={durations}
              active="25 min"
              columns="grid-cols-3"
            />
          </FieldGroup>

          <FieldGroup icon={<BarChart3 size={20} />} title="Difficulty">
            <OptionGrid
              options={difficulties}
              active="Medium"
              columns="grid-cols-3"
            />
          </FieldGroup>

          <FieldGroup icon={<Zap size={20} />} title="Energy needed">
            <OptionGrid
              options={energyLevels}
              active="Medium"
              columns="grid-cols-3"
            />
          </FieldGroup>

          <FieldGroup icon={<Flag size={20} />} title="Priority">
            <OptionGrid
              options={priorities}
              active="Normal"
              columns="grid-cols-2"
            />
          </FieldGroup>

          <FieldGroup icon={<CalendarDays size={20} />} title="Deadline">
            <button className="flex h-13 w-full items-center justify-between rounded-[18px] border border-[#E5E7EB] bg-white px-4 py-4 text-left text-sm text-[#6B7280]">
              <span className="flex items-center gap-2">
                <CalendarDays size={18} />
                Pick a date and time
              </span>
              <span>›</span>
            </button>
          </FieldGroup>
        </div>
      </section>

      <div className="space-y-3">
        <button className="h-14 w-full rounded-[18px] bg-[#4F8DFD] text-base font-semibold text-white shadow-[0_10px_24px_rgba(79,141,253,0.30)]">
          Save task
        </button>

        <button className="flex h-14 w-full items-center justify-center gap-2 rounded-[18px] border border-[#4F8DFD] bg-white text-base font-semibold text-[#4F8DFD]">
          <Sparkles size={19} />
          Save and let AI schedule it
        </button>
      </div>
    </div>
  );
}

function FieldGroup({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF3FF] text-[#4F8DFD]">
          {icon}
        </div>
        <h2 className="font-semibold text-[#111827]">{title}</h2>
      </div>

      {children}
    </div>
  );
}

function OptionGrid({
  options,
  active,
  columns,
}: {
  options: string[];
  active: string;
  columns: string;
}) {
  return (
    <div className={`grid gap-3 ${columns}`}>
      {options.map((option) => {
        const isActive = option === active;

        return (
          <button
            key={option}
            className={`h-11 rounded-[16px] border text-sm font-semibold ${
              isActive
                ? "border-[#4F8DFD] bg-[#EAF3FF] text-[#4F8DFD]"
                : "border-[#E5E7EB] bg-white text-[#4B5563]"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
