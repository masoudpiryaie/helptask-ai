import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EnergyLevel, Mood } from "types/today";

type TodayStore = {
  mood: Mood;
  energyLevel: EnergyLevel;
  wakeUpTime: string;
  sleepTime: string;

  setMood: (mood: Mood) => void;
  setEnergyLevel: (energyLevel: EnergyLevel) => void;
  setWakeUpTime: (wakeUpTime: string) => void;
  setSleepTime: (sleepTime: string) => void;
};

export const useTodayStore = create<TodayStore>()(
  persist(
    (set) => ({
      mood: "Calm",
      energyLevel: "Okay",
      wakeUpTime: "08:00",
      sleepTime: "23:30",

      setMood: (mood) => {
        set({ mood });
      },

      setEnergyLevel: (energyLevel) => {
        set({ energyLevel });
      },

      setWakeUpTime: (wakeUpTime) => {
        set({ wakeUpTime });
      },

      setSleepTime: (sleepTime) => {
        set({ sleepTime });
      },
    }),
    {
      name: "mindtask-ai-today",
    },
  ),
);
