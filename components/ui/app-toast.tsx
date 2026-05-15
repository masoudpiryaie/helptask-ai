"use client";

import { useEffect } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useUiStore } from "lib/stores/ui-store";

function getToastStyle(type: "success" | "error" | "info") {
  if (type === "success") {
    return {
      icon: <CheckCircle2 size={19} className="text-[#2F946A]" />,
      bg: "bg-green-50",
      border: "border-green-100",
    };
  }

  if (type === "error") {
    return {
      icon: <XCircle size={19} className="text-red-500" />,
      bg: "bg-red-50",
      border: "border-red-100",
    };
  }

  return {
    icon: <Info size={19} className="text-[#4F8DFD]" />,
    bg: "bg-[#EAF3FF]",
    border: "border-[#D8E8FF]",
  };
}

export function AppToast() {
  const toast = useUiStore((state) => state.toast);
  const hideToast = useUiStore((state) => state.hideToast);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => {
      hideToast();
    }, 3800);

    return () => window.clearTimeout(timeout);
  }, [toast, hideToast]);

  if (!toast) return null;

  const style = getToastStyle(toast.type);

  return (
    <div className="fixed left-1/2 top-5 z-[100] w-full max-w-[430px] -translate-x-1/2 px-5">
      <div
        className={`flex items-start gap-3 rounded-2xl border ${style.border} ${style.bg} px-4 py-3 shadow-sm`}
      >
        <div className="mt-0.5 shrink-0">{style.icon}</div>

        <p className="text-sm font-medium leading-6 text-[#1F2937]">
          {toast.message}
        </p>
      </div>
    </div>
  );
}
