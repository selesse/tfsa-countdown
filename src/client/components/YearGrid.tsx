import type { YearStatus } from "../../tfsa";

interface Props {
  yearStatus: YearStatus[];
}

function fmt(n: number): string {
  if (n === 0) return "$0";
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `$${n}`;
}

function getActiveYear(years: YearStatus[]): number | null {
  const partial = years.find((y) => y.status === "partial");
  if (partial) return partial.year;
  const empty = years.find((y) => y.status === "empty");
  return empty?.year ?? null;
}

export function YearGrid({ yearStatus }: Props) {
  const activeYear = getActiveYear(yearStatus);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
      gap: 12,
      marginBottom: 24,
    }}>
      {yearStatus.map((y) => {
        const isActive = y.year === activeYear;
        const fillPct = y.limit > 0 ? (y.contributed / y.limit) * 100 : 0;

        const cardBg =
          y.status === "done"
            ? "linear-gradient(135deg, #00b894, #00cec9)"
            : y.status === "partial"
              ? "#1e2340"
              : "#16213e";

        const borderStyle = isActive
          ? "2px solid #a29bfe"
          : y.status === "done"
            ? "2px solid transparent"
            : "2px solid transparent";

        const glowStyle = isActive
          ? "0 0 16px rgba(162, 155, 254, 0.4)"
          : y.status === "done"
            ? "0 0 12px rgba(0, 184, 148, 0.3)"
            : "none";

        return (
          <div
            key={y.year}
            style={{
              background: cardBg,
              border: borderStyle,
              borderRadius: 12,
              padding: "16px 14px",
              boxShadow: glowStyle,
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Year label */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}>
              <span style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: y.status === "done" ? "#fff" : "#eee",
              }}>
                {y.year}
              </span>
              {y.status === "done" && (
                <span style={{ fontSize: "1.2rem" }}>✓</span>
              )}
              {isActive && y.status !== "done" && (
                <span style={{ fontSize: "0.7rem", color: "#a29bfe", fontWeight: 600 }}>
                  ACTIVE
                </span>
              )}
            </div>

            {/* Amounts */}
            <div style={{ marginBottom: 8 }}>
              {y.status === "done" ? (
                <div style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.9)" }}>
                  {fmt(y.limit)} ✓
                </div>
              ) : y.status === "partial" ? (
                <div style={{ fontSize: "0.85rem", color: "#fdcb6e" }}>
                  {fmt(y.contributed)} <span style={{ color: "#888" }}>/ {fmt(y.limit)}</span>
                </div>
              ) : (
                <div style={{ fontSize: "0.85rem", color: "#555" }}>
                  {fmt(y.limit)}
                </div>
              )}
            </div>

            {/* Fill bar (only for non-done years) */}
            {y.status !== "done" && (
              <div style={{
                background: "#2d3436",
                borderRadius: 4,
                height: 6,
                overflow: "hidden",
              }}>
                <div style={{
                  background: y.status === "partial"
                    ? "linear-gradient(90deg, #fdcb6e, #e17055)"
                    : "transparent",
                  height: "100%",
                  width: `${fillPct}%`,
                  borderRadius: 4,
                  transition: "width 0.6s ease",
                }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
