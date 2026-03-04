// Change this one line to swap fill direction:
export const FILL_ORDER: "asc" | "desc" = "asc";

export const TFSA_YEARS: { year: number; limit: number }[] = [
  { year: 2009, limit: 5000 },
  { year: 2010, limit: 5000 },
  { year: 2011, limit: 5000 },
  { year: 2012, limit: 5000 },
  { year: 2013, limit: 5500 },
  { year: 2014, limit: 5500 },
  { year: 2015, limit: 10000 },
  { year: 2016, limit: 5500 },
  { year: 2017, limit: 5500 },
  { year: 2018, limit: 5500 },
  { year: 2019, limit: 6000 },
  { year: 2020, limit: 6000 },
  { year: 2021, limit: 6000 },
  { year: 2022, limit: 6000 },
  { year: 2023, limit: 6500 },
  { year: 2024, limit: 7000 },
  { year: 2025, limit: 7000 },
  { year: 2026, limit: 7000 },
];

export const TOTAL_ROOM = TFSA_YEARS.reduce((sum, y) => sum + y.limit, 0); // 109000

export function getYearsInFillOrder() {
  return FILL_ORDER === "asc"
    ? TFSA_YEARS // 2009 → 2026
    : [...TFSA_YEARS].reverse(); // 2026 → 2009
}

export interface YearStatus {
  year: number;
  limit: number;
  contributed: number;
  status: "done" | "partial" | "empty";
}

export function computeYearStatus(totalContributed: number): YearStatus[] {
  const yearsInOrder = getYearsInFillOrder();
  let remaining = totalContributed;

  const statusMap = new Map<number, YearStatus>();

  for (const { year, limit } of yearsInOrder) {
    if (remaining >= limit) {
      remaining -= limit;
      statusMap.set(year, { year, limit, contributed: limit, status: "done" });
    } else if (remaining > 0) {
      statusMap.set(year, {
        year,
        limit,
        contributed: remaining,
        status: "partial",
      });
      remaining = 0;
    } else {
      statusMap.set(year, { year, limit, contributed: 0, status: "empty" });
    }
  }

  // Always return in chronological order (2009 → 2026) for display
  return TFSA_YEARS.map(({ year }) => statusMap.get(year) as YearStatus);
}

export function getFirstEligibleYear(birthYear: number): number {
  return Math.max(2009, birthYear + 18);
}

export function getTotalRoomForBirthYear(birthYear: number): number {
  const firstEligibleYear = getFirstEligibleYear(birthYear);
  return TFSA_YEARS
    .filter((y) => y.year >= firstEligibleYear)
    .reduce((sum, y) => sum + y.limit, 0);
}
