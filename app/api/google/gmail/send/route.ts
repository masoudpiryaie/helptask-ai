import { NextResponse } from "next/server";

export const runtime = "nodejs";

type SendGmailRequest = {
  to: string;
  subject: string;
  body: string;
};

function encodeBase64Url(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildMimeMessage(input: SendGmailRequest) {
  const message = [
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    input.body,
  ].join("\r\n");

  return encodeBase64Url(message);
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing Gmail access token." },
        { status: 401 },
      );
    }

    const accessToken = authorization.replace("Bearer ", "");
    const body = (await request.json()) as SendGmailRequest;

    if (!body.to || !body.subject || !body.body) {
      return NextResponse.json(
        { error: "Missing email fields." },
        { status: 400 },
      );
    }

    const raw = buildMimeMessage(body);

    const response = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raw,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Gmail send error:", {
        status: response.status,
        errorText,
      });

      return NextResponse.json(
        {
          error: "Could not send Gmail message.",
          details: errorText,
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json({
      messageId: data.id,
    });
  } catch (error) {
    console.error("Send Gmail route error:", error);

    return NextResponse.json(
      { error: "Could not send email." },
      { status: 500 },
    );
  }
}
