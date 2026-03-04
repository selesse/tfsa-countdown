import { useState } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Onboarding } from "./Onboarding";
import { LocalAdapter } from "../storage/LocalAdapter";
import { getFirstEligibleYear } from "../tfsa";
import type { StorageAdapter } from "../storage/types";

const btnStyle: React.CSSProperties = {
  background: "#1a1a2e",
  color: "#888",
  border: "1px solid #2d3436",
  borderRadius: 6,
  padding: "6px 14px",
  fontSize: "0.8rem",
  cursor: "pointer",
};

function ExportImport({ adapter }: { adapter: LocalAdapter }) {
  async function handleExport() {
    const contributions = await adapter.getContributions();
    const json = JSON.stringify(contributions, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tfsa-contributions.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        localStorage.setItem("tfsa_contributions", text);
        window.location.reload();
      } catch {
        alert("Failed to import. Make sure it's a valid export file.");
      }
    };
    input.click();
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 24px", display: "flex", gap: 8 }}>
      <button onClick={handleExport} style={btnStyle}>Export JSON</button>
      <button onClick={handleImport} style={btnStyle}>Import JSON</button>
    </div>
  );
}

function StaticRoot() {
  const [adapter, setAdapter] = useState<StorageAdapter | null>(() => {
    const raw = localStorage.getItem("tfsa_config");
    if (!raw) return null;
    const { totalRoom, birthYear } = JSON.parse(raw) as { totalRoom: number; birthYear: number };
    return new LocalAdapter(totalRoom, getFirstEligibleYear(birthYear));
  });

  if (!adapter) return <Onboarding onComplete={setAdapter} />;

  return (
    <>
      <App storage={adapter} />
      <ExportImport adapter={adapter as LocalAdapter} />
    </>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("No #root element found");

createRoot(root).render(<StaticRoot />);
