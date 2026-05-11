import {
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  Medal,
  Rocket,
  Sparkles,
  Sprout,
  Star,
  Target,
  Trophy,
} from "lucide-react";

const weekData = [
  { day: "Mon", value: 25 },
  { day: "Tue", value: 40 },
  { day: "Wed", value: 35 },
  { day: "Thu", value: 50 },
  { day: "Fri", value: 30 },
  { day: "Sat", value: 15 },
  { day: "Sun", value: 10 },
];

const badges = [
  { label: "First Step", icon: Sprout, color: "blue" },
  { label: "Focus Starter", icon: Target, color: "green" },
  { label: "Comeback Day", icon: Rocket, color: "purple" },
  { label: "Small Win", icon: Star, color: "orange" },
];

export function ProgressScreen() {
  return (
    <div className="space-y-5">
      <header>
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#EAF3FF]">
          <BarChart3 className="text-[#4F8DFD]" size={26} />
        </div>

        <h1 className="text-[34px] font-bold leading-tight tracking-[-0.04em] text-[#111827]">
          Progress
        </h1>
        <p className="mt-1 text-lg text-[#6B7280]">
          Small progress still counts.
        </p>
      </header>

      <TodayWinsCard />
      <WeeklyProgressCard />
      <RewardCard />
      <BadgesCard />
      <InsightCard />
    </div>
  );
}

function TodayWinsCard() {
  return (
    <section className="rounded-[26px] border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF3DD]">
          <Trophy className="text-[#F59E0B]" size={24} />
        </div>
        <h2 className="text-xl font-bold tracking-[-0.03em]">Today’s wins</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <WinMetric
          icon={<Medal size={20} />}
          number="2"
          label="tasks started"
        />
        <WinMetric
          icon={<CheckCircle2 size={20} />}
          number="1"
          label="task completed"
        />
        <WinMetric
          icon={<Clock size={20} />}
          number="25"
          label="focus minutes"
        />
      </div>
    </section>
  );
}

function WinMetric({
  icon,
  number,
  label,
}: {
  icon: React.ReactNode;
  number: string;
  label: string;
}) {
  return (
    <div className="rounded-[20px] bg-[#F8FAFC] p-3 text-center">
      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF3FF] text-[#4F8DFD]">
        {icon}
      </div>
      <p className="text-2xl font-bold text-[#111827]">{number}</p>
      <p className="mt-1 text-xs leading-4 text-[#6B7280]">{label}</p>
    </div>
  );
}

function WeeklyProgressCard() {
  const max = Math.max(...weekData.map((item) => item.value));

  return (
    <section className="rounded-[26px] border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3E8FF]">
          <BarChart3 className="text-[#7C3AED]" size={23} />
        </div>
        <h2 className="text-xl font-bold tracking-[-0.03em]">
          Weekly progress
        </h2>
      </div>

      <div className="flex h-44 items-end justify-between gap-2 rounded-[22px] bg-[#F8FAFC] p-4">
        {weekData.map((item) => {
          const height = (item.value / max) * 100;

          return (
            <div
              key={item.day}
              className="flex h-full flex-1 flex-col items-center justify-end"
            >
              <span className="mb-2 text-xs font-semibold text-[#6B7280]">
                {item.value}m
              </span>

              <div
                className="w-full rounded-t-full bg-[#4F8DFD]"
                style={{ height: `${height}%` }}
              />

              <span className="mt-2 text-xs font-medium text-[#6B7280]">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RewardCard() {
  return (
    <section className="rounded-[26px] border border-[#FED7AA] bg-[#FFF7ED] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[26px] bg-white">
          <Star className="text-[#F59E0B]" size={42} fill="#F59E0B" />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#EA580C]">You earned</p>
          <h2 className="text-[34px] font-bold tracking-[-0.05em] text-[#C2410C]">
            35 points
          </h2>
          <p className="mt-1 text-sm leading-5 text-[#9A3412]">
            For starting tasks and completing one focus session.
          </p>
        </div>
      </div>
    </section>
  );
}

function BadgesCard() {
  return (
    <section className="rounded-[26px] border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-[-0.03em]">Badges</h2>
        <button className="text-sm font-semibold text-[#4F8DFD]">
          View all
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {badges.map((badge) => {
          const Icon = badge.icon;
          const colors = getBadgeColors(badge.color);

          return (
            <div
              key={badge.label}
              className={`rounded-[20px] border p-4 text-center ${colors.box}`}
            >
              <div
                className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${colors.circle}`}
              >
                <Icon size={24} className={colors.text} />
              </div>
              <p className="text-sm font-bold text-[#111827]">{badge.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function InsightCard() {
  return (
    <section className="rounded-[26px] border border-[#D7E6FF] bg-gradient-to-br from-[#EAF3FF] to-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="flex gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-white">
          <Bot className="text-[#4F8DFD]" size={34} />
        </div>

        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Sparkles size={18} className="text-[#4F8DFD]" />
            <h2 className="text-xl font-bold tracking-[-0.03em]">Insight</h2>
          </div>

          <p className="text-sm leading-5 text-[#6B7280]">
            You complete more focus tasks before noon.
          </p>

          <button className="mt-4 h-11 rounded-[16px] bg-[#4F8DFD] px-4 text-sm font-semibold text-white">
            Use this in my next plan
          </button>
        </div>
      </div>
    </section>
  );
}

function getBadgeColors(color: string) {
  const map = {
    blue: {
      box: "border-[#D7E6FF] bg-[#F4F8FF]",
      circle: "bg-[#EAF3FF]",
      text: "text-[#4F8DFD]",
    },
    green: {
      box: "border-[#CFE8D8] bg-[#F3FBF6]",
      circle: "bg-[#EAF7EF]",
      text: "text-[#2F9461]",
    },
    purple: {
      box: "border-[#DDD6FE] bg-[#FAF5FF]",
      circle: "bg-[#F3E8FF]",
      text: "text-[#7C3AED]",
    },
    orange: {
      box: "border-[#FED7AA] bg-[#FFF7ED]",
      circle: "bg-[#FFF3DD]",
      text: "text-[#F59E0B]",
    },
  };

  return map[color as keyof typeof map];
}
