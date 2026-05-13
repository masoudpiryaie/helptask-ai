import { create } from "zustand";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

type UiStore = {
  toast: Toast | null;

  showToast: (input: { type: ToastType; message: string }) => void;

  hideToast: () => void;
};

function createToastId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `toast-${Date.now()}`;
}

export const useUiStore = create<UiStore>((set) => ({
  toast: null,

  showToast: (input) => {
    set({
      toast: {
        id: createToastId(),
        type: input.type,
        message: input.message,
      },
    });
  },

  hideToast: () => {
    set({
      toast: null,
    });
  },
}));
