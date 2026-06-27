import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = { KE: "#10b981", NG: "#f59e0b", ZA: "#6366f1", ET: "#ef4444", GH: "#3b82f6", TZ: "#8b5cf6", UG: "#ec4899" };

const PopulationChart = ({ data }) => {
  if (!data?.length) return <div style={s.empty}>No population data yet — trigger the pipeline.</div>;

  const countries = [...new Set(data.map(d => d.country_code))];
  const years = [...new Set(data.map(d => d.year))].sort();

  const chartData = years.map(year => {
    const row = { year };
    countries.forEach(cc => {
      const point = data.find(d => d.year === year && d.country_code === cc);
      row[cc] = point ? Math.round(point.value / 1_000_000) : null;
    });
    return row;
  });

  return (
    <div style={s.card}>
      <div style={s.header}>
        <p style={s.title}>Population growth — East Africa</p>
        <span style={s.unit}>millions</span>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="year" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#1f2937" }} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}M`} />
          <Tooltip formatter={(v) => v !== null ? `${v}M` : "N/A"} contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }} labelStyle={{ color: "#9ca3af" }} itemStyle={{ color: "#f9fafb" }} />
          <Legend wrapperStyle={{ fontSize: "11px", color: "#6b7280" }} />
          {countries.map(cc => (
            <Area key={cc} type="monotone" dataKey={cc} stroke={COLORS[cc] || "#888"} fill={COLORS[cc] + "18" || "#88888818"} strokeWidth={2} dot={false} connectNulls={false} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const s = {
  card: { background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "1.25rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  title: { color: "#d1d5db", fontSize: "13px", fontWeight: "600", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" },
  unit: { color: "#4b5563", fontSize: "11px" },
  empty: { background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "2rem", color: "#6b7280", fontSize: "13px", textAlign: "center" },
};

export default PopulationChart;