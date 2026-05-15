import type { GoogleCalendarEvent } from "app/api/google/calendar/events/route";

type FetchCalendarEventsResponse = {
  events: GoogleCalendarEvent[];
};

export async function fetchCalendarEvents(accessToken: string) {
  const response = await fetch("/api/google/calendar/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({}),
  });

  const responseText = await response.text();

  let data: unknown = null;

  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = responseText;
  }

  if (!response.ok) {
    console.error("Calendar fetch failed status:", response.status);
    console.error("Calendar fetch failed data:", data);
    console.error("Calendar fetch failed raw text:", responseText);

    throw new Error(
      `Could not fetch calendar events. Status: ${response.status}`,
    );
  }

  const parsedData = data as FetchCalendarEventsResponse;

  return parsedData.events || [];
}
