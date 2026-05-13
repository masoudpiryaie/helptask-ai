import type { GenerateAiPlanRequest } from "types/ai";
import type { DailyPlan } from "types/plan";

type GenerateAiPlanResponse = {
  plan: DailyPlan;
  usedFallback: boolean;
};

export async function generateAiPlan(
  input: GenerateAiPlanRequest,
): Promise<GenerateAiPlanResponse> {
  const response = await fetch("/api/ai/generate-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Could not generate AI plan.");
  }

  return response.json() as Promise<GenerateAiPlanResponse>;
}
