import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = { KE: "#10b981", NG: "#f59e0b", ZA: "#6366f1", ET: "#ef4444", GH: "#3b82f6", TZ: "#8b5cf6", UG: "#ec4899" };

const INDICATORS = [
  { code: "NE.TRD.GNFS.ZS", label: "Trade (% of GDP)" },
  { code: "NE.EXP.GNFS.ZS", label: "Exports (% of GDP)" },
  { code: "NE.IMP.GNFS.ZS", label: "Imports (% of GDP)" },
];

const TradeChart = ({ data }) => {
  const [selected, setSelected] = useState("NE.TRD.GNFS.ZS");

  if (!data) return <div style={s.empty}>No trade data yet — trigger the pipeline.</div>;

  const filtered = data.data || [];
  const countries = [...new Set(filtered.map(d => d.country_code))];
  const years = [...new Set(filtered.map(d => d.year))].sort();

  const chartData = years.map(year => {
    const row = { year };
    countries.forEach(cc => {
      const point = filtered.find(d => d.year === year && d.country_code === cc);
      row[cc] = point ? +point.value.toFixed(2) : null;
    });
    return row;
  });

  return (
    <div style={s.card}>
      <div style={s.header}>
        <p style={s.title}>Africa trade indicators</p>
        <select style={s.select} value={selected} onChange={e => setSelected(e.target.value)}>
          {INDICATORS.map(ind => <option key={ind.code} value={ind.code}>{ind.label}</option>)}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="year" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#1f2937" }} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
          <Tooltip formatter={(v) => v !== null ? `${v}%` : "N/A"} contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }} labelStyle={{ color: "#9ca3af" }} itemStyle={{ color: "#f9fafb" }} />
          <Legend wrapperStyle={{ fontSize: "11px", color: "#6b7280" }} />
          {countries.map(cc => (
            <Line key={cc} type="monotone" dataKey={cc} stroke={COLORS[cc] || "#888"} strokeWidth={2} dot={false} connectNulls={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const s = {
  card: { background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "1.25rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  title: { color: "#d1d5db", fontSize: "13px", fontWeight: "600", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" },
  select: { background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#d1d5db", fontSize: "12px", padding: "4px 8px", outline: "none", cursor: "pointer" },
  empty: { background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "2rem", color: "#6b7280", fontSize: "13px", textAlign: "center" },
};

export default TradeChart;