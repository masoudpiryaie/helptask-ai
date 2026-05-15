import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-2.5-flash";

type GenerateEmailDraftRequest = {
  taskTitle: string;
  recipientEmail?: string;
  context: string;
  tone?: "calm" | "professional" | "friendly";
};

type EmailDraftResponse = {
  subject: string;
  body: string;
};

const emailDraftSchema = {
  type: "object",
  properties: {
    subject: {
      type: "string",
    },
    body: {
      type: "string",
    },
  },
  required: ["subject", "body"],
};

function buildPrompt(input: GenerateEmailDraftRequest) {
  return `
You are MindTask AI, a calm and supportive productivity assistant.

Write an email draft for the user.

Rules:
- Keep it clear and polite.
- Use simple professional English.
- Do not over-explain.
- Do not sound too emotional.
- Do not include placeholders unless needed.
- The user will review and edit before sending.

Task title:
${input.taskTitle}

Recipient:
${input.recipientEmail || "Not provided"}

Context from user:
${input.context}

Tone:
${input.tone || "professional"}

Return ONLY valid JSON:
{
  "subject": "Email subject",
  "body": "Email body"
}
`;
}

function safeParseJson(text: string): EmailDraftResponse | null {
  try {
    return JSON.parse(text) as EmailDraftResponse;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) return null;

    try {
      return JSON.parse(match[0]) as EmailDraftResponse;
    } catch {
      return null;
    }
  }
}

function buildFallbackDraft(
  input: GenerateEmailDraftRequest,
): EmailDraftResponse {
  return {
    subject: input.taskTitle || "Follow up",
    body: "Hello,\n\nI hope you are doing well.\n\nI wanted to follow up regarding this topic. Please let me know if there is anything else you need from my side.\n\nBest regards,",
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
    const body = (await request.json()) as GenerateEmailDraftRequest;

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
                  text: buildPrompt(body),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.35,
            responseMimeType: "application/json",
            responseSchema: emailDraftSchema,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini email draft error:", errorText);

      return NextResponse.json({
        draft: buildFallbackDraft(body),
        usedFallback: true,
      });
    }

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      JSON.stringify(buildFallbackDraft(body));

    const parsed = safeParseJson(text);

    return NextResponse.json({
      draft: parsed || buildFallbackDraft(body),
      usedFallback: !parsed,
    });
  } catch (error) {
    console.error("Generate email draft route error:", error);

    return NextResponse.json(
      { error: "Could not generate email draft." },
      { status: 500 },
    );
  }
}
