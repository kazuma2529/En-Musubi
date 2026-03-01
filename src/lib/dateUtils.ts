const DAY_MS = 24 * 60 * 60 * 1000;
const NINETY_DAYS_MS = 90 * DAY_MS;

export function formatLastContact(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / DAY_MS);

  if (days === 0) return "今日";
  if (days === 1) return "昨日";
  if (days < 7) return `${days}日前`;
  if (days < 30) return `${Math.floor(days / 7)}週間前`;
  if (days < 365) return `${Math.floor(days / 30)}ヶ月前`;
  return `${Math.floor(days / 365)}年前`;
}

export function isOver90DaysAgo(timestamp: number): boolean {
  return Date.now() - timestamp >= NINETY_DAYS_MS;
}

export function daysSinceContact(timestamp: number): number {
  return Math.floor((Date.now() - timestamp) / DAY_MS);
}

/** Get next birthday from today within the next N days. Returns days until, or null if not in range. */
export function daysUntilBirthday(
  birthdayStr: string | null | undefined,
  withinDays: number = 7
): number | null {
  if (!birthdayStr) return null;

  const [yearPart, month, day] = birthdayStr.split("-").map(Number);
  const hasYear = !isNaN(yearPart) && yearPart > 0;

  const today = new Date();
  const thisYear = today.getFullYear();

  let nextBirthday: Date;
  if (hasYear) {
    nextBirthday = new Date(yearPart, month - 1, day);
  } else {
    nextBirthday = new Date(thisYear, month - 1, day);
  }

  if (nextBirthday < today) {
    if (hasYear) {
      nextBirthday = new Date(thisYear + 1, month - 1, day);
    } else {
      nextBirthday = new Date(thisYear + 1, month - 1, day);
    }
  }

  const diff = nextBirthday.getTime() - today.getTime();
  const days = Math.ceil(diff / DAY_MS);

  return days >= 0 && days <= withinDays ? days : null;
}

export function formatBirthday(birthdayStr: string | null | undefined): string {
  if (!birthdayStr) return "";
  if (birthdayStr.startsWith("--")) {
    return `${birthdayStr.slice(2, 4)}/${birthdayStr.slice(5)}`;
  }
  const [y, m, d] = birthdayStr.split("-");
  return `${y}/${m}/${d}`;
}
