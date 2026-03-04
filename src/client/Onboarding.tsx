import { useState } from "react";
import { getTotalRoomForBirthYear, getFirstEligibleYear } from "../tfsa";
import { LocalAdapter } from "../storage/LocalAdapter";
import type { StorageAdapter } from "../storage/types";

interface Props {
  onComplete: (adapter: StorageAdapter) => void;
}

export function Onboarding({ onComplete }: Props) {
  const [birthYear, setBirthYear] = useState("");
  const [remainingRoom, setRemainingRoom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const year = Number.parseInt(birthYear);
    const remaining = Number.parseFloat(remainingRoom.replace(/,/g, ""));

    if (!year || year < 1971 || year > 2008) {
      setError("Enter a valid birth year (1971–2008)");
      return;
    }
    if (Number.isNaN(remaining) || remaining < 0) {
      setError("Enter a valid remaining TFSA room (0 or more)");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const totalRoom = getTotalRoomForBirthYear(year);
      const firstEligibleYear = getFirstEligibleYear(year);
      const priorAmount = totalRoom - remaining;

      localStorage.setItem("tfsa_config", JSON.stringify({ birthYear: year, totalRoom }));

      const adapter = new LocalAdapter(totalRoom, firstEligibleYear);

      if (priorAmount > 0) {
        await adapter.addContribution(priorAmount, "2009-01-01", "Opening balance (from CRA)");
      }

      onComplete(adapter);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "#0f0f1a",
    border: "1px solid #2d3436",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#eee",
    fontSize: "1rem",
    width: "100%",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#888",
    fontSize: "0.8rem",
    marginBottom: 6,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px 16px" }}>
      <div style={{ maxWidth: 480, width: "100%" }}>
        <div style={{ background: "#1a1a2e", borderRadius: 16, padding: "32px 28px" }}>
          <h1 style={{ fontSize: "1.4rem", marginBottom: 8, color: "#a29bfe" }}>
            TFSA Countdown
          </h1>
          <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: 28 }}>
            Set up your personal TFSA tracker. Your data stays in your browser.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Birth year</label>
              <input
                type="number"
                min="1971"
                max="2008"
                placeholder="e.g. 1985"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                style={inputStyle}
                required
              />
              <div style={{ color: "#666", fontSize: "0.75rem", marginTop: 4 }}>
                Used to calculate your eligible TFSA years
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Remaining TFSA room (from CRA My Account)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 75000"
                value={remainingRoom}
                onChange={(e) => setRemainingRoom(e.target.value)}
                style={inputStyle}
                required
              />
              <div style={{ color: "#666", fontSize: "0.75rem", marginTop: 4 }}>
                Find this at canada.ca → My Account → TFSA
              </div>
            </div>

            {error && (
              <div style={{ color: "#e17055", fontSize: "0.85rem", marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "#2d3436" : "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 28px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                width: "100%",
              }}
            >
              {loading ? "Setting up..." : "Get Started"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
