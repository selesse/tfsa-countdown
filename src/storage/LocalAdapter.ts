import { computeYearStatus } from "../tfsa";
import type { StorageAdapter, Summary, Contribution } from "./types";

const STORAGE_KEY = "tfsa_contributions";

export class LocalAdapter implements StorageAdapter {
  private totalRoom: number;
  private firstEligibleYear: number;

  constructor(totalRoom: number, firstEligibleYear: number) {
    this.totalRoom = totalRoom;
    this.firstEligibleYear = firstEligibleYear;
  }

  private load(): Contribution[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Contribution[]) : [];
    } catch {
      return [];
    }
  }

  private save(contributions: Contribution[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contributions));
  }

  private computeSummary(contributions: Contribution[]): Summary {
    const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0);
    const allYearStatus = computeYearStatus(totalContributed);
    const yearStatus = allYearStatus.filter((y) => y.year >= this.firstEligibleYear);
    return {
      totalContributed,
      totalRoom: this.totalRoom,
      yearStatus,
      firstEligibleYear: this.firstEligibleYear,
    };
  }

  async getSummary(): Promise<Summary> {
    return this.computeSummary(this.load());
  }

  async getContributions(): Promise<Contribution[]> {
    return this.load().sort((a, b) => b.contributed_at.localeCompare(a.contributed_at));
  }

  async addContribution(amount: number, date: string, note?: string): Promise<Summary> {
    const contributions = this.load();
    contributions.push({
      id: crypto.randomUUID(),
      amount,
      contributed_at: date,
      note: note ?? null,
    });
    this.save(contributions);
    return this.computeSummary(contributions);
  }
}
