type GenerateEmailDraftInput = {
  taskTitle: string;
  recipientEmail?: string;
  context: string;
  tone?: "calm" | "professional" | "friendly";
};

type GenerateEmailDraftResponse = {
  draft: {
    subject: string;
    body: string;
  };
  usedFallback: boolean;
};

export async function generateEmailDraft(input: GenerateEmailDraftInput) {
  const response = await fetch("/api/ai/generate-email-draft", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Could not generate email draft.");
  }

  return response.json() as Promise<GenerateEmailDraftResponse>;
}
