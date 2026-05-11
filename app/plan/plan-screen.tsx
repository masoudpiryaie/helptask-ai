import {
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Home,
  Lightbulb,
  MoveRight,
  Pencil,
  RefreshCw,
  Sparkles,
  Wand2,
  Play,
  CalendarDays,
  Bot,
  Scale,
} from "lucide-react";

const planItems = [
  {
    time: "10:00 - 10:25",
    title: "Study Finance Chapter 3",
    subtitle: "Pomodoro · Focus task",
    reason: "This task needs focus and your morning is free.",
    icon: BookOpen,
    badge: "Focus",
    color: "green",
  },
  {
    time: "11:30 - 12:00",
    title: "Apply for one job",
    subtitle: "Small step · Work",
    reason: "This is important, so I made it short and clear.",
    icon: BriefcaseBusiness,
    badge: "Work",
    color: "purple",
  },
  {
    time: "15:00 - 15:10",
    title: "Clean desk",
    subtitle: "10-minute sprint · Home",
    reason: "A short task can help you restart your day.",
    icon: Home,
    badge: "Home",
    color: "blue",
  },
];

export function PlanScreen() {
  return (
    <div className="space-y-5">
      <header>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="text-[#4F8DFD]" size={26} />
          <span className="rounded-full bg-[#EAF3FF] px-3 py-1 text-sm font-semibold text-[#4F8DFD]">
            AI Planner
          </span>
        </div>

        <h1 className="text-[34px] font-bold leading-tight tracking-[-0.04em] text-[#111827]">
          Today’s AI Plan
        </h1>
        <p className="mt-1 text-base leading-6 text-[#6B7280]">
          Made from your tasks, mood, energy, weather, and free time.
        </p>
      </header>

      <PlanSummaryCard />

      <section className="space-y-4">
        {planItems.map((item) => (
          <PlanItemCard key={item.title} item={item} />
        ))}
      </section>

      <PlanActions />
    </div>
  );
}

function PlanSummaryCard() {
  return (
    <section className="rounded-[26px] border border-[#D7E6FF] bg-gradient-to-br from-[#EAF3FF] to-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white">
          <Scale className="text-[#4F8DFD]" size={32} />
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-[-0.03em]">
            Balanced plan
          </h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            A realistic plan with focus blocks and breaks.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Metric number="3" label="important tasks" />
        <Metric number="2" label="short breaks" />
        <Metric number="1" label="backup task" />
      </div>

      <div className="mt-5 flex gap-3 rounded-[20px] bg-white/80 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF]">
          <Bot className="text-[#4F8DFD]" size={22} />
        </div>
        <p className="text-sm leading-5 text-[#4B5563]">
          I kept the plan realistic for your current energy.
        </p>
      </div>
    </section>
  );
}

function Metric({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-[20px] bg-white p-3 text-center shadow-sm">
      <p className="text-2xl font-bold text-[#4F8DFD]">{number}</p>
      <p className="mt-1 text-xs leading-4 text-[#6B7280]">{label}</p>
    </div>
  );
}

function PlanItemCard({
  item,
}: {
  item: {
    time: string;
    title: string;
    subtitle: string;
    reason: string;
    icon: React.ElementType;
    badge: string;
    color: string;
  };
}) {
  const Icon = item.icon;
  const colors = getColors(item.color);

  return (
    <article className="rounded-[26px] border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <p className="mb-3 text-sm font-semibold text-[#4F8DFD]">{item.time}</p>

      <div className="flex gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${colors.bg}`}
        >
          <Icon className={colors.text} size={28} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold leading-tight tracking-[-0.03em] text-[#111827]">
                {item.title}
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">{item.subtitle}</p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}
            >
              {item.badge}
            </span>
          </div>

          <div className={`mt-4 rounded-[18px] border p-3 ${colors.reasonBox}`}>
            <div className="flex gap-2">
              <Lightbulb className={colors.text} size={18} />
              <div>
                <p className={`font-semibold ${colors.text}`}>Why now?</p>
                <p className="text-sm leading-5 text-[#374151]">
                  {item.reason}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button className="flex h-11 items-center justify-center gap-2 rounded-[16px] bg-[#4F8DFD] text-sm font-semibold text-white">
              <Play size={15} fill="white" />
              Start
            </button>

            <button className="flex h-11 items-center justify-center gap-1 rounded-[16px] border border-[#E5E7EB] bg-white text-sm font-semibold text-[#4B5563]">
              <CalendarDays size={15} />
              Move
            </button>

            <button className="flex h-11 items-center justify-center gap-1 rounded-[16px] border border-[#E5E7EB] bg-white text-sm font-semibold text-[#4B5563]">
              <Wand2 size={15} />
              Easier
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function PlanActions() {
  return (
    <section className="space-y-3">
      <button className="flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-[#4F8DFD] text-base font-semibold text-white shadow-[0_10px_24px_rgba(79,141,253,0.30)]">
        <CheckCircle2 size={20} />
        Accept plan
      </button>

      <button className="h-14 w-full rounded-[18px] border border-[#4F8DFD] bg-white text-base font-semibold text-[#4F8DFD]">
        Make it lighter
      </button>

      <div className="flex items-center justify-center gap-5 pt-1 text-sm font-semibold text-[#6B7280]">
        <button className="flex items-center gap-2">
          <RefreshCw size={16} />
          Regenerate
        </button>

        <span className="h-4 w-px bg-[#E5E7EB]" />

        <button className="flex items-center gap-2">
          <Pencil size={16} />
          Edit manually
        </button>
      </div>
    </section>
  );
}

function getColors(color: string) {
  const map = {
    green: {
      bg: "bg-[#EAF7EF]",
      text: "text-[#2F9461]",
      badge: "bg-[#EAF7EF] text-[#2F9461]",
      reasonBox: "border-[#CFE8D8] bg-[#F3FBF6]",
    },
    purple: {
      bg: "bg-[#F3E8FF]",
      text: "text-[#7C3AED]",
      badge: "bg-[#F3E8FF] text-[#7C3AED]",
      reasonBox: "border-[#DDD6FE] bg-[#FAF5FF]",
    },
    blue: {
      bg: "bg-[#EAF3FF]",
      text: "text-[#4F8DFD]",
      badge: "bg-[#EAF3FF] text-[#4F8DFD]",
      reasonBox: "border-[#D7E6FF] bg-[#F4F8FF]",
    },
  };

  return map[color as keyof typeof map];
}
