import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis, Legend } from "recharts";

// --- DATA ---
const fatalRaw = [
  { mechanism: "Drug Poisoning", intent: "Unintentional", deaths: 97231, combinedTotal: 1100, unit: "B" },
  { mechanism: "Firearm", intent: "Suicide", deaths: 27300, combinedTotal: 271.36, unit: "B" },
  { mechanism: "Firearm", intent: "Homicide", deaths: 17927, combinedTotal: 215.37, unit: "B" },
  { mechanism: "Motor Vehicle", intent: "Unintentional", deaths: 43273, combinedTotal: 456.99, unit: "B" },
  { mechanism: "Fall", intent: "Unintentional", deaths: 47026, combinedTotal: 194.59, unit: "B" },
  { mechanism: "Suffocation", intent: "Suicide", deaths: 12023, combinedTotal: 136.79, unit: "B" },
  { mechanism: "Suffocation", intent: "Unintentional", deaths: 7333, combinedTotal: 60.57, unit: "B" },
  { mechanism: "Drug Poisoning", intent: "Suicide", deaths: 4660, combinedTotal: 48.30, unit: "B" },
  { mechanism: "Drowning", intent: "Unintentional", deaths: 4310, combinedTotal: 49.20, unit: "B" },
  { mechanism: "Fire/Flame", intent: "Unintentional", deaths: 3375, combinedTotal: 29.42, unit: "B" },
  { mechanism: "Non-Drug Poisoning", intent: "Unintentional", deaths: 3073, combinedTotal: 33.44, unit: "B" },
  { mechanism: "Drug Poisoning", intent: "Undetermined", deaths: 2903, combinedTotal: 33.12, unit: "B" },
  { mechanism: "Natural/Environmental", intent: "Unintentional", deaths: 2880, combinedTotal: 24.40, unit: "B" },
  { mechanism: "Cut/Pierce", intent: "Homicide", deaths: 1704, combinedTotal: 19.20, unit: "B" },
  { mechanism: "Fall", intent: "Suicide", deaths: 1297, combinedTotal: 14.10, unit: "B" },
  { mechanism: "Non-Drug Poisoning", intent: "Suicide", deaths: 1284, combinedTotal: 13.31, unit: "B" },
  { mechanism: "Transport Other", intent: "Unintentional", deaths: 1292, combinedTotal: 13.57, unit: "B" },
  { mechanism: "Struck by/against", intent: "Unintentional", deaths: 1013, combinedTotal: 9.80, unit: "B" },
  { mechanism: "Pedal Cyclist", intent: "Unintentional", deaths: 440, combinedTotal: 4.20, unit: "B" },
  { mechanism: "Cut/Pierce", intent: "Suicide", deaths: 1047, combinedTotal: 10.75, unit: "B" },
];

const nonfatalRaw = [
  { mechanism: "Fall", intent: "Unintentional", hospitalizations: 1850000, combinedTotal: 495.80, unit: "B" },
  { mechanism: "Poisoning", intent: "Unintentional", hospitalizations: 344683, combinedTotal: 18.81, unit: "B" },
  { mechanism: "Overexertion", intent: "Unintentional", hospitalizations: 49545, combinedTotal: 9.47, unit: "B" },
  { mechanism: "Fire/Burn", intent: "Unintentional", hospitalizations: 45297, combinedTotal: 7.34, unit: "B" },
  { mechanism: "Firearm", intent: "Assault", hospitalizations: 70772, combinedTotal: 15.55, unit: "B" },
  { mechanism: "Cut/Pierce", intent: "Unintentional", hospitalizations: 56642, combinedTotal: 6.89, unit: "B" },
  { mechanism: "Cut/Pierce", intent: "Self-Harm", hospitalizations: 69112, combinedTotal: 5.33, unit: "B" },
  { mechanism: "Cut/Pierce", intent: "Assault", hospitalizations: 32587, combinedTotal: 5.44, unit: "B" },
  { mechanism: "Firearm", intent: "Unintentional", hospitalizations: 14184, combinedTotal: 2.61, unit: "B" },
  { mechanism: "Firearm", intent: "Self-Harm", hospitalizations: 5141, combinedTotal: 1.74, unit: "B" },
  { mechanism: "Bite: Other", intent: "Unintentional", hospitalizations: 32306, combinedTotal: 3.79, unit: "B" },
  { mechanism: "Bite: Dog", intent: "Unintentional", hospitalizations: 19499, combinedTotal: 2.21, unit: "B" },
  { mechanism: "Inhalation/Suffocation", intent: "Self-Harm", hospitalizations: 8605, combinedTotal: 3.66, unit: "B" },
  { mechanism: "Inhalation/Suffocation", intent: "Unintentional", hospitalizations: 12366, combinedTotal: 0.95, unit: "B" },
  { mechanism: "Machinery", intent: "Unintentional", hospitalizations: 12191, combinedTotal: 2.36, unit: "B" },
  { mechanism: "Foreign Body", intent: "Unintentional", hospitalizations: 44837, combinedTotal: 3.13, unit: "B" },
  { mechanism: "Natural/Environmental", intent: "Unintentional", hospitalizations: 13247, combinedTotal: 1.25, unit: "B" },
];

const INTENT_COLORS = {
  "Unintentional": "#e8855a",
  "Suicide": "#7c6fcd",
  "Homicide": "#e05c6f",
  "Self-Harm": "#b563b5",
  "Assault": "#e05c6f",
  "Undetermined": "#8baa7e",
  "Legal Intervention": "#5a9eb5",
};

const INTENT_ORDER = ["Unintentional", "Suicide", "Homicide", "Self-Harm", "Assault", "Undetermined", "Legal Intervention"];

function formatB(val) {
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}T`;
  if (val >= 1) return `$${val.toFixed(1)}B`;
  return `$${(val * 1000).toFixed(0)}M`;
}

function formatCount(val) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toString();
}

const CustomTooltip = ({ active, payload, label, mode }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: "#0f0f14",
        border: "1px solid #2a2a3a",
        borderRadius: "8px",
        padding: "12px 16px",
        fontFamily: "'DM Mono', monospace",
        fontSize: "12px",
        color: "#e0dff5",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        maxWidth: "220px"
      }}>
        <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: 6, color: "#fff" }}>
          {d.mechanism}
        </div>
        <div style={{ color: "#9b9abf", marginBottom: 4 }}>Intent: <span style={{ color: INTENT_COLORS[d.intent] || "#e0dff5" }}>{d.intent}</span></div>
        <div style={{ color: "#9b9abf", marginBottom: 4 }}>
          {mode === "fatal" ? "Deaths" : "Hospitalizations"}:{" "}
          <span style={{ color: "#fff" }}>{formatCount(mode === "fatal" ? d.deaths : d.hospitalizations)}</span>
        </div>
        <div style={{ color: "#9b9abf" }}>
          Combined Cost: <span style={{ color: "#f0c96a", fontWeight: 700 }}>{formatB(d.combinedTotal)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [mode, setMode] = useState("fatal");
  const [sortBy, setSortBy] = useState("cost");
  const [filterIntent, setFilterIntent] = useState("All");
  const [topN, setTopN] = useState(12);

  const data = mode === "fatal" ? fatalRaw : nonfatalRaw;

  const allIntents = useMemo(() => {
    const s = new Set(data.map(d => d.intent));
    return ["All", ...INTENT_ORDER.filter(i => s.has(i))];
  }, [data]);

  const filtered = useMemo(() => {
    let d = filterIntent === "All" ? data : data.filter(r => r.intent === filterIntent);
    d = [...d].sort((a, b) => sortBy === "cost"
      ? b.combinedTotal - a.combinedTotal
      : (mode === "fatal" ? b.deaths - a.deaths : b.hospitalizations - a.hospitalizations)
    );
    return d.slice(0, topN);
  }, [data, filterIntent, sortBy, topN, mode]);

  const total = useMemo(() => filtered.reduce((s, d) => s + d.combinedTotal, 0), [filtered]);

  // For scatter: cost per death/hosp
  const scatterData = useMemo(() => {
    return filtered.map(d => ({
      ...d,
      count: mode === "fatal" ? d.deaths : d.hospitalizations,
      costPer: d.combinedTotal * 1e9 / (mode === "fatal" ? d.deaths : d.hospitalizations),
      label: `${d.mechanism} (${d.intent})`
    })).filter(d => d.count > 0 && isFinite(d.costPer));
  }, [filtered, mode]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#09090f",
      color: "#e0dff5",
      fontFamily: "'DM Mono', monospace",
      padding: "0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .tab-btn {
          background: transparent;
          border: 1px solid #2a2a3a;
          color: #6b6a8f;
          padding: 8px 20px;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.08em;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .tab-btn:hover { border-color: #5a58a0; color: #c0bfef; }
        .tab-btn.active { background: #1e1d2e; border-color: #7c6fcd; color: #c8c6ff; }
        .filter-btn {
          background: transparent;
          border: 1px solid #1e1d2e;
          border-radius: 20px;
          color: #6b6a8f;
          padding: 5px 14px;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .filter-btn:hover { border-color: #3a3a5a; color: #c0bfef; }
        .filter-btn.active { border-color: #7c6fcd; color: #c8c6ff; background: #1a192b; }
        .stat-card {
          background: #0f0f1a;
          border: 1px solid #1a1a2e;
          border-radius: 8px;
          padding: 16px 20px;
        }
        select {
          background: #0f0f1a;
          border: 1px solid #2a2a3a;
          color: #c0bfef;
          padding: 6px 10px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          border-radius: 4px;
          cursor: pointer;
          outline: none;
        }
        .recharts-cartesian-axis-tick text { font-family: 'DM Mono', monospace !important; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1a1a2e",
        padding: "28px 40px 20px",
        background: "linear-gradient(180deg, #0f0e1a 0%, #09090f 100%)"
      }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#5a58a0", textTransform: "uppercase", marginBottom: 6 }}>
              Actuarial Analysis · United States
            </div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(22px, 4vw, 34px)",
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1.1
            }}>
              Injury Cost Dashboard
            </h1>
            <div style={{ fontSize: "11px", color: "#5a58a0", marginTop: 6 }}>
              Economic burden of fatal & nonfatal injuries · CDC WISQARS data
            </div>
          </div>

          {/* Mode Tabs */}
          <div style={{ display: "flex" }}>
            <button className={`tab-btn${mode === "fatal" ? " active" : ""}`}
              style={{ borderRadius: "4px 0 0 4px" }}
              onClick={() => { setMode("fatal"); setFilterIntent("All"); }}>
              ⚰ Fatal
            </button>
            <button className={`tab-btn${mode === "nonfatal" ? " active" : ""}`}
              style={{ borderRadius: "0 4px 4px 0", borderLeft: "none" }}
              onClick={() => { setMode("nonfatal"); setFilterIntent("All"); }}>
              🏥 Nonfatal
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 40px" }}>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
          <div className="stat-card">
            <div style={{ fontSize: "10px", color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>Showing</div>
            <div style={{ fontSize: "22px", fontWeight: 500, color: "#fff" }}>{filtered.length}</div>
            <div style={{ fontSize: "11px", color: "#6b6a8f", marginTop: 2 }}>injury categories</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: "10px", color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>
              {mode === "fatal" ? "Deaths (shown)" : "Hosp. (shown)"}
            </div>
            <div style={{ fontSize: "22px", fontWeight: 500, color: "#fff" }}>
              {formatCount(filtered.reduce((s, d) => s + (mode === "fatal" ? (d.deaths || 0) : (d.hospitalizations || 0)), 0))}
            </div>
            <div style={{ fontSize: "11px", color: "#6b6a8f", marginTop: 2 }}>total cases</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: "10px", color: "#f0c96a", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>Combined Cost</div>
            <div style={{ fontSize: "22px", fontWeight: 500, color: "#f0c96a" }}>{formatB(total)}</div>
            <div style={{ fontSize: "11px", color: "#6b6a8f", marginTop: 2 }}>selected subset</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: "10px", color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>Top category</div>
            <div style={{ fontSize: "14px", fontWeight: 500, color: "#fff", lineHeight: 1.3 }}>{filtered[0]?.mechanism}</div>
            <div style={{ fontSize: "11px", color: INTENT_COLORS[filtered[0]?.intent] || "#6b6a8f", marginTop: 2 }}>{filtered[0]?.intent}</div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ fontSize: "11px", color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.12em" }}>Filter:</div>
          {allIntents.map(intent => (
            <button key={intent}
              className={`filter-btn${filterIntent === intent ? " active" : ""}`}
              style={filterIntent === intent && intent !== "All" ? { borderColor: INTENT_COLORS[intent], color: INTENT_COLORS[intent] } : {}}
              onClick={() => setFilterIntent(intent)}>
              {intent}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            <label style={{ fontSize: "11px", color: "#5a58a0" }}>Sort:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="cost">Combined Cost</option>
              <option value="count">{mode === "fatal" ? "Deaths" : "Hospitalizations"}</option>
            </select>
            <label style={{ fontSize: "11px", color: "#5a58a0" }}>Show top:</label>
            <select value={topN} onChange={e => setTopN(Number(e.target.value))}>
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
              <option value={99}>All</option>
            </select>
          </div>
        </div>

        {/* Bar Chart */}
        <div style={{
          background: "#0c0c15",
          border: "1px solid #1a1a2e",
          borderRadius: "10px",
          padding: "24px 16px 12px",
          marginBottom: 20
        }}>
          <div style={{ fontSize: "11px", color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16, paddingLeft: 8 }}>
            Combined Economic Cost by Injury Mechanism
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={filtered} margin={{ top: 4, right: 20, left: 10, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" vertical={false} />
              <XAxis
                dataKey="mechanism"
                tick={{ fill: "#6b6a8f", fontSize: 10, fontFamily: "DM Mono, monospace" }}
                angle={-38}
                textAnchor="end"
                interval={0}
                tickLine={false}
                axisLine={{ stroke: "#1a1a2e" }}
              />
              <YAxis
                tickFormatter={formatB}
                tick={{ fill: "#6b6a8f", fontSize: 10, fontFamily: "DM Mono, monospace" }}
                tickLine={false}
                axisLine={false}
                width={62}
              />
              <Tooltip content={<CustomTooltip mode={mode} />} cursor={{ fill: "rgba(124,111,205,0.08)" }} />
              <Bar dataKey="combinedTotal" radius={[4, 4, 0, 0]}>
                {filtered.map((entry, i) => (
                  <Cell key={i} fill={INTENT_COLORS[entry.intent] || "#7c6fcd"} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend + Scatter row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 20 }}>

          {/* Legend */}
          <div style={{
            background: "#0c0c15",
            border: "1px solid #1a1a2e",
            borderRadius: "10px",
            padding: "20px"
          }}>
            <div style={{ fontSize: "11px", color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16 }}>
              Intent Legend
            </div>
            {INTENT_ORDER.filter(i => filtered.some(d => d.intent === i)).map(intent => (
              <div key={intent} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: INTENT_COLORS[intent], flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "#c0bfef" }}>{intent}</span>
                <span style={{ marginLeft: "auto", fontSize: "11px", color: "#5a58a0" }}>
                  {filtered.filter(d => d.intent === intent).length} cat.
                </span>
              </div>
            ))}
          </div>

          {/* Scatter: cost vs volume */}
          <div style={{
            background: "#0c0c15",
            border: "1px solid #1a1a2e",
            borderRadius: "10px",
            padding: "24px 16px 12px"
          }}>
            <div style={{ fontSize: "11px", color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16, paddingLeft: 8 }}>
              Cost per Case vs. Volume — bubble size = total cost
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <ScatterChart margin={{ top: 4, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                <XAxis
                  dataKey="count"
                  type="number"
                  name={mode === "fatal" ? "Deaths" : "Hospitalizations"}
                  tickFormatter={formatCount}
                  tick={{ fill: "#6b6a8f", fontSize: 10, fontFamily: "DM Mono, monospace" }}
                  tickLine={false}
                  axisLine={{ stroke: "#1a1a2e" }}
                  label={{ value: mode === "fatal" ? "Deaths" : "Hospitalizations", position: "insideBottom", offset: -2, fill: "#4a4870", fontSize: 10, fontFamily: "DM Mono" }}
                />
                <YAxis
                  dataKey="costPer"
                  type="number"
                  name="Cost/Case"
                  tickFormatter={v => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : `$${(v / 1e3).toFixed(0)}K`}
                  tick={{ fill: "#6b6a8f", fontSize: 10, fontFamily: "DM Mono, monospace" }}
                  tickLine={false}
                  axisLine={false}
                  width={62}
                />
                <ZAxis dataKey="combinedTotal" range={[40, 600]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3", stroke: "#2a2a3a" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div style={{
                          background: "#0f0f14", border: "1px solid #2a2a3a", borderRadius: "8px",
                          padding: "10px 14px", fontFamily: "DM Mono, monospace", fontSize: "11px", color: "#e0dff5"
                        }}>
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.mechanism}</div>
                          <div style={{ color: INTENT_COLORS[d.intent] }}>{d.intent}</div>
                          <div style={{ color: "#9b9abf", marginTop: 4 }}>
                            Cost/case: <span style={{ color: "#f0c96a" }}>
                              {d.costPer >= 1e6 ? `$${(d.costPer / 1e6).toFixed(2)}M` : `$${(d.costPer / 1e3).toFixed(0)}K`}
                            </span>
                          </div>
                          <div style={{ color: "#9b9abf" }}>Total: <span style={{ color: "#f0c96a" }}>{formatB(d.combinedTotal)}</span></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {INTENT_ORDER.filter(i => scatterData.some(d => d.intent === i)).map(intent => (
                  <Scatter
                    key={intent}
                    name={intent}
                    data={scatterData.filter(d => d.intent === intent)}
                    fill={INTENT_COLORS[intent]}
                    fillOpacity={0.75}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        <div style={{
          background: "#0c0c15",
          border: "1px solid #1a1a2e",
          borderRadius: "10px",
          overflow: "hidden",
          marginBottom: 20
        }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a2e", fontSize: "11px", color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Detail Table
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
                  {["Mechanism", "Intent", mode === "fatal" ? "Deaths" : "Hospitalizations", "Combined Cost"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#5a58a0", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "10px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #12121e" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#12121e"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "9px 16px", color: "#e0dff5" }}>{row.mechanism}</td>
                    <td style={{ padding: "9px 16px" }}>
                      <span style={{
                        color: INTENT_COLORS[row.intent] || "#9b9abf",
                        background: (INTENT_COLORS[row.intent] || "#9b9abf") + "18",
                        padding: "2px 8px", borderRadius: "10px", fontSize: "10px"
                      }}>{row.intent}</span>
                    </td>
                    <td style={{ padding: "9px 16px", color: "#c0bfef", fontVariantNumeric: "tabular-nums" }}>
                      {formatCount(mode === "fatal" ? row.deaths : row.hospitalizations)}
                    </td>
                    <td style={{ padding: "9px 16px", color: "#f0c96a", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
                      {formatB(row.combinedTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ fontSize: "10px", color: "#3a3a5a", textAlign: "center", paddingBottom: 8 }}>
          Source: CDC WISQARS · Combined costs include medical, work-loss, quality-of-life, and value-of-statistical-life components
        </div>
      </div>
    </div>
  );
}
