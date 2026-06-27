import React, { useState, useEffect, useCallback } from "react";
import ForexChart from "./components/ForexChart";
import TradeChart from "./components/TradeChart";
import PopulationChart from "./components/PopulationChart";
import PipelineStatus from "./components/PipelineStatus";
import { fetchSummary, fetchForex, fetchTrade, fetchPopulation, fetchPipelineRuns } from "./api/client";

function StatCard({ label, value, color }) {
  return (
    <div style={sc.card}>
      <div style={{ ...sc.bar, background: color }} />
      <div style={sc.body}>
        <p style={sc.label}>{label}</p>
        <p style={sc.value}>{value ?? "—"}</p>
      </div>
    </div>
  );
}

const sc = {
  card: { background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", overflow: "hidden", flex: 1, minWidth: "140px" },
  bar: { height: "4px" },
  body: { padding: "1rem" },
  label: { color: "#6b7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px 0" },
  value: { color: "#f9fafb", fontSize: "26px", fontWeight: "700", margin: 0, fontFamily: "'IBM Plex Mono', monospace" },
};

export default function App() {
  const [summary, setSummary] = useState(null);
  const [forex, setForex] = useState(null);
  const [trade, setTrade] = useState(null);
  const [population, setPopulation] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sum, fx, tr, pop, pipeRuns] = await Promise.allSettled([
        fetchSummary(), fetchForex(),
        fetchTrade("NE.TRD.GNFS.ZS"), fetchPopulation(), fetchPipelineRuns(),
      ]);
      if (sum.status === "fulfilled") setSummary(sum.value);
      if (fx.status === "fulfilled") setForex(fx.value);
      if (tr.status === "fulfilled") setTrade(tr.value);
      if (pop.status === "fulfilled") setPopulation(pop.value);
      if (pipeRuns.status === "fulfilled") setRuns(pipeRuns.value);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  return (
    <div style={s.app}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>ETL Pipeline · BI Dashboard</h1>
          <p style={s.sub}>Forex · Trade · Population — Africa · Powered by APScheduler + FastAPI</p>
        </div>
        <button style={s.refreshBtn} onClick={loadAll}>↻ Refresh</button>
      </header>

      {/* Stat cards */}
      <div style={s.cardRow}>
        <StatCard label="Forex pairs" value={summary?.forex_currencies} color="#10b981" />
        <StatCard label="Trade records" value={summary?.trade_records?.toLocaleString()} color="#f59e0b" />
        <StatCard label="Population records" value={summary?.population_records?.toLocaleString()} color="#6366f1" />
        <StatCard label="Last run status" value={summary?.latest_run?.status ?? "none"} color={summary?.latest_run?.status === "success" ? "#22c55e" : "#ef4444"} />
      </div>

      {/* Charts row 1 */}
      <div style={s.row}>
        <div style={{ flex: 1, minWidth: "280px" }}><ForexChart data={forex} /></div>
        <div style={{ flex: 1, minWidth: "280px" }}><TradeChart data={trade} /></div>
      </div>

      {/* Charts row 2 */}
      <div style={{ ...s.row, marginTop: "12px" }}>
        <div style={{ flex: 2, minWidth: "300px" }}><PopulationChart data={population} /></div>
        <div style={{ flex: 1, minWidth: "260px" }}><PipelineStatus runs={runs} onTriggered={loadAll} /></div>
      </div>

      <footer style={s.footer}>
        Data: Open Exchange Rates · World Bank · Scheduled hourly via APScheduler · Deployed on Render
      </footer>
    </div>
  );
}

const s = {
  app: { minHeight: "100vh", background: "#030712", color: "#f9fafb", fontFamily: "'Inter', system-ui, sans-serif", padding: "1.5rem 2rem 3rem", maxWidth: "1200px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem", paddingBottom: "1.25rem", borderBottom: "1px solid #1f2937" },
  title: { margin: 0, fontSize: "20px", fontWeight: "700", color: "#f9fafb" },
  sub: { margin: "4px 0 0", fontSize: "12px", color: "#4b5563" },
  refreshBtn: { background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#d1d5db", fontSize: "13px", padding: "6px 14px", cursor: "pointer" },
  cardRow: { display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" },
  row: { display: "flex", gap: "12px", flexWrap: "wrap" },
  footer: { marginTop: "2.5rem", textAlign: "center", color: "#374151", fontSize: "12px", borderTop: "1px solid #111827", paddingTop: "1.5rem" },
};