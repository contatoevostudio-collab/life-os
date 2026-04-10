import type { CalendarEvent } from "@/types/domain";

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildDateOrNull(year: number, monthIndex: number, dayOfMonth: number, source: Date) {
  const candidate = new Date(year, monthIndex, dayOfMonth, source.getHours(), source.getMinutes(), 0, 0);
  return candidate.getMonth() === monthIndex ? candidate : null;
}

export function eventOccursOn(event: CalendarEvent, day: Date) {
  const anchor = new Date(event.startsAt);
  const recurrence = event.recurrence?.type ?? "once";

  if (recurrence === "once") {
    return sameDay(anchor, day);
  }

  if (recurrence === "monthly") {
    const dayOfMonth = event.recurrence?.dayOfMonth ?? anchor.getDate();
    return day.getDate() === dayOfMonth && day >= new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  }

  if (recurrence === "yearly") {
    const month = event.recurrence?.month ?? anchor.getMonth() + 1;
    const dayOfMonth = event.recurrence?.dayOfMonth ?? anchor.getDate();
    return day.getMonth() + 1 === month && day.getDate() === dayOfMonth;
  }

  return false;
}

export function nextEventOccurrence(event: CalendarEvent, reference = new Date()) {
  const anchor = new Date(event.startsAt);
  const recurrence = event.recurrence?.type ?? "once";

  if (recurrence === "once") {
    return anchor >= reference ? anchor : null;
  }

  if (recurrence === "monthly") {
    const dayOfMonth = event.recurrence?.dayOfMonth ?? anchor.getDate();
    for (let offset = 0; offset < 36; offset += 1) {
      const monthBase = new Date(reference.getFullYear(), reference.getMonth() + offset, 1);
      const candidate = buildDateOrNull(monthBase.getFullYear(), monthBase.getMonth(), dayOfMonth, anchor);
      if (candidate && candidate >= reference && candidate >= anchor) {
        return candidate;
      }
    }
    return null;
  }

  const month = event.recurrence?.month ?? anchor.getMonth() + 1;
  const dayOfMonth = event.recurrence?.dayOfMonth ?? anchor.getDate();
  for (let yearOffset = 0; yearOffset < 12; yearOffset += 1) {
    const candidate = buildDateOrNull(reference.getFullYear() + yearOffset, month - 1, dayOfMonth, anchor);
    if (candidate && candidate >= reference && candidate >= anchor) {
      return candidate;
    }
  }
  return null;
}

export function formatEventRecurrence(event: CalendarEvent) {
  const recurrence = event.recurrence?.type ?? "once";
  const anchor = new Date(event.startsAt);

  if (recurrence === "monthly") {
    const dayOfMonth = event.recurrence?.dayOfMonth ?? anchor.getDate();
    return `Todo dia ${dayOfMonth}`;
  }

  if (recurrence === "yearly") {
    const month = event.recurrence?.month ?? anchor.getMonth() + 1;
    const dayOfMonth = event.recurrence?.dayOfMonth ?? anchor.getDate();
    return `Todo ano em ${String(dayOfMonth).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
  }

  return "Ocorrência única";
}

export function formatNextEventOccurrence(event: CalendarEvent, reference = new Date()) {
  const next = nextEventOccurrence(event, reference);
  if (!next) return "Encerrado";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(next);
}
