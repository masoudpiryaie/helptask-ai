import { NextResponse } from "next/server";
import type { GenerateAiPlanRequest } from "types/ai";
import type { DailyPlan, PlanItem, PlanItemMethod } from "types/plan";
import type { Task } from "types/task";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-2.5-flash";

type GeminiPlanItem = {
  taskId: string;
  title: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  method: PlanItemMethod;
  reason: string;
};
const planResponseSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
    },
    summary: {
      type: "string",
    },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
          },
          title: {
            type: "string",
          },
          startTime: {
            type: "string",
          },
          endTime: {
            type: "string",
          },
          durationMinutes: {
            type: "number",
          },
          method: {
            type: "string",
            enum: [
              "Pomodoro",
              "Small step",
              "10-minute sprint",
              "Easy start",
              "Focus block",
            ],
          },
          reason: {
            type: "string",
          },
        },
        required: [
          "taskId",
          "title",
          "startTime",
          "endTime",
          "durationMinutes",
          "method",
          "reason",
        ],
      },
    },
  },
  required: ["title", "summary", "items"],
};
type GeminiPlanResponse = {
  title: string;
  summary: string;
  items: GeminiPlanItem[];
};

function createPlanId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `ai-plan-${Date.now()}`;
}

function getMethodFallback(task: Task): PlanItemMethod {
  if (task.category === "Study") return "Pomodoro";
  if (task.estimatedMinutes <= 10) return "10-minute sprint";
  if (task.difficulty === "Hard") return "Small step";
  if (task.energyNeeded === "Low") return "Easy start";

  return "Focus block";
}

function findTask(tasks: Task[], taskId: string) {
  return tasks.find((task) => task.id === taskId);
}

function safeParseJson(text: string): GeminiPlanResponse | null {
  try {
    return JSON.parse(text) as GeminiPlanResponse;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) return null;

    try {
      return JSON.parse(match[0]) as GeminiPlanResponse;
    } catch {
      return null;
    }
  }
}

function buildPrompt(input: GenerateAiPlanRequest) {
  const flexibleTasks = input.tasks.filter(
    (task) => !task.hasFixedTime && task.status !== "done",
  );

  const fixedTasks = input.tasks.filter(
    (task) => task.hasFixedTime && task.status !== "done",
  );

  return `
You are Task AI, a calm and supportive AI task planner.

App personality:
- Calm, smart, supportive
- Never guilt the user
- Starting tasks counts as progress
- Make the plan realistic, not overloaded
- For study tasks, use Pomodoro
- For hard tasks, break into smaller first steps
- For boring or delayed tasks, use 2-minute rule, 10-minute sprint, or easier start

User context:
Mood: ${input.mood}
Energy: ${input.energyLevel}
Wake-up time: ${input.wakeUpTime}
Sleep time: ${input.sleepTime}
Weather: ${input.weather?.city || "Berlin"}, ${
    input.weather?.condition || "Cloudy"
  }, ${input.weather?.temperature || "8°C"}

Fixed tasks:
${JSON.stringify(
  fixedTasks.map((task) => ({
    id: task.id,
    title: task.title,
    fixedTimeLabel: task.fixedTimeLabel,
    estimatedMinutes: task.estimatedMinutes,
    category: task.category,
  })),
  null,
  2,
)}

Flexible tasks:
${JSON.stringify(
  flexibleTasks.map((task) => ({
    id: task.id,
    title: task.title,
    category: task.category,
    estimatedMinutes: task.estimatedMinutes,
    difficulty: task.difficulty,
    energyNeeded: task.energyNeeded,
    priority: task.priority,
    deadlineLabel: task.deadlineLabel,
  })),
  null,
  2,
)}

Create a realistic plan for today using only flexible task IDs from the list.
Do not include completed tasks.
Do not overload the user.
Prefer 2 to 4 plan items.

Planning rules:
- If energy is Low, choose easier, shorter, or low-energy tasks first.
- If mood is Stressed or Tired, avoid starting with a hard task unless it is urgent.
- If mood is Motivated and energy is Good, you may include one harder high-priority task.
- Study tasks should use Pomodoro and usually be 25 minutes.
- Hard tasks should use Small step and should not be longer than 30 minutes.
- Very short tasks can use 10-minute sprint.
- Avoid times that conflict with fixed tasks.
- Leave space between focus blocks.
- Starting is a success. Do not write guilt-based reasons.

Return ONLY valid JSON in this exact shape:
{
  "title": "Balanced plan",
  "summary": "A calm supportive summary.",
  "items": [
    {
      "taskId": "task id from flexible tasks",
      "title": "task title",
      "startTime": "10:00",
      "endTime": "10:25",
      "durationMinutes": 25,
      "method": "Pomodoro",
      "reason": "Short calm reason. No guilt."
    }
  ]
}
`;
}

function buildDailyPlan(
  aiResponse: GeminiPlanResponse,
  tasks: Task[],
): DailyPlan {
  const items: PlanItem[] = aiResponse.items
    .map((item, index) => {
      const task = findTask(tasks, item.taskId);

      if (!task) return null;
      if (!isValidPlanTask(task)) return null;

      return {
        id: `ai-plan-item-${task.id}-${index}`,
        taskId: task.id,
        title: item.title || task.title,
        category: task.category,
        startTime: item.startTime || "10:00",
        endTime: item.endTime || "10:25",
        durationMinutes: item.durationMinutes || task.estimatedMinutes,
        method: item.method || getMethodFallback(task),
        reason:
          item.reason ||
          "This task fits your current energy and gives you a realistic start.",
        difficulty: task.difficulty,
        energyNeeded: task.energyNeeded,
      };
    })
    .filter((item): item is PlanItem => Boolean(item));

  return {
    id: createPlanId(),
    title: aiResponse.title || "Balanced plan",
    summary:
      aiResponse.summary ||
      "I kept the plan realistic for your current energy.",
    importantTasks: items.filter((item) => {
      const task = findTask(tasks, item.taskId);
      return task?.priority === "High" || task?.priority === "Urgent";
    }).length,
    shortBreaks: Math.max(items.length - 1, 1),
    backupTasks: tasks.length > items.length ? 1 : 0,
    items,
    createdAt: new Date().toISOString(),
  };
}

function buildFallbackPlan(tasks: Task[]): DailyPlan {
  const flexibleTasks = tasks
    .filter((task) => !task.hasFixedTime && task.status !== "done")
    .slice(0, 3);

  const defaultTimes = ["10:00", "11:30", "15:00"];

  const items: PlanItem[] = flexibleTasks.map((task, index) => {
    const duration =
      task.category === "Study" ? 25 : Math.min(30, task.estimatedMinutes);

    return {
      id: `fallback-plan-item-${task.id}`,
      taskId: task.id,
      title: task.title,
      category: task.category,
      startTime: defaultTimes[index] || "16:30",
      endTime: addMinutesToTime(defaultTimes[index] || "16:30", duration),
      durationMinutes: duration,
      method: getMethodFallback(task),
      reason: "This is a realistic first step for today.",
      difficulty: task.difficulty,
      energyNeeded: task.energyNeeded,
    };
  });

  return {
    id: createPlanId(),
    title: "Balanced plan",
    summary: "I made a simple plan from your available tasks.",
    importantTasks: items.filter((item) => {
      const task = findTask(tasks, item.taskId);
      return task?.priority === "High" || task?.priority === "Urgent";
    }).length,
    shortBreaks: Math.max(items.length - 1, 1),
    backupTasks: 0,
    items,
    createdAt: new Date().toISOString(),
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY" },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as GenerateAiPlanRequest;

    const prompt = buildPrompt(body);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.35,
            responseMimeType: "application/json",
            responseSchema: planResponseSchema,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);

      return NextResponse.json(
        {
          plan: buildFallbackPlan(body.tasks),
          usedFallback: true,
        },
        { status: 200 },
      );
    }

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      JSON.stringify({
        title: "Balanced plan",
        summary: "I made a simple plan for today.",
        items: [],
      });

    const parsed = safeParseJson(text);

    if (!parsed) {
      return NextResponse.json(
        {
          plan: buildFallbackPlan(body.tasks),
          usedFallback: true,
        },
        { status: 200 },
      );
    }

    const plan = buildDailyPlan(parsed, body.tasks);
    if (plan.items.length === 0) {
      return NextResponse.json(
        {
          plan: buildFallbackPlan(body.tasks),
          usedFallback: true,
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      plan,
      usedFallback: false,
    });
  } catch (error) {
    console.error("Generate plan route error:", error);

    return NextResponse.json(
      { error: "Could not generate plan" },
      { status: 500 },
    );
  }
}

function isValidPlanTask(task: Task) {
  return (
    !task.hasFixedTime && task.status !== "done" && task.status !== "skipped"
  );
}
function addMinutesToTime(time: string, minutes: number) {
  const [hoursText, minutesText] = time.split(":");
  const date = new Date();

  date.setHours(Number(hoursText));
  date.setMinutes(Number(minutesText) + minutes);
  date.setSeconds(0);

  const hours = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${mins}`;
}
