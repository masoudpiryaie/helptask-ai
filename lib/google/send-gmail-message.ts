type SendGmailMessageInput = {
  accessToken: string;
  to: string;
  subject: string;
  body: string;
};

export async function sendGmailMessage(input: SendGmailMessageInput) {
  const response = await fetch("/api/google/gmail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.accessToken}`,
    },
    body: JSON.stringify({
      to: input.to,
      subject: input.subject,
      body: input.body,
    }),
  });

  const responseText = await response.text();

  let data: unknown = null;

  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = responseText;
  }

  if (!response.ok) {
    console.error("Send Gmail failed:", {
      status: response.status,
      data,
    });

    throw new Error(`Could not send email. Status: ${response.status}`);
  }

  return data;
}
