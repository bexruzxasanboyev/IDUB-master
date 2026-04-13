const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];

const UZ_WEEKDAYS = [
  "Yakshanba",
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
];

function parseDate(input: string | Date | null | undefined): Date | null {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return null;
  return d;
}

/** "12 aprel 2026" */
export function formatDateLong(input: string | Date | null | undefined): string {
  const d = parseDate(input);
  if (!d) return "";
  return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "12 aprel" */
export function formatDateShort(input: string | Date | null | undefined): string {
  const d = parseDate(input);
  if (!d) return "";
  return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]}`;
}

/** "14:30" */
export function formatTime(input: string | Date | null | undefined): string {
  const d = parseDate(input);
  if (!d) return "";
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

/** "Bugun 14:30" / "Kecha 21:05" / "12 aprel, 14:30" / "12 aprel 2024, 14:30" */
export function formatDateTime(input: string | Date | null | undefined): string {
  const d = parseDate(input);
  if (!d) return "";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const time = formatTime(d);
  const isToday = d >= today;
  const isYesterday = !isToday && d >= yesterday;
  const sameYear = d.getFullYear() === now.getFullYear();

  if (isToday) return `Bugun ${time}`;
  if (isYesterday) return `Kecha ${time}`;
  if (sameYear) return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]}, ${time}`;
  return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${time}`;
}

/** "Bugun" / "Kecha" / "3 kun oldin" / "12 aprel" / "12 aprel 2024" */
export function formatRelativeDate(
  input: string | Date | null | undefined
): string {
  const d = parseDate(input);
  if (!d) return "";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Bugun";
  if (diffDays === 1) return "Kecha";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} kun oldin`;

  const sameYear = d.getFullYear() === now.getFullYear();
  if (sameYear) return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]}`;
  return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Dushanba" */
export function formatWeekday(input: string | Date | null | undefined): string {
  const d = parseDate(input);
  if (!d) return "";
  return UZ_WEEKDAYS[d.getDay()];
}
