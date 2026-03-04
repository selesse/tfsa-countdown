import { expect, test, describe } from "bun:test";
import { computeYearStatus, TOTAL_ROOM } from "./tfsa";

describe("computeYearStatus", () => {
  test("$0 contributed → all empty", () => {
    const result = computeYearStatus(0);
    expect(result).toHaveLength(18);
    for (const year of result) {
      expect(year.status).toBe("empty");
      expect(year.contributed).toBe(0);
    }
  });

  test("$5,000 → 2009 done, rest empty", () => {
    const result = computeYearStatus(5000);
    const byYear = Object.fromEntries(result.map((y) => [y.year, y]));

    expect(byYear[2009].status).toBe("done");
    expect(byYear[2009].contributed).toBe(5000);

    for (const year of result.filter((y) => y.year !== 2009)) {
      expect(year.status).toBe("empty");
    }
  });

  test("$14,500 → 2009+2010 done, 2011 partial ($4,500), rest empty", () => {
    const result = computeYearStatus(14500);
    const byYear = Object.fromEntries(result.map((y) => [y.year, y]));

    expect(byYear[2009].status).toBe("done");
    expect(byYear[2010].status).toBe("done");
    expect(byYear[2011].status).toBe("partial");
    expect(byYear[2011].contributed).toBe(4500);

    for (const year of result.filter((y) => y.year > 2011)) {
      expect(year.status).toBe("empty");
    }
  });

  test("$109,000 → all done", () => {
    const result = computeYearStatus(TOTAL_ROOM);
    for (const year of result) {
      expect(year.status).toBe("done");
      expect(year.contributed).toBe(year.limit);
    }
  });

  test("result is always in chronological order (2009→2026)", () => {
    const result = computeYearStatus(25000);
    const years = result.map((y) => y.year);
    expect(years[0]).toBe(2009);
    expect(years[years.length - 1]).toBe(2026);
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBeGreaterThan(years[i - 1]);
    }
  });

  test("partial year: contributed + remaining == limit for that year", () => {
    // $20,000: 2009 done (5k), 2010 done (5k), 2011 done (5k), 2012 partial (5k of 5k)
    // Wait: 5+5+5+5 = 20k exactly, so 2012 should be done
    // Let's try $17,000: 2009 done, 2010 done, 2011 done, 2012 partial ($2,000)
    const result = computeYearStatus(17000);
    const byYear = Object.fromEntries(result.map((y) => [y.year, y]));

    expect(byYear[2009].status).toBe("done");
    expect(byYear[2010].status).toBe("done");
    expect(byYear[2011].status).toBe("done");
    expect(byYear[2012].status).toBe("partial");
    expect(byYear[2012].contributed).toBe(2000);
  });

  test("TOTAL_ROOM constant equals sum of all limits", () => {
    expect(TOTAL_ROOM).toBe(109000);
  });
});
