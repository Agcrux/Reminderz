export const TIMES = Array.from({ length: 48 }, (_, index) => {
  const minutes = index * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

export function formatTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

export function formatDate(value: string | Date) {
  const day = value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));
}

export function isValidTime(value: string) {
  return TIMES.includes(value);
}

export function datePart(value: string | Date) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
}

export function weekStart(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

export function weekDates(start: string) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${start}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

export function makeSlot(date: string, time: string) { return `${date}|${time}`; }

export function isValidSlot(slot: string, start: string | Date) {
  const [date, time, extra] = slot.split("|");
  return !extra && weekDates(datePart(start)).includes(date) && isValidTime(time);
}

export function formatSlot(slot: string) {
  const [date, time] = slot.split("|");
  return `${formatDate(date)} at ${formatTime(time)}`;
}

export function shortDay(date: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}
