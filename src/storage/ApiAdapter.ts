import type { StorageAdapter, Summary, Contribution } from "./types";

export class ApiAdapter implements StorageAdapter {
  async getSummary(): Promise<Summary> {
    const res = await fetch("/api/summary");
    return res.json() as Promise<Summary>;
  }

  async getContributions(): Promise<Contribution[]> {
    const res = await fetch("/api/contributions");
    const data = (await res.json()) as Array<{
      id: number;
      amount: number;
      contributed_at: string;
      note: string | null;
    }>;
    return data.map((c) => ({ ...c, id: c.id.toString() }));
  }

  async addContribution(amount: number, date: string, note?: string): Promise<Summary> {
    const res = await fetch("/api/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, date, note }),
    });
    if (!res.ok) {
      const err = (await res.json()) as { error: string };
      throw new Error(err.error);
    }
    return res.json() as Promise<Summary>;
  }
}
