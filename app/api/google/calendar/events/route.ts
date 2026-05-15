import { NextResponse } from "next/server";

export const runtime = "nodejs";

export type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  htmlLink?: string;
  start?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
};

type GoogleCalendarEventsResponse = {
  items?: GoogleCalendarEvent[];
};

function getDefaultTimeRange() {
  const now = new Date();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  return {
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
  };
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing Google access token." },
        { status: 401 },
      );
    }

    const accessToken = authorization.replace("Bearer ", "");

    const body = await request.json().catch(() => ({}));

    const defaultRange = getDefaultTimeRange();

    const timeMin = body.timeMin || defaultRange.timeMin;
    const timeMax = body.timeMax || defaultRange.timeMax;

    const url = new URL(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    );

    url.searchParams.set("timeMin", timeMin);
    url.searchParams.set("timeMax", timeMax);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("maxResults", "20");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Google Calendar API error:", {
        status: response.status,
        errorText,
      });

      return NextResponse.json(
        {
          error: "Could not read Google Calendar events.",
          status: response.status,
          details: errorText,
        },
        { status: response.status },
      );
    }

    const data = (await response.json()) as GoogleCalendarEventsResponse;

    return NextResponse.json({
      events: data.items || [],
    });
  } catch (error) {
    console.error("Calendar events route error:", error);

    return NextResponse.json(
      { error: "Could not load calendar events." },
      { status: 500 },
    );
  }
}
