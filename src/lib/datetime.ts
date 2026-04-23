const SINGAPORE_TIMEZONE = "Asia/Singapore";

export function formatSingaporeDateTime(input: string | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  return date.toLocaleString("en-SG", {
    timeZone: SINGAPORE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

