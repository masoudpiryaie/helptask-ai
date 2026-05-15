import type { GoogleCalendarEvent } from "app/api/google/calendar/events/route";
import type { NewTaskInput } from "types/task";

function formatTime(dateText?: string) {
  if (!dateText) return "";

  const date = new Date(dateText);

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDeadline(dateText?: string) {
  if (!dateText) return "No deadline";

  const date = new Date(dateText);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getDurationMinutes(start?: string, end?: string) {
  if (!start || !end) return 60;

  const startDate = new Date(start);
  const endDate = new Date(end);

  const diff = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

  if (!Number.isFinite(diff) || diff <= 0) return 60;

  return Math.min(diff, 240);
}

function guessCategory(title: string): NewTaskInput["category"] {
  const lowerTitle = title.toLowerCase();

  if (
    lowerTitle.includes("class") ||
    lowerTitle.includes("study") ||
    lowerTitle.includes("lecture") ||
    lowerTitle.includes("exam")
  ) {
    return "Study";
  }

  if (
    lowerTitle.includes("doctor") ||
    lowerTitle.includes("gym") ||
    lowerTitle.includes("health")
  ) {
    return "Health";
  }

  if (
    lowerTitle.includes("meeting") ||
    lowerTitle.includes("work") ||
    lowerTitle.includes("interview")
  ) {
    return "Work";
  }

  return "Personal";
}

export function calendarEventToTask(event: GoogleCalendarEvent): NewTaskInput {
  const title = event.summary || "Calendar event";

  const startDateTime = event.start?.dateTime || event.start?.date;
  const endDateTime = event.end?.dateTime || event.end?.date;

  const startTime = formatTime(startDateTime);
  const endTime = formatTime(endDateTime);

  const fixedTimeLabel =
    startTime && endTime ? `${startTime} - ${endTime}` : "Fixed time";

  return {
    title,
    category: guessCategory(title),
    // status: undefined as never,
    hasFixedTime: true,
    fixedTimeLabel,
    deadlineLabel: formatDeadline(startDateTime),
    estimatedMinutes: getDurationMinutes(startDateTime, endDateTime),
    difficulty: "Medium",
    energyNeeded: "Medium",
    priority: "Normal",
    aiSuggestion: "Imported from Google Calendar. This time is already fixed.",
    source: "google_calendar",
    externalId: event.id,
    sourceUrl: event.htmlLink,
  };
}
