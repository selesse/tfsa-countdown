import { useState } from "react";
import { Temporal } from "@js-temporal/polyfill";

interface Props {
  onPayment: (amount: number, date: string, note?: string) => Promise<void>;
}

export function LogPayment({ onPayment }: Props) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(Temporal.Now.plainDateISO().toString());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number.parseFloat(amount.replace(/,/g, ""));
    if (!parsed || parsed <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onPayment(parsed, date, note.trim() || undefined);
      setAmount("");
      setNote("");
    } catch {
      setError("Failed to log payment. Try again.");
    } finally {
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
    <div style={{
      background: "#1a1a2e",
      borderRadius: 16,
      padding: "24px 28px",
      marginBottom: 24,
    }}>
      <h2 style={{ fontSize: "1.1rem", marginBottom: 20, color: "#eee" }}>
        Log a Payment
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Amount ($)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Note (optional)</label>
          <input
            type="text"
            placeholder="e.g. Tax return deposit"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{ color: "#e17055", fontSize: "0.85rem", marginBottom: 12 }}>
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
            transition: "opacity 0.2s",
          }}
        >
          {loading ? "Logging..." : "Log Payment"}
        </button>
      </form>
    </div>
  );
}
