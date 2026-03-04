import confetti from "canvas-confetti";
import { useEffect, useRef, useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { LogPayment } from "./components/LogPayment";
import { ProgressSummary } from "./components/ProgressSummary";
import { YearGrid } from "./components/YearGrid";
import type { StorageAdapter, Summary, Contribution } from "../storage/types";

function fmt(n: number): string {
  return n.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  });
}

function formatDate(iso: string): string {
  return Temporal.PlainDate.from(iso).toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function App({ storage }: { storage: StorageAdapter }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [milestone, setMilestone] = useState<string | null>(null);
  const prevDoneYears = useRef<Set<number>>(new Set());
  const milestoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function fetchAll() {
    const [summaryData, contribData] = await Promise.all([
      storage.getSummary(),
      storage.getContributions(),
    ]);
    setSummary(summaryData);
    setContributions(contribData);
    prevDoneYears.current = new Set(
      summaryData.yearStatus.filter((y) => y.status === "done").map((y) => y.year),
    );
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function handlePayment(amount: number, date: string, note?: string) {
    const newSummary = await storage.addContribution(amount, date, note);
    const newDoneYears = newSummary.yearStatus
      .filter((y) => y.status === "done")
      .map((y) => y.year);

    const justCompleted = newDoneYears.filter(
      (y) => !prevDoneYears.current.has(y),
    );

    if (justCompleted.length > 0) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.4 },
        colors: ["#00b894", "#00cec9", "#a29bfe", "#fdcb6e"],
      });

      const yearsLeft =
        newSummary.yearStatus.filter((y) => y.status !== "done").length;
      const yearLabel =
        justCompleted.length === 1
          ? `${justCompleted[0]} filled!`
          : `${justCompleted.map(String).join(", ")} filled!`;

      const msg =
        yearsLeft === 0
          ? `${yearLabel} TFSA fully maxed out! 🎉`
          : `${yearLabel} ${yearsLeft} more year${yearsLeft !== 1 ? "s" : ""} to go!`;

      setMilestone(msg);
      if (milestoneTimer.current) clearTimeout(milestoneTimer.current);
      milestoneTimer.current = setTimeout(() => setMilestone(null), 5000);
    }

    setSummary(newSummary);
    prevDoneYears.current = new Set(newDoneYears);

    const contribData = await storage.getContributions();
    setContributions(contribData);
  }

  if (!summary) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#888" }}>
        Loading...
      </div>
    );
  }

  const doneCount = summary.yearStatus.filter((y) => y.status === "done").length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      {/* Milestone notification */}
      {milestone && (
        <div style={{
          background: "linear-gradient(135deg, #00b894, #00cec9)",
          color: "#fff",
          borderRadius: 12,
          padding: "14px 20px",
          marginBottom: 20,
          fontSize: "1rem",
          fontWeight: 600,
          textAlign: "center",
          animation: "fadeIn 0.3s ease",
        }}>
          {milestone}
        </div>
      )}

      <ProgressSummary
        totalContributed={summary.totalContributed}
        totalRoom={summary.totalRoom}
        doneCount={doneCount}
        totalYears={summary.yearStatus.length}
      />

      <YearGrid yearStatus={summary.yearStatus} />

      <LogPayment onPayment={handlePayment} />

      {/* Contribution history */}
      {contributions.length > 0 && (
        <div style={{
          background: "#1a1a2e",
          borderRadius: 16,
          padding: "24px 28px",
        }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: 16, color: "#eee" }}>
            Contribution History
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {contributions.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  background: "#0f0f1a",
                  borderRadius: 8,
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: "#00b894", fontSize: "1rem" }}>
                    {fmt(c.amount)}
                  </span>
                  {c.note && (
                    <span style={{ color: "#888", fontSize: "0.85rem", marginLeft: 10 }}>
                      {c.note}
                    </span>
                  )}
                </div>
                <span style={{ color: "#666", fontSize: "0.85rem" }}>
                  {formatDate(c.contributed_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
