import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const HIGHLIGHT = ["KES", "NGN", "ZAR", "ETB", "GHS", "TZS", "UGX"];

const ForexChart = ({ data }) => {
  if (!data?.length) return <div style={s.empty}>No forex data yet — trigger the pipeline.</div>;

  const african = data.filter(d => HIGHLIGHT.includes(d.currency));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div style={s.tooltip}>
          <p style={s.ttCur}>{payload[0].payload.currency}</p>
          <p style={s.ttVal}>1 USD = {payload[0].value.toLocaleString()} {payload[0].payload.currency}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={s.card}>
      <p style={s.title}>African currency rates vs USD</p>
      <p style={s.sub}>Live from Open Exchange Rates API</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={african} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="currency" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#1f2937" }} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => v.toLocaleString()} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
            {african.map((entry) => (
              <Cell key={entry.currency} fill={entry.currency === "KES" ? "#10b981" : "#6366f1"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const s = {
  card: { background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "1.25rem" },
  title: { color: "#d1d5db", fontSize: "13px", fontWeight: "600", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.06em" },
  sub: { color: "#4b5563", fontSize: "11px", margin: "0 0 1rem 0" },
  tooltip: { background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "10px 14px" },
  ttCur: { color: "#9ca3af", fontSize: "11px", margin: "0 0 4px 0" },
  ttVal: { color: "#f9fafb", fontSize: "14px", fontWeight: "600", margin: 0 },
  empty: { background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "2rem", color: "#6b7280", fontSize: "13px", textAlign: "center" },
};

export default ForexChart;