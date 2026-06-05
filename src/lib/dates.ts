export function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeMonth(value: unknown) {
  if (typeof value === "string" && /^\d{4}-\d{2}$/.test(value)) {
    return value;
  }

  return getCurrentMonth();
}

export function monthBounds(month: string) {
  const [yearValue, monthValue] = month.split("-").map(Number);
  const start = `${month}-01`;
  const nextMonth = monthValue === 12 ? 1 : monthValue + 1;
  const nextYear = monthValue === 12 ? yearValue + 1 : yearValue;
  const end = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  return { start, end };
}

export function toMonthDisplay(month: string) {
  const [year, monthNumber] = month.split("-");

  return `${monthNumber}/${year}`;
}
