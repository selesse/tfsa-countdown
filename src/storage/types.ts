import type { YearStatus } from "../tfsa";

export interface Summary {
  totalContributed: number;
  totalRoom: number;
  yearStatus: YearStatus[];
  firstEligibleYear?: number;
}

export interface Contribution {
  id: string; // string covers both DB integers and crypto.randomUUID()
  amount: number;
  contributed_at: string;
  note: string | null;
}

export interface StorageAdapter {
  getSummary(): Promise<Summary>;
  getContributions(): Promise<Contribution[]>;
  addContribution(amount: number, date: string, note?: string): Promise<Summary>;
}
