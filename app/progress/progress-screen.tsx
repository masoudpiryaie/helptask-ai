"use client";

import {
  Award,
  BarChart3,
  CheckCircle2,
  Flame,
  Lightbulb,
  PlayCircle,
  Sparkles,
  Timer,
} from "lucide-react";
import { useMemo } from "react";
import { useTaskStore } from "lib/stores/task-store";
import { useProgressStore } from "lib/stores/progress-store";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function isToday(dateText: string) {
  const date = new Date(dateText);
  const today = new Date();

  return date.toDateString() === today.toDateString();
}

function getDayIndex(dateText: string) {
  const date = new Date(dateText);
  const day = date.getDay();

  if (day === 0) return 6;

  return day - 1;
}

export function ProgressScreen() {
  const tasks = useTaskStore((state) => state.tasks);
  const focusSessions = useProgressStore((state) => state.focusSessions);

  const stats = useMemo(() => {
    const startedTasks = tasks.filter(
      (task) => task.status === "started" || task.status === "done",
    );

    const completedTasks = tasks.filter((task) => task.status === "done");

    const todayFocusSessions = focusSessions.filter((session) =>
      isToday(session.completedAt),
    );

    const todayFocusMinutes = todayFocusSessions.reduce(
      (total, session) => total + session.minutes,
      0,
    );

    const points =
      startedTasks.length * 5 + completedTasks.length * 10 + todayFocusMinutes;

    const weeklyMinutes = weekDays.map((day) => ({
      day,
      minutes: 0,
    }));

    focusSessions.forEach((session) => {
      const index = getDayIndex(session.completedAt);
      weeklyMinutes[index].minutes += session.minutes;
    });

    const maxMinutes = Math.max(
      ...weeklyMinutes.map((item) => item.minutes),
      25,
    );

    return {
      startedTasks: startedTasks.length,
      completedTasks: completedTasks.length,
      todayFocusMinutes,
      points,
      weeklyMinutes,
      maxMinutes,
    };
  }, [tasks, focusSessions]);

  const badges = useMemo(() => {
    const earnedBadges = [];

    if (stats.startedTasks >= 1) {
      earnedBadges.push({
        title: "First Step",
        description: "You started a task.",
      });
    }

    if (stats.todayFocusMinutes >= 5) {
      earnedBadges.push({
        title: "Focus Starter",
        description: "You completed focus time.",
      });
    }

    if (stats.completedTasks >= 1) {
      earnedBadges.push({
        title: "Small Win",
        description: "You completed a task.",
      });
    }

    if (stats.startedTasks >= 2) {
      earnedBadges.push({
        title: "Comeback Day",
        description: "You came back and started again.",
      });
    }

    return earnedBadges;
  }, [stats]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-5 pb-28 pt-6 text-[#1F2937]">
      <header className="mb-6">
        <p className="text-sm font-medium text-[#4F8DFD]">MindTask AI</p>
        <h1 className="mt-1 text-[32px] font-bold tracking-[-0.03em]">
          Progress
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-[#6B7280]">
          Small progress still counts.
        </p>
      </header>

      <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF3FF]">
            <Sparkles size={20} className="text-[#4F8DFD]" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Today&apos;s wins</h2>
            <p className="text-sm text-[#6B7280]">Starting also counts here.</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-[#F8FAFC] p-4">
            <PlayCircle size={20} className="text-[#4F8DFD]" />
            <p className="mt-3 text-2xl font-bold">{stats.startedTasks}</p>
            <p className="mt-1 text-xs font-medium text-[#6B7280]">
              tasks started
            </p>
          </div>

          <div className="rounded-2xl bg-[#F8FAFC] p-4">
            <CheckCircle2 size={20} className="text-[#64C59A]" />
            <p className="mt-3 text-2xl font-bold">{stats.completedTasks}</p>
            <p className="mt-1 text-xs font-medium text-[#6B7280]">completed</p>
          </div>

          <div className="rounded-2xl bg-[#F8FAFC] p-4">
            <Timer size={20} className="text-[#A78BFA]" />
            <p className="mt-3 text-2xl font-bold">{stats.todayFocusMinutes}</p>
            <p className="mt-1 text-xs font-medium text-[#6B7280]">
              focus minutes
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50">
            <BarChart3 size={20} className="text-[#7C3AED]" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Weekly focus</h2>
            <p className="text-sm text-[#6B7280]">
              Minutes from focus sessions.
            </p>
          </div>
        </div>

        <div className="flex h-40 items-end gap-3">
          {stats.weeklyMinutes.map((item) => {
            const height = Math.max(
              (item.minutes / stats.maxMinutes) * 100,
              item.minutes > 0 ? 12 : 4,
            );

            return (
              <div key={item.day} className="flex flex-1 flex-col items-center">
                <div className="flex h-28 w-full items-end rounded-full bg-[#F8FAFC]">
                  <div
                    className="w-full rounded-full bg-[#4F8DFD]"
                    style={{ height: `${height}%` }}
                  />
                </div>

                <p className="mt-2 text-xs font-semibold text-[#6B7280]">
                  {item.day}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-5 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50">
            <Flame size={22} className="text-[#C76A21]" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              You earned {stats.points} points
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              For starting tasks, completing tasks, and finishing focus
              sessions.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <Award size={21} className="text-[#4F8DFD]" />
          <h2 className="text-lg font-semibold">Badges</h2>
        </div>

        {badges.length === 0 ? (
          <p className="text-sm leading-6 text-[#6B7280]">
            Start one small task to unlock your first badge.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.title}
                className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4"
              >
                <p className="font-semibold">{badge.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-5 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FF]">
            <Lightbulb size={20} className="text-[#4F8DFD]" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Insight</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              You start more easily when the first step is small. I can use this
              in your next plan.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mt-5 w-full rounded-2xl bg-[#4F8DFD] px-5 py-4 text-[15px] font-semibold text-white"
        >
          Use this in my next plan
        </button>
      </section>
    </main>
  );
}
