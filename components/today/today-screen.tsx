import {
  Bell,
  Bot,
  Brain,
  CalendarDays,
  Cloud,
  Leaf,
  Lightbulb,
  Play,
  Sparkles,
  Trophy,
  Zap,
  BookOpen,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Smile,
  Star,
  CloudSun,
} from "lucide-react";

export function TodayScreen() {
  return (
    <div className="space-y-4">
      <Header />

      <section>
        <h1 className="text-[34px] font-bold leading-tight tracking-[-0.04em] text-[#111827]">
          Good morning, Eddi
        </h1>
        <p className="mt-1 text-lg text-[#6B7280]">Today can be simple.</p>
      </section>

      <WeatherCard />
      <EnergyCard />
      <MoodCard />
      <SmartPlanCard />
      <NextBestTaskCard />
      <SmallWinsCard />
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

function WeatherCard() {
  return (
    <section className="rounded-[24px] border border-[#D7E6FF] bg-[#EAF3FF] p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/70">
          <Cloud className="text-[#8BB9FF]" size={38} />
        </div>

        <div className="flex-1">
          <p className="text-lg font-semibold text-[#111827]">Berlin</p>
          <p className="text-sm text-[#6B7280]">
            Cloudy · <span className="font-semibold text-[#4F8DFD]">8°C</span>
          </p>
          <p className="mt-1 text-sm text-[#6B7280]">
            Good day for indoor focus tasks.
          </p>
        </div>

        <CloudSun className="text-[#8BB9FF]" size={34} />
      </div>
    </section>
  );
}

function EnergyCard() {
  return (
    <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF3FF]">
          <Zap className="text-[#4F8DFD]" size={22} />
        </div>
        <h2 className="text-lg font-semibold">How is your energy today?</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Pill
          icon={<BatteryLow size={18} className="text-red-400" />}
          label="Low"
        />
        <Pill
          icon={<BatteryMedium size={18} className="text-orange-400" />}
          label="Okay"
        />
        <Pill
          icon={<BatteryFull size={18} className="text-green-500" />}
          label="Good"
        />
      </div>
    </section>
  );
}

function MoodCard() {
  return (
    <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3E8FF]">
          <Smile className="text-[#8B5CF6]" size={22} />
        </div>
        <h2 className="text-lg font-semibold">How are you feeling?</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        <MoodPill icon={<Leaf size={16} />} label="Calm" />
        <MoodPill icon={<Smile size={16} />} label="Tired" />
        <MoodPill icon={<Sparkles size={16} />} label="Stressed" />
        <MoodPill icon={<Star size={16} />} label="Motivated" />
        <MoodPill icon={<Smile size={16} />} label="Normal" />
      </div>
    </section>
  );
}

function SmartPlanCard() {
  return (
    <section className="rounded-[24px] border border-[#D7E6FF] bg-gradient-to-br from-[#EAF3FF] to-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] bg-white/80">
          <Bot className="text-[#4F8DFD]" size={48} />
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-[-0.03em]">
            Your smart plan
          </h2>
          <p className="mt-1 text-sm leading-5 text-[#6B7280]">
            I can suggest a realistic plan for your flexible tasks today.
          </p>

          <button className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[#4F8DFD] px-4 font-semibold text-white shadow-[0_10px_24px_rgba(79,141,253,0.35)]">
            Build today’s plan
            <Sparkles size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

function NextBestTaskCard() {
  return (
    <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="flex gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EAF7EF]">
          <BookOpen className="text-[#2F9461]" size={28} />
        </div>

        <div className="flex-1">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-[#6B7280]">Next best task</p>
              <h2 className="text-xl font-bold tracking-[-0.03em]">
                Study Finance Chapter 3
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">25 min · Pomodoro</p>
            </div>

            <span className="rounded-full bg-[#EAF7EF] px-3 py-1 text-sm font-semibold text-[#2F9461]">
              Focus
            </span>
          </div>

          <div className="mt-4 rounded-[18px] border border-[#CFE8D8] bg-[#F3FBF6] p-3">
            <div className="flex gap-2">
              <Lightbulb className="mt-0.5 text-[#2F9461]" size={18} />
              <div>
                <p className="font-semibold text-[#2F9461]">Why now?</p>
                <p className="text-sm text-[#374151]">
                  Your morning is free and this task needs focus.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button className="flex h-11 items-center justify-center gap-2 rounded-[16px] bg-[#4F8DFD] font-semibold text-white">
              <Play size={16} fill="white" />
              Start
            </button>

            <button className="h-11 rounded-[16px] border border-[#E5E7EB] bg-white text-sm font-semibold text-[#4B5563]">
              Make easier
            </button>

            <button className="flex h-11 items-center justify-center gap-2 rounded-[16px] border border-[#E5E7EB] bg-white text-sm font-semibold text-[#4B5563]">
              <CalendarDays size={16} />
              Move
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SmallWinsCard() {
  return (
    <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3DD]">
          <Trophy className="text-[#F59E0B]" size={28} />
        </div>

        <div className="flex-1">
          <h2 className="font-bold">Small wins today</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            0 tasks done · 0 focus minutes
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-[#E5E7EB]">
              <div className="h-2 w-0 rounded-full bg-[#64C59A]" />
            </div>
            <span className="text-sm text-[#6B7280]">0%</span>
          </div>

          <p className="mt-3 text-sm font-medium text-[#F59E0B]">
            Starting one task is already progress.
          </p>
        </div>
      </div>
    </section>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex h-11 items-center justify-center gap-2 rounded-[16px] border border-[#E5E7EB] bg-white text-sm font-medium text-[#4B5563]">
      {icon}
      {label}
    </button>
  );
}

function MoodPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#7C3AED]">
      {icon}
      {label}
    </button>
  );
}
