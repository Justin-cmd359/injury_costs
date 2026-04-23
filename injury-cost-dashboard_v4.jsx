import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ComposedChart, Line, LineChart,
} from "recharts";

// ─── BEA DISEASE DATA (2000–2021) ─────────────────────────────────────────────

const diseaseSnapshot = [
  { condition: "Cancer", nipaBn: 143.9, episodes: 39949822, perCap: 435, costCase: 3602 },
  { condition: "Mental Disorders", nipaBn: 139.6, episodes: 90083559, perCap: 422, costCase: 1550 },
  { condition: "Heart Disease", nipaBn: 133.6, episodes: 70214514, perCap: 404, costCase: 1903 },
  { condition: "Infectious Disease", nipaBn: 122.7, episodes: 50353445, perCap: 371, costCase: 2437 },
  { condition: "Trauma/Injury", nipaBn: 110.5, episodes: 64553424, perCap: 334, costCase: 1712 },
  { condition: "COPD & Asthma", nipaBn: 105.5, episodes: 79745433, perCap: 319, costCase: 1323 },
  { condition: "Osteoarthritis", nipaBn: 89.4, episodes: 59405382, perCap: 270, costCase: 1504 },
  { condition: "Diabetes", nipaBn: 69.2, episodes: 47800898, perCap: 209, costCase: 1447 },
  { condition: "CNS Disorders", nipaBn: 67.0, episodes: 47977602, perCap: 202, costCase: 1396 },
  { condition: "Skin Disorders", nipaBn: 65.2, episodes: 67323576, perCap: 197, costCase: 969 },
  { condition: "Back Problems", nipaBn: 63.7, episodes: 37401132, perCap: 193, costCase: 1703 },
  { condition: "Hypertension", nipaBn: 62.6, episodes: 59615623, perCap: 189, costCase: 1051 },
];

const diseaseCpcCompare = [
  { condition: "Infectious Disease", cpc2000: 565, cpc2021: 2437, growthPct: 331 },
  { condition: "CNS Disorders", cpc2000: 524, cpc2021: 1396, growthPct: 166 },
  { condition: "Trauma/Injury", cpc2000: 700, cpc2021: 1712, growthPct: 144 },
  { condition: "Back Problems", cpc2000: 800, cpc2021: 1703, growthPct: 113 },
  { condition: "Cancer", cpc2000: 1782, cpc2021: 3602, growthPct: 102 },
  { condition: "COPD & Asthma", cpc2000: 704, cpc2021: 1323, growthPct: 88 },
  { condition: "Hypertension", cpc2000: 581, cpc2021: 1051, growthPct: 81 },
  { condition: "Diabetes", cpc2000: 922, cpc2021: 1447, growthPct: 57 },
  { condition: "Heart Disease", cpc2000: 1291, cpc2021: 1903, growthPct: 47 },
  { condition: "Mental Disorders", cpc2000: 1146, cpc2021: 1550, growthPct: 35 },
].sort((a, b) => b.growthPct - a.growthPct);

// Median US wage growth for context anchoring (BLS CPI + wage data)
const WAGE_GROWTH_2000_2021 = 55; // ~55% nominal wage growth over same period

// 22-year time series — key AHRQ rollup conditions, 2000–2021
const diseaseTimeSeries = [
  { year: 2000, Cancer: 49.7, HeartDisease: 89.0, MentalDisorders: 40.9, Diabetes: 20.5, TraumaInjury: 51.0, COPDAsthma: 56.4, InfectiousDisease: 18.4 },
  { year: 2001, Cancer: 54.2, HeartDisease: 92.2, MentalDisorders: 47.4, Diabetes: 23.7, TraumaInjury: 55.4, COPDAsthma: 63.0, InfectiousDisease: 21.2 },
  { year: 2002, Cancer: 57.8, HeartDisease: 97.7, MentalDisorders: 54.4, Diabetes: 25.8, TraumaInjury: 57.8, COPDAsthma: 68.6, InfectiousDisease: 21.2 },
  { year: 2003, Cancer: 62.0, HeartDisease: 101.2, MentalDisorders: 57.9, Diabetes: 27.7, TraumaInjury: 62.1, COPDAsthma: 72.8, InfectiousDisease: 22.7 },
  { year: 2004, Cancer: 68.8, HeartDisease: 105.4, MentalDisorders: 59.5, Diabetes: 30.7, TraumaInjury: 64.4, COPDAsthma: 74.6, InfectiousDisease: 24.5 },
  { year: 2005, Cancer: 72.2, HeartDisease: 108.7, MentalDisorders: 64.0, Diabetes: 34.0, TraumaInjury: 66.6, COPDAsthma: 78.4, InfectiousDisease: 26.3 },
  { year: 2006, Cancer: 78.2, HeartDisease: 111.7, MentalDisorders: 68.1, Diabetes: 37.2, TraumaInjury: 70.2, COPDAsthma: 80.4, InfectiousDisease: 28.6 },
  { year: 2007, Cancer: 81.1, HeartDisease: 113.0, MentalDisorders: 72.4, Diabetes: 38.9, TraumaInjury: 71.8, COPDAsthma: 83.2, InfectiousDisease: 30.2 },
  { year: 2008, Cancer: 83.9, HeartDisease: 115.1, MentalDisorders: 75.6, Diabetes: 41.5, TraumaInjury: 73.4, COPDAsthma: 84.7, InfectiousDisease: 32.1 },
  { year: 2009, Cancer: 87.7, HeartDisease: 118.3, MentalDisorders: 79.9, Diabetes: 44.2, TraumaInjury: 74.6, COPDAsthma: 85.7, InfectiousDisease: 34.0 },
  { year: 2010, Cancer: 90.5, HeartDisease: 119.3, MentalDisorders: 83.8, Diabetes: 46.6, TraumaInjury: 76.0, COPDAsthma: 86.4, InfectiousDisease: 36.2 },
  { year: 2011, Cancer: 95.0, HeartDisease: 121.6, MentalDisorders: 88.0, Diabetes: 49.7, TraumaInjury: 78.4, COPDAsthma: 88.5, InfectiousDisease: 37.6 },
  { year: 2012, Cancer: 99.0, HeartDisease: 122.0, MentalDisorders: 90.4, Diabetes: 53.3, TraumaInjury: 80.5, COPDAsthma: 88.8, InfectiousDisease: 39.6 },
  { year: 2013, Cancer: 98.8, HeartDisease: 118.6, MentalDisorders: 88.8, Diabetes: 52.7, TraumaInjury: 78.0, COPDAsthma: 86.4, InfectiousDisease: 40.2 },
  { year: 2014, Cancer: 104.1, HeartDisease: 121.3, MentalDisorders: 93.2, Diabetes: 55.3, TraumaInjury: 81.3, COPDAsthma: 89.4, InfectiousDisease: 44.1 },
  { year: 2015, Cancer: 111.1, HeartDisease: 122.1, MentalDisorders: 96.6, Diabetes: 57.8, TraumaInjury: 85.2, COPDAsthma: 91.0, InfectiousDisease: 49.9 },
  { year: 2016, Cancer: 109.0, HeartDisease: 118.0, MentalDisorders: 98.3, Diabetes: 60.4, TraumaInjury: 85.9, COPDAsthma: 90.7, InfectiousDisease: 54.0 },
  { year: 2017, Cancer: 115.2, HeartDisease: 120.4, MentalDisorders: 101.5, Diabetes: 62.0, TraumaInjury: 89.2, COPDAsthma: 93.5, InfectiousDisease: 62.5 },
  { year: 2018, Cancer: 124.5, HeartDisease: 124.0, MentalDisorders: 104.7, Diabetes: 65.0, TraumaInjury: 92.8, COPDAsthma: 96.4, InfectiousDisease: 72.7 },
  { year: 2019, Cancer: 135.7, HeartDisease: 127.0, MentalDisorders: 109.6, Diabetes: 67.8, TraumaInjury: 96.6, COPDAsthma: 100.3, InfectiousDisease: 83.6 },
  { year: 2020, Cancer: 136.4, HeartDisease: 124.1, MentalDisorders: 111.9, Diabetes: 67.4, TraumaInjury: 92.4, COPDAsthma: 97.9, InfectiousDisease: 89.4 },
  { year: 2021, Cancer: 143.9, HeartDisease: 133.6, MentalDisorders: 139.6, Diabetes: 69.2, TraumaInjury: 110.5, COPDAsthma: 105.5, InfectiousDisease: 122.7 },
];

// ─── BROKEN SYSTEM DATA ───────────────────────────────────────────────────────

// OECD per-capita health spending (2022, USD PPP) — Health Affairs / OECD
const oecdSpending = [
  { country: "United States", spend: 12555, highlight: true },
  { country: "Germany", spend: 7383 },
  { country: "Switzerland", spend: 7179 },
  { country: "Netherlands", spend: 6753 },
  { country: "Australia", spend: 6627 },
  { country: "Canada", spend: 6319 },
  { country: "France", spend: 5765 },
  { country: "United Kingdom", spend: 5387 },
  { country: "Japan", spend: 4666 },
  { country: "South Korea", spend: 3983 },
];

// BIR cost per inpatient bill (PPP-adjusted 2020 USD) — Richman et al. 2022
const birCosts = [
  { country: "United States", surgical: 215, nonsurgical: 170, highlight: true },
  { country: "Australia", surgical: 163, nonsurgical: 130 },
  { country: "Germany", surgical: 65, nonsurgical: 50 },
  { country: "Netherlands", surgical: 55, nonsurgical: 45 },
  { country: "Singapore", surgical: 37, nonsurgical: 28 },
  { country: "Canada", surgical: 22, nonsurgical: 6 },
];

// Where US healthcare dollars go — waste taxonomy (Shrank et al. JAMA 2019 + Berwick 2025)
const wasteBreakdown = [
  { category: "Administrative Complexity", pct: 25, bn: 266, color: "#e05c6f", desc: "Billing, coding, prior auth, insurance paperwork" },
  { category: "Pricing Failures", pct: 23, bn: 241, color: "#e8855a", desc: "Prices far above other nations for same services" },
  { category: "Failure of Care Delivery", pct: 16, bn: 165, color: "#7c6fcd", desc: "Preventable complications, unsafe care, poor coordination" },
  { category: "Low-Value Care", pct: 14, bn: 149, color: "#5a9eb5", desc: "Tests and procedures that provide no clinical benefit" },
  { category: "Fraud & Abuse", pct: 12, bn: 128, color: "#f0c96a", desc: "Upcoding, billing for services not rendered" },
  { category: "Care Coordination Failures", pct: 10, bn: 105, color: "#8baa7e", desc: "Duplicate tests, avoidable readmissions" },
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const DISEASE_LINE_COLORS = {
  Cancer: "#e05c6f",
  HeartDisease: "#e8855a",
  MentalDisorders: "#7c6fcd",
  Diabetes: "#f0c96a",
  TraumaInjury: "#8baa7e",
  COPDAsthma: "#5a9eb5",
  InfectiousDisease: "#b563b5",
};

const DISEASE_LABELS = {
  Cancer: "Cancer",
  HeartDisease: "Heart Disease",
  MentalDisorders: "Mental Disorders",
  Diabetes: "Diabetes",
  TraumaInjury: "Trauma/Injury",
  COPDAsthma: "COPD & Asthma",
  InfectiousDisease: "Infectious Disease",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = {
  B: v => { if (!v && v !== 0) return "—"; if (v >= 1000) return `$${(v / 1000).toFixed(1)}T`; if (v >= 1) return `$${v.toFixed(1)}B`; return `$${(v * 1000).toFixed(0)}M`; },
  N: v => { if (!v && v !== 0) return "—"; if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`; if (v >= 1000) return `${(v / 1000).toFixed(1)}K`; return v.toLocaleString(); },
  $: v => v ? `$${v.toLocaleString()}` : "—",
  rate: v => v ? v.toFixed(1) : "—",
  pct: v => v ? `${v.toFixed(1)}%` : "—",
};

const TT = ({ children }) => (
  <div style={{
    background: "#0f0f14", border: "1px solid #2a2a3a", borderRadius: 8,
    padding: "12px 16px", fontFamily: "'DM Mono',monospace", fontSize: 12,
    color: "#e0dff5", boxShadow: "0 8px 32px rgba(0,0,0,.5)", maxWidth: 240
  }}>
    {children}
  </div>
);
const TR = ({ label, value, color = "#fff" }) => (
  <div style={{ color: "#9b9abf", marginBottom: 3 }}>
    {label}: <span style={{ color }}>{value}</span>
  </div>
);

// ─── DISEASE BURDEN PANEL ─────────────────────────────────────────────────────

function DiseasePanel() {
  const [view, setView] = useState("inflation");
  const [activeConds, setActiveConds] = useState(new Set(Object.keys(DISEASE_LABELS)));

  const toggleCond = key => {
    setActiveConds(prev => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); }
      else next.add(key);
      return next;
    });
  };

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { lbl: "Total 2021 Spend", val: "$5.1T", sub: "323 conditions tracked", gold: true },
          { lbl: "Top Condition", val: "Cancer", sub: "$143.9B in 2021", ic: "#e05c6f" },
          { lbl: "Cancer Cost/Case", val: "$3,602", sub: "up from $1,782 in 2000", gold: true },
          { lbl: "Years of Data", val: "22 yrs", sub: "BEA 2000–2021" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-lbl" style={{ color: s.gold ? "#f0c96a" : undefined }}>{s.lbl}</div>
            <div className="stat-val" style={{ color: s.gold ? "#f0c96a" : s.ic || "#fff", fontSize: 18 }}>{s.val}</div>
            <div className="stat-sub" style={{ color: "#6b6a8f" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", marginBottom: 20 }}>
        {[["inflation", "Cost Inflation"], ["snapshot", "2021 Snapshot"], ["trend", "Cost Trends 2000–2021"], ["broken", "⚠ The Broken System"]].map(([id, lbl], i, arr) => (
          <button key={id} className={`tab-btn${view === id ? " active" : ""}`}
            style={{ borderRadius: i === 0 ? "4px 0 0 4px" : i === arr.length - 1 ? "0 4px 4px 0" : "0", borderLeft: i > 0 ? "none" : undefined }}
            onClick={() => setView(id)}>{lbl}</button>
        ))}
      </div>

      {/* ── SNAPSHOT ── */}
      {view === "snapshot" && (
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
          <div className="card">
            <div className="card-title">Top Conditions by Total Spending — 2021</div>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={diseaseSnapshot} layout="vertical" margin={{ top: 4, right: 80, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `$${v}B`} tick={{ fill: "#6b6a8f", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#1a1a2e" }} />
                <YAxis type="category" dataKey="condition" tick={{ fill: "#c0bfef", fontSize: 10 }} tickLine={false} axisLine={false} width={140} />
                <Tooltip cursor={{ fill: "rgba(124,111,205,.08)" }} content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return <TT>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: "#fff" }}>{d.condition}</div>
                    <TR label="Total Spend" value={`$${d.nipaBn}B`} color="#f0c96a" />
                    <TR label="Episodes" value={fmt.N(d.episodes)} />
                    <TR label="Per Capita" value={`$${d.perCap.toLocaleString()}`} />
                    <TR label="Cost per Case" value={`$${d.costCase.toLocaleString()}`} color="#5a9eb5" />
                  </TT>;
                }} />
                <Bar dataKey="nipaBn" radius={[0, 4, 4, 0]} fill="#e05c6f" fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-title">Cost per Episode — 2021</div>
            {[...diseaseSnapshot].sort((a, b) => b.costCase - a.costCase).map((d, i) => (
              <div key={i} style={{ marginBottom: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: "#c0bfef" }}>{d.condition}</span>
                  <span style={{ fontSize: 11, color: "#5a9eb5", fontVariantNumeric: "tabular-nums" }}>${d.costCase.toLocaleString()}</span>
                </div>
                <div style={{ background: "#1a1a2e", borderRadius: 4, height: 5 }}>
                  <div style={{ width: `${(d.costCase / 3602) * 100}%`, height: "100%", background: "#5a9eb5", opacity: 0.75, borderRadius: 4 }} />
                </div>
              </div>
            ))}
            <div style={{ fontSize: 10, color: "#3a3a5a", marginTop: 8 }}>Scaled to highest (Cancer = $3,602)</div>
          </div>
        </div>
      )}

      {/* ── TREND ── */}
      {view === "trend" && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Total Spending by Condition — 2000 to 2021 ($B)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {Object.entries(DISEASE_LABELS).map(([key, lbl]) => (
                <button key={key}
                  onClick={() => toggleCond(key)}
                  style={{
                    background: activeConds.has(key) ? DISEASE_LINE_COLORS[key] + "22" : "transparent",
                    border: `1px solid ${activeConds.has(key) ? DISEASE_LINE_COLORS[key] : "#2a2a3a"}`,
                    borderRadius: 12, color: activeConds.has(key) ? DISEASE_LINE_COLORS[key] : "#4a4870",
                    padding: "3px 10px", fontSize: 10, cursor: "pointer", fontFamily: "'DM Mono',monospace",
                    transition: "all .2s", letterSpacing: "0.06em",
                  }}>{lbl}</button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={diseaseTimeSeries} margin={{ top: 4, right: 20, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                <XAxis dataKey="year" tick={{ fill: "#6b6a8f", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#1a1a2e" }} />
                <YAxis tickFormatter={v => `$${v}B`} tick={{ fill: "#6b6a8f", fontSize: 10 }} tickLine={false} axisLine={false} width={55} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return <TT>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: "#fff" }}>{label}</div>
                    {payload.filter(p => activeConds.has(p.dataKey)).sort((a, b) => b.value - a.value).map(p => (
                      <TR key={p.dataKey} label={DISEASE_LABELS[p.dataKey]} value={`$${p.value}B`} color={DISEASE_LINE_COLORS[p.dataKey]} />
                    ))}
                  </TT>;
                }} />
                {Object.entries(DISEASE_LABELS).filter(([key]) => activeConds.has(key)).map(([key, lbl]) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={DISEASE_LINE_COLORS[key]}
                    strokeWidth={key === "Cancer" ? 2.5 : 1.8} dot={false} activeDot={{ r: 4 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 10, color: "#3a3a5a", marginTop: 8 }}>
              Note: Infectious Disease spike in 2021 reflects COVID-19 treatment costs. Cancer surpassed Heart Disease as the top single condition in 2019.
            </div>
          </div>
        </div>
      )}

      {/* ── COST INFLATION ── */}
      {view === "inflation" && (
        <div>
          <div style={{
            background: "linear-gradient(135deg,#1a0f0f 0%,#0f0f1a 100%)",
            border: "1px solid #3a1a2e", borderRadius: 10, padding: "20px 24px",
            marginBottom: 20, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center"
          }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 10, color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 8 }}>The Gap That Explains Everything</div>
              <div style={{ fontSize: 13, color: "#c0bfef", lineHeight: 1.75 }}>
                Between 2000 and 2021, the <span style={{ color: "#f0c96a", fontWeight: 600 }}>median US worker's wages grew ~+55%</span> in nominal terms.
                Over that same period, the cost of treating most major diseases grew <span style={{ color: "#e05c6f", fontWeight: 600 }}>2 to 6× faster</span> —
                meaning healthcare ate an ever-larger share of every paycheck, every year.
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center", padding: "14px 20px", background: "#1a1a0f", border: "1px solid #3a3a1a", borderRadius: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 600, color: "#f0c96a" }}>+55%</div>
                <div style={{ fontSize: 10, color: "#5a5820", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 4 }}>Median Wage Growth</div>
                <div style={{ fontSize: 10, color: "#3a3820" }}>2000 → 2021</div>
              </div>
              <div style={{ textAlign: "center", padding: "14px 20px", background: "#1a0f0f", border: "1px solid #3a1a1a", borderRadius: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 600, color: "#e05c6f" }}>+331%</div>
                <div style={{ fontSize: 10, color: "#5a2020", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 4 }}>Infectious Disease</div>
                <div style={{ fontSize: 10, color: "#3a1818" }}>Cost per Case</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Treatment Cost Growth vs. Wage Growth — 2000 to 2021</div>
            <div style={{ fontSize: 11, color: "#5a58a0", marginBottom: 4 }}>
              Each bar is cost-per-episode growth. The <span style={{ color: "#f0c96a" }}>gold line</span> marks wage growth (~+55%). Everything above it outpaced what workers could afford.
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={diseaseCpcCompare} layout="vertical" margin={{ top: 4, right: 90, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `+${v}%`} tick={{ fill: "#6b6a8f", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#1a1a2e" }} domain={[0, 360]} />
                <YAxis type="category" dataKey="condition" tick={{ fill: "#c0bfef", fontSize: 10 }} tickLine={false} axisLine={false} width={140} />
                <Tooltip cursor={{ fill: "rgba(124,111,205,.08)" }} content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  const gap = d.growthPct - WAGE_GROWTH_2000_2021;
                  return <TT>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: "#fff" }}>{d.condition}</div>
                    <TR label="2000 cost/case" value={`$${d.cpc2000.toLocaleString()}`} />
                    <TR label="2021 cost/case" value={`$${d.cpc2021.toLocaleString()}`} color="#f0c96a" />
                    <TR label="Cost growth" value={`+${d.growthPct}%`} color="#e05c6f" />
                    <TR label="Wage growth" value={`+${WAGE_GROWTH_2000_2021}%`} color="#f0c96a" />
                    <TR label="Affordability gap" value={`+${gap}pp above wages`} color={gap > 100 ? "#e05c6f" : "#e8855a"} />
                  </TT>;
                }} />
                <Bar dataKey="growthPct" radius={[0, 4, 4, 0]}>
                  {diseaseCpcCompare.map((d, i) => (
                    <Cell key={i} fill={d.growthPct >= 200 ? "#e05c6f" : d.growthPct >= 100 ? "#e8855a" : "#7c6fcd"} fillOpacity={0.85} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey={() => WAGE_GROWTH_2000_2021} stroke="#f0c96a" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Wage Growth" />
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 24, height: 2, background: "#f0c96a", borderRadius: 1 }} />
                <span style={{ fontSize: 10, color: "#5a58a0" }}>Median wage growth benchmark (+55%)</span>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                {[["#e05c6f", "200%+"], ["#e8855a", "100–199%"], ["#7c6fcd", "Below 100%"]].map(([c, lbl]) => (
                  <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 10, height: 10, background: c, borderRadius: 2, opacity: 0.85 }} />
                    <span style={{ fontSize: 10, color: "#5a58a0" }}>{lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
            {diseaseCpcCompare.map((d, i) => {
              const gap = d.growthPct - WAGE_GROWTH_2000_2021;
              const color = d.growthPct >= 200 ? "#e05c6f" : d.growthPct >= 100 ? "#e8855a" : "#7c6fcd";
              return (
                <div key={i} className="card" style={{ borderColor: color + "30" }}>
                  <div style={{ fontSize: 10, color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>{d.condition}</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color, marginBottom: 2 }}>+{d.growthPct}%</div>
                  <div style={{ fontSize: 10, color: "#6b6a8f", marginBottom: 8 }}>${d.cpc2000.toLocaleString()} → ${d.cpc2021.toLocaleString()}</div>
                  <div style={{ background: "#1a1a2e", borderRadius: 4, height: 4, marginBottom: 6 }}>
                    <div style={{ width: `${Math.min((d.growthPct / 360) * 100, 100)}%`, height: "100%", background: color, opacity: 0.8, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 10, color: gap > 0 ? "#e05c6f" : "#8baa7e" }}>
                    {gap > 0 ? `+${gap}pp above wage growth` : `Within wage growth range`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── THE BROKEN SYSTEM ── */}
      {view === "broken" && (
        <div>
          <div style={{
            background: "linear-gradient(135deg,#12080a 0%,#0a080f 100%)",
            border: "1px solid #3a1a2e", borderRadius: 10, padding: "22px 28px", marginBottom: 20
          }}>
            <div style={{ fontSize: 10, color: "#7c2040", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>Research Finding</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(16px,2.5vw,22px)", color: "#fff", fontWeight: 700, lineHeight: 1.35, marginBottom: 12 }}>
              The US spends <span style={{ color: "#e05c6f" }}>more than twice per capita</span> what most wealthy nations spend on healthcare — and gets <span style={{ color: "#e8855a" }}>worse outcomes</span> in return.
            </div>
            <div style={{ fontSize: 12, color: "#7a7890", lineHeight: 1.7 }}>
              Americans have the lowest life expectancy among large, wealthy OECD nations — lagging peers by up to 6 years — while spending ~17% of GDP on care.
              Up to <span style={{ color: "#f0c96a" }}>25% of that spending is waste</span>, with administrative complexity and pricing failures as the largest culprits.
              <span style={{ color: "#5a5870" }}> Sources: Berwick et al., Health Affairs 2025; Richman et al., Health Affairs 2022.</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, marginBottom: 16 }}>
            <div className="card">
              <div className="card-title">Per-Capita Health Spending — US vs. OECD Peers (2022, USD PPP)</div>
              <div style={{ fontSize: 11, color: "#5a58a0", marginBottom: 12 }}>
                The US outspends every comparable nation — by nearly <span style={{ color: "#e05c6f" }}>$5,200 above the next-highest</span>.
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={oecdSpending} layout="vertical" margin={{ top: 4, right: 80, left: 10, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" horizontal={false} />
                  <XAxis type="number" tickFormatter={v => `$${(v/1000).toFixed(0)}K`} tick={{ fill: "#6b6a8f", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#1a1a2e" }} />
                  <YAxis type="category" dataKey="country" tick={{ fill: "#c0bfef", fontSize: 10 }} tickLine={false} axisLine={false} width={120} />
                  <Tooltip cursor={{ fill: "rgba(124,111,205,.08)" }} content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return <TT>
                      <div style={{ fontWeight: 700, marginBottom: 6, color: d.highlight ? "#e05c6f" : "#fff" }}>{d.country}</div>
                      <TR label="Per-capita spend" value={`$${d.spend.toLocaleString()}`} color={d.highlight ? "#e05c6f" : "#f0c96a"} />
                      {d.highlight && <TR label="vs. OECD avg (~$5,400)" value="+133% above avg" color="#e8855a" />}
                    </TT>;
                  }} />
                  <Bar dataKey="spend" radius={[0, 4, 4, 0]}>
                    {oecdSpending.map((d, i) => (
                      <Cell key={i} fill={d.highlight ? "#e05c6f" : "#7c6fcd"} fillOpacity={d.highlight ? 1 : 0.55} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="card-title">Cost to Bill One Inpatient Admission (2020 USD PPP)</div>
              <div style={{ fontSize: 11, color: "#5a58a0", marginBottom: 16 }}>
                Richman et al. (2022) measured actual staff time and overhead per bill. The US billing process is uniquely broken — 36× Canada's cost.
              </div>
              {birCosts.map((d, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: d.highlight ? "#e05c6f" : "#c0bfef", fontWeight: d.highlight ? 600 : 400 }}>{d.country}</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: "#3a3a5a" }}>surgical:</span>
                      <span style={{ fontSize: 12, color: d.highlight ? "#e05c6f" : "#f0c96a", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>${d.surgical}</span>
                    </div>
                  </div>
                  <div style={{ background: "#1a1a2e", borderRadius: 4, height: 7 }}>
                    <div style={{ width: `${(d.surgical / 215) * 100}%`, height: "100%", background: d.highlight ? "#e05c6f" : "#7c6fcd", opacity: d.highlight ? 1 : 0.6, borderRadius: 4 }} />
                  </div>
                  {d.highlight && (
                    <div style={{ fontSize: 10, color: "#5a2030", marginTop: 3 }}>
                      36× Canada · 3× Germany · 5× Singapore
                    </div>
                  )}
                </div>
              ))}
              <div style={{ fontSize: 10, color: "#3a3a5a", marginTop: 8 }}>
                High costs driven by complex coding and multipayer fragmentation, not higher wages. Source: Richman et al. 2022.
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div className="card">
              <div className="card-title">Where the Waste Goes — Estimated ~$760B–$935B Annually</div>
              <div style={{ fontSize: 11, color: "#5a58a0", marginBottom: 16 }}>
                Shrank et al. (JAMA 2019) identified six waste categories. Administrative complexity alone rivals the entire Canadian healthcare budget.
              </div>
              {wasteBreakdown.map((d, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: "#c0bfef" }}>{d.category}</span>
                    <div style={{ display: "flex", gap: 10 }}>
                      <span style={{ fontSize: 11, color: "#5a58a0", fontVariantNumeric: "tabular-nums" }}>~${d.bn}B</span>
                      <span style={{ fontSize: 11, color: d.color, fontVariantNumeric: "tabular-nums", fontWeight: 600, minWidth: 34, textAlign: "right" }}>{d.pct}%</span>
                    </div>
                  </div>
                  <div style={{ background: "#1a1a2e", borderRadius: 4, height: 6, marginBottom: 3 }}>
                    <div style={{ width: `${(d.pct / 25) * 100}%`, height: "100%", background: d.color, opacity: 0.8, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#3a3a5a" }}>{d.desc}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="card-title">Outcomes Don't Match the Spending</div>
              {[
                { icon: "📉", label: "Life Expectancy Gap", val: "Up to 6 years", sub: "US lags all wealthy OECD peers", color: "#e05c6f" },
                { icon: "🏥", label: "Medical Debt", val: "100M+ Americans", sub: "Largest driver of personal bankruptcy", color: "#e8855a" },
                { icon: "🚫", label: "Uninsured", val: "25M+ Americans", sub: "As of 2023, despite ACA expansion", color: "#7c6fcd" },
                { icon: "⚖️", label: "Maternal Mortality", val: "2.6× disparity", sub: "Black mothers vs. White mothers, 2021", color: "#b563b5" },
                { icon: "🧬", label: "Cancer Mortality", val: "+19% higher", sub: "Black men vs. White men", color: "#5a9eb5" },
                { icon: "📊", label: "GDP on Healthcare", val: "17% of GDP", sub: "Twice the OECD average per capita", color: "#f0c96a" },
              ].map((s, i) => (
                <div key={i} style={{ padding: "10px 14px", background: "#0f0f1a", borderRadius: 6, borderLeft: `3px solid ${s.color}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: 10, color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: s.color, margin: "1px 0" }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: "#4a4870" }}>{s.sub}</div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 10, color: "#2a2a3a", marginTop: 4 }}>
                Sources: Berwick et al. 2025 · CDC NCHS · KFF · ACS
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LANDING SCREEN ───────────────────────────────────────────────────────────

function LandingScreen({ onEnter }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#09090f", color: "#e0dff5", fontFamily: "'DM Mono',monospace",
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      padding: "40px 24px", position: "relative", overflow: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&family=Lora:ital,wght@0,400;0,500;1,400;1,500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }
        @keyframes pulse  { 0%,100%{opacity:.15;} 50%{opacity:.28;} }
        .ls-fade-1{animation:fadeUp .7s ease both;animation-delay:.1s;}
        .ls-fade-2{animation:fadeUp .7s ease both;animation-delay:.35s;}
        .ls-fade-3{animation:fadeUp .7s ease both;animation-delay:.6s;}
        .ls-fade-4{animation:fadeUp .7s ease both;animation-delay:.85s;}
        .ls-fade-5{animation:fadeUp .7s ease both;animation-delay:1.1s;}
        .enter-btn{background:transparent;border:1px solid #7c6fcd;color:#c8c6ff;padding:13px 36px;
          font-family:'DM Mono',monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;
          cursor:pointer;border-radius:4px;transition:all .25s;}
        .enter-btn:hover{background:#1e1d2e;box-shadow:0 0 24px rgba(124,111,205,.25);}
        .stat-pill{display:inline-flex;flex-direction:column;align-items:center;padding:16px 24px;
          background:#0f0f1a;border:1px solid #1a1a2e;border-radius:8px;min-width:140px;}
      `}</style>
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        width: 600, height: 400, borderRadius: "50%",
        background: "radial-gradient(ellipse,rgba(124,111,205,.07) 0%,transparent 70%)",
        pointerEvents: "none", animation: "pulse 6s ease-in-out infinite"
      }} />
      <div className="ls-fade-1" style={{ fontSize: 10, letterSpacing: "0.25em", color: "#5a58a0", textTransform: "uppercase", marginBottom: 28 }}>
        A Personal & Public Health Story
      </div>
      <h1 className="ls-fade-2" style={{
        fontFamily: "'Syne',sans-serif", fontWeight: 800,
        fontSize: "clamp(28px,5vw,52px)", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1,
        textAlign: "center", maxWidth: 720, marginBottom: 36
      }}>
        The Cost of Getting Sick<br /><span style={{ color: "#7c6fcd" }}>in America</span>
      </h1>
      <div className="ls-fade-3" style={{
        maxWidth: 620, textAlign: "center", marginBottom: 44,
        borderLeft: "2px solid #2a2a3a", borderRight: "2px solid #2a2a3a", padding: "0 32px"
      }}>
        <p style={{
          fontFamily: "'Lora',serif", fontStyle: "italic",
          fontSize: "clamp(14px,2vw,17px)", lineHeight: 1.85, color: "#c0bfef", marginBottom: 20
        }}>
          My aunt passed away on Saturday, April 13, 2024, after a long battle
          against breast cancer. She was surrounded by her family, including me,
          in her final couple days. She was a survivor of the Khmer Rouge and a
          loving mother. Her doctors gave her as much time as they could after
          the diagnosis.
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.75, color: "#9b9abf" }}>
          Stories like this one are not rare. Millions of Americans face crushing medical costs every year —
          from cancer, from accidents, from conditions that could have been caught sooner.
          The numbers below are an attempt to show the true scale of that burden.
        </p>
      </div>
      <div className="ls-fade-4" style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 48 }}>
        {[
          { val: "$5.1T", lbl: "disease spend tracked", color: "#e05c6f" },
          { val: "+102%", lbl: "cancer cost growth 2000–21", color: "#7c6fcd" },
          { val: "+331%", lbl: "infectious disease cost/case", color: "#b563b5" },
          { val: "100M+", lbl: "Americans with medical debt", color: "#e8855a" },
        ].map((s, i) => (
          <div key={i} className="stat-pill">
            <span style={{ fontSize: 22, fontWeight: 600, color: s.color, marginBottom: 4 }}>{s.val}</span>
            <span style={{ fontSize: 10, color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center" }}>{s.lbl}</span>
          </div>
        ))}
      </div>
      <div className="ls-fade-5"><button className="enter-btn" onClick={onEnter}>Explore the Data →</button></div>
      <div className="ls-fade-5" style={{ position: "absolute", bottom: 20, fontSize: 10, color: "#2a2a3a", letterSpacing: "0.1em" }}>
        Sources: BEA Health Care Satellite Account · OECD Health Statistics · Richman et al. 2022
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [showLanding, setShowLanding] = useState(true);

  if (showLanding) return <LandingScreen onEnter={() => setShowLanding(false)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#09090f", color: "#e0dff5", fontFamily: "'DM Mono',monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .tab-btn{background:transparent;border:1px solid #2a2a3a;color:#6b6a8f;padding:8px 16px;cursor:pointer;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.07em;transition:all .2s;text-transform:uppercase;}
        .tab-btn:hover{border-color:#5a58a0;color:#c0bfef;}
        .tab-btn.active{background:#1e1d2e;border-color:#7c6fcd;color:#c8c6ff;}
        .stat-card{background:#0f0f1a;border:1px solid #1a1a2e;border-radius:8px;padding:14px 18px;}
        .stat-lbl{font-size:10px;color:#5a58a0;text-transform:uppercase;letter-spacing:.15em;margin-bottom:6px;}
        .stat-val{font-size:22px;font-weight:500;}
        .stat-sub{font-size:11px;margin-top:2px;}
        .card{background:#0c0c15;border:1px solid #1a1a2e;border-radius:10px;padding:20px 16px 14px;}
        .card-title{font-size:11px;color:#5a58a0;text-transform:uppercase;letter-spacing:.12em;margin-bottom:14px;padding-left:4px;}
        .recharts-cartesian-axis-tick text{font-family:'DM Mono',monospace!important;}
      `}</style>

      <div style={{ borderBottom: "1px solid #1a1a2e", padding: "24px 40px", background: "linear-gradient(180deg,#0f0e1a 0%,#09090f 100%)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <button onClick={() => setShowLanding(true)} style={{ background: "transparent", border: "none", color: "#5a58a0", fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", marginBottom: 8, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
              ← Back to Story
            </button>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#5a58a0", textTransform: "uppercase", marginBottom: 6 }}>Cost Analysis · United States</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(22px,4vw,34px)", color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>Healthcare Cost Dashboard</h1>
            <div style={{ fontSize: 11, color: "#5a58a0", marginTop: 6 }}>BEA Health Care Satellite Account · 2000–2021</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              ["BEA Disease", "#7c6fcd"],
              ["OECD 2022", "#5a9eb5"],
              ["Richman et al. 2022", "#e8855a"],
            ].map(([lbl, c]) => (
              <span key={lbl} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 12, border: `1px solid ${c}40`, color: c, background: c + "10", letterSpacing: "0.08em" }}>{lbl}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 40px 48px" }}>
        <DiseasePanel />
      </div>

      <div style={{ fontSize: 10, color: "#2a2a3a", textAlign: "center", paddingBottom: 16 }}>
        Sources: BEA Health Care Satellite Account 2000–2021 · OECD Health Statistics 2022 · Richman et al. 2022 · Shrank et al. JAMA 2019 · Berwick et al. 2025
      </div>
    </div>
  );
}