import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EnergyLevel, Mood } from "types/today";

type TodayStore = {
  mood: Mood;
  energyLevel: EnergyLevel;
  wakeUpTime: string;
  sleepTime: string;
  isTodaySyncReady: boolean;

  setMood: (mood: Mood) => void;
  setEnergyLevel: (energyLevel: EnergyLevel) => void;
  setWakeUpTime: (wakeUpTime: string) => void;
  setSleepTime: (sleepTime: string) => void;
  setTodayState: (input: {
    mood?: Mood;
    energyLevel?: EnergyLevel;
    wakeUpTime?: string;
    sleepTime?: string;
  }) => void;
  setIsTodaySyncReady: (isTodaySyncReady: boolean) => void;
};

export const useTodayStore = create<TodayStore>()(
  persist(
    (set) => ({
      mood: "Calm",
      energyLevel: "Okay",
      wakeUpTime: "08:00",
      sleepTime: "23:30",
      isTodaySyncReady: false,

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

      setTodayState: (input) => {
        set((state) => ({
          mood: input.mood ?? state.mood,
          energyLevel: input.energyLevel ?? state.energyLevel,
          wakeUpTime: input.wakeUpTime ?? state.wakeUpTime,
          sleepTime: input.sleepTime ?? state.sleepTime,
        }));
      },

      setIsTodaySyncReady: (isTodaySyncReady) => {
        set({ isTodaySyncReady });
      },
    }),
    {
      name: "mindtask-ai-today",
    },
  ),
);
