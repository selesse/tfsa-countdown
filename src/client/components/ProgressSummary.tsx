interface Props {
  totalContributed: number;
  totalRoom: number;
  doneCount: number;
  totalYears: number;
}

function fmt(n: number): string {
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
}

export function ProgressSummary({ totalContributed, totalRoom, doneCount, totalYears }: Props) {
  const pct = totalRoom > 0 ? (totalContributed / totalRoom) * 100 : 0;
  const roomLeft = totalRoom - totalContributed;

  return (
    <div style={{
      background: "#1a1a2e",
      borderRadius: 16,
      padding: "24px 28px",
      marginBottom: 24,
    }}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: 16, color: "#a29bfe" }}>
        TFSA Countdown
      </h1>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <div style={{ color: "#888", fontSize: "0.8rem", marginBottom: 4 }}>Contributed</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#00b894" }}>{fmt(totalContributed)}</div>
        </div>
        <div>
          <div style={{ color: "#888", fontSize: "0.8rem", marginBottom: 4 }}>Remaining</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fdcb6e" }}>{fmt(roomLeft)}</div>
        </div>
        <div>
          <div style={{ color: "#888", fontSize: "0.8rem", marginBottom: 4 }}>Years Done</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{doneCount} / {totalYears}</div>
        </div>
        <div>
          <div style={{ color: "#888", fontSize: "0.8rem", marginBottom: 4 }}>Progress</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#74b9ff" }}>{pct.toFixed(1)}%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        background: "#2d3436",
        borderRadius: 8,
        height: 12,
        overflow: "hidden",
      }}>
        <div style={{
          background: "linear-gradient(90deg, #00b894, #00cec9)",
          height: "100%",
          width: `${pct}%`,
          borderRadius: 8,
          transition: "width 0.6s ease",
        }} />
      </div>

      <div style={{ marginTop: 8, color: "#666", fontSize: "0.8rem" }}>
        of {fmt(totalRoom)} total room
      </div>
    </div>
  );
}
