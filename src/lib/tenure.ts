import type { Lang } from "../i18n/ui";

export interface YearMonth {
  year: number;
  month: number;
}

export function formatTenure(start: YearMonth, end: YearMonth, lang: Lang) {
  const totalMonths =
    (end.year - start.year) * 12 + (end.month - start.month) + 1;
  const months = Math.max(totalMonths, 0);
  const years = Math.floor(months / 12);
  const remainder = months % 12;

  if (lang === "pt") {
    return [years > 0 ? `${years}a` : "", remainder > 0 ? `${remainder}m` : ""]
      .filter(Boolean)
      .join(" ");
  }

  const yearLabel = years === 1 ? "1 yr" : years > 1 ? `${years} yrs` : "";
  const monthLabel =
    remainder === 1 ? "1 mo" : remainder > 1 ? `${remainder} mos` : "";
  return [yearLabel, monthLabel].filter(Boolean).join(" ");
}
