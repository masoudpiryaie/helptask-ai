import type { Task } from "types/task";
import type { EnergyLevel, Mood } from "types/today";

export type GenerateAiPlanRequest = {
  tasks: Task[];
  mood: Mood;
  energyLevel: EnergyLevel;
  wakeUpTime: string;
  sleepTime: string;
  weather?: {
    city: string;
    condition: string;
    temperature: string;
  };
};
