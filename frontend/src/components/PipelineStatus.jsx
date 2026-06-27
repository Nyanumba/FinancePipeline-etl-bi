import React, { useState } from "react";
import { triggerPipeline } from "../api/client";

const STATUS_COLOR = {
  success: "#22c55e",
  failed: "#ef4444",
  partial: "#f59e0b",
  running: "#6366f1",
};

const PipelineStatus = ({ runs, onTriggered }) => {
  const [triggering, setTriggering] = useState(false);

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      await triggerPipeline();
      setTimeout(() => { onTriggered(); setTriggering(false); }, 3000);
    } catch {
      setTriggering(false);
    }
  };

  const latest = runs?.[0];

  return (
    <div style={s.card}>
      <div style={s.header}>
        <p style={s.title}>Pipeline status</p>
        <button style={{ ...s.btn, opacity: triggering ? 0.6 : 1 }} onClick={handleTrigger} disabled={triggering}>
          {triggering ? "Running…" : "▶ Run now"}
        </button>
      </div>

      {latest && (
        <div style={s.latest}>
          <span style={{ ...s.badge, background: STATUS_COLOR[latest.status] + "22", color: STATUS_COLOR[latest.status] }}>
            {latest.status}
          </span>
          <span style={s.meta}>
            {new Date(latest.started_at).toLocaleString()} ·{" "}
            {(latest.rows_forex + latest.rows_trade + latest.rows_population).toLocaleString()} rows
          </span>
        </div>
      )}

      <div style={s.runList}>
        {runs?.slice(0, 8).map((run) => (
          <div key={run.id} style={s.runRow}>
            <span style={{ ...s.dot, background: STATUS_COLOR[run.status] }} />
            <span style={s.runMeta}>
              #{run.id} · {run.status} · forex {run.rows_forex} · trade {run.rows_trade} · pop {run.rows_population}
            </span>
            <span style={s.runTime}>{new Date(run.started_at).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      <p style={s.note}>Auto-runs every hour via APScheduler</p>
    </div>
  );
};

const s = {
  card: { background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "1.25rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  title: { color: "#d1d5db", fontSize: "13px", fontWeight: "600", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" },
  btn: { background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#d1d5db", fontSize: "12px", padding: "6px 14px", cursor: "pointer" },
  latest: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  badge: { fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "6px" },
  meta: { color: "#6b7280", fontSize: "12px" },
  runList: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" },
  runRow: { display: "flex", alignItems: "center", gap: "8px" },
  dot: { width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0 },
  runMeta: { color: "#9ca3af", fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace", flex: 1 },
  runTime: { color: "#4b5563", fontSize: "11px" },
  note: { color: "#374151", fontSize: "11px", margin: 0 },
};

export default PipelineStatus;