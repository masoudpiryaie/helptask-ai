import Link from "next/link";
import { ReactNode } from "react";
import {
  Home,
  ListTodo,
  CalendarDays,
  Timer,
  ChartNoAxesColumn,
} from "lucide-react";

type TabName = "Today" | "Tasks" | "Plan" | "Focus" | "Progress";

type MobileShellProps = {
  children: ReactNode;
  activeTab: TabName;
};

const tabs = [
  { name: "Today", href: "/", icon: Home },
  { name: "Tasks", href: "/tasks", icon: ListTodo },
  { name: "Plan", href: "/plan", icon: CalendarDays },
  { name: "Focus", href: "/focus", icon: Timer },
  { name: "Progress", href: "/progress", icon: ChartNoAxesColumn },
] as const;

export function MobileShell({ children, activeTab }: MobileShellProps) {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-[#F8FAFC]">
        <div className="flex-1 px-5 pb-28 pt-6">{children}</div>

        <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 rounded-t-[28px] border border-[#E5E7EB] bg-white/95 px-4 pb-5 pt-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid grid-cols-5 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.name === activeTab;

              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs transition ${
                    isActive ? "text-[#4F8DFD]" : "text-[#6B7280]"
                  }`}
                >
                  <Icon
                    size={23}
                    strokeWidth={isActive ? 2.7 : 2}
                    className={isActive ? "fill-[#EAF3FF]" : ""}
                  />
                  <span className="font-medium">{tab.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </main>
  );
}
