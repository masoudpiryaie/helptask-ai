"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Bot,
  Coffee,
  Pause,
  Play,
  Square,
  Timer,
  X,
  Smile,
  Meh,
  Frown,
  Cloud,
  RotateCcw,
} from "lucide-react";

const SESSION_SECONDS = 25 * 60;

export function FocusScreen() {
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  const progress = useMemo(() => {
    return ((SESSION_SECONDS - secondsLeft) / SESSION_SECONDS) * 100;
  }, [secondsLeft]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeLabel = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="space-y-5">
      <header>
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#EAF3FF]">
          <Timer className="text-[#4F8DFD]" size={26} />
        </div>

        <h1 className="text-[34px] font-bold leading-tight tracking-[-0.04em] text-[#111827]">
          Focus Mode
        </h1>
        <p className="mt-1 text-lg text-[#6B7280]">One task at a time.</p>
      </header>

      <CurrentTaskCard />

      <TimerCard
        timeLabel={timeLabel}
        progress={progress}
        isRunning={isRunning}
        onStart={() => setIsRunning(true)}
        onPause={() => setIsRunning(false)}
        onFinish={() => {
          setIsRunning(false);
          setSecondsLeft(0);
        }}
        onReset={() => {
          setIsRunning(false);
          setSecondsLeft(SESSION_SECONDS);
        }}
      />

      <DistractionCard />

      <SessionFeedbackCard />
    </div>
  );
}

function CurrentTaskCard() {
  return (
    <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF7EF]">
          <BookOpen className="text-[#2F9461]" size={28} />
        </div>

        <div className="flex-1">
          <p className="text-sm text-[#6B7280]">Current task</p>
          <h2 className="text-xl font-bold tracking-[-0.03em]">
            Study Finance Chapter 3
          </h2>
        </div>

        <span className="rounded-full bg-[#EAF7EF] px-3 py-1 text-sm font-semibold text-[#2F9461]">
          Pomodoro
        </span>
      </div>
    </section>
  );
}

function TimerCard({
  timeLabel,
  progress,
  isRunning,
  onStart,
  onPause,
  onFinish,
  onReset,
}: {
  timeLabel: string;
  progress: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onFinish: () => void;
  onReset: () => void;
}) {
  return (
    <section className="rounded-[32px] border border-[#D7E6FF] bg-gradient-to-br from-white to-[#EAF3FF] p-6 text-center shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-full bg-white p-5 shadow-inner">
        <div
          className="flex h-full w-full flex-col items-center justify-center rounded-full border-[12px] border-[#EAF3FF]"
          style={{
            background: `conic-gradient(#4F8DFD ${progress}%, #ffffff ${progress}%)`,
          }}
        >
          <div className="flex h-[calc(100%-24px)] w-[calc(100%-24px)] flex-col items-center justify-center rounded-full bg-white">
            <Bot className="mb-3 text-[#4F8DFD]" size={38} />
            <p className="text-[48px] font-bold tracking-[-0.06em] text-[#111827]">
              {timeLabel}
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">Focus session 1 of 4</p>

            <div className="mt-3 flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#4F8DFD]" />
              <span className="h-2 w-2 rounded-full bg-[#D1D5DB]" />
              <span className="h-2 w-2 rounded-full bg-[#D1D5DB]" />
              <span className="h-2 w-2 rounded-full bg-[#D1D5DB]" />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={isRunning ? onPause : onStart}
        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-[#4F8DFD] text-base font-semibold text-white shadow-[0_10px_24px_rgba(79,141,253,0.30)]"
      >
        {isRunning ? <Pause size={20} /> : <Play size={20} fill="white" />}
        {isRunning ? "Pause focus" : "Start focus"}
      </button>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          onClick={onFinish}
          className="flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[#E5E7EB] bg-white font-semibold text-[#4B5563]"
        >
          <Square size={17} />
          Finish
        </button>

        <button
          onClick={onReset}
          className="flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[#E5E7EB] bg-white font-semibold text-[#4B5563]"
        >
          <RotateCcw size={17} />
          Reset
        </button>
      </div>
    </section>
  );
}

function DistractionCard() {
  return (
    <section className="space-y-3">
      <button className="h-12 w-full rounded-[18px] border border-[#E5E7EB] bg-white font-semibold text-[#6B7280]">
        I got distracted
      </button>

      <div className="flex gap-4 rounded-[24px] border border-[#D7E6FF] bg-[#F4F8FF] p-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white">
          <Cloud className="text-[#4F8DFD]" size={28} />
        </div>

        <div>
          <h2 className="font-bold text-[#111827]">It happens.</h2>
          <p className="mt-1 text-sm leading-5 text-[#6B7280]">
            Take one breath and continue for 5 more minutes.
          </p>
        </div>
      </div>
    </section>
  );
}

function SessionFeedbackCard() {
  return (
    <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <h2 className="text-lg font-bold">How was this session?</h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <FeedbackButton icon={<Smile size={18} />} label="Easy" />
        <FeedbackButton icon={<Meh size={18} />} label="Okay" />
        <FeedbackButton icon={<Frown size={18} />} label="Hard" />
        <FeedbackButton icon={<Cloud size={18} />} label="Could not focus" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <SmallAction icon={<Coffee size={16} />} label="Take a break" />
        <SmallAction icon={<Play size={16} />} label="Continue" />
        <SmallAction icon={<X size={16} />} label="Stop today" />
      </div>
    </section>
  );
}

function FeedbackButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[#E5E7EB] bg-white text-sm font-semibold text-[#4B5563]">
      {icon}
      {label}
    </button>
  );
}

function SmallAction({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="flex min-h-12 items-center justify-center gap-1 rounded-[16px] bg-[#F3F4F6] px-2 text-xs font-semibold text-[#4B5563]">
      {icon}
      {label}
    </button>
  );
}
