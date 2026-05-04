import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ComposedChart, Line,
} from "recharts";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const diseaseSnapshot = [
  { condition: "Cancer", nipaBn: 143.9, episodes: 39949822, costCase: 3602 },
  { condition: "Mental Disorders", nipaBn: 139.6, episodes: 90083559, costCase: 1550 },
  { condition: "Heart Disease", nipaBn: 133.6, episodes: 70214514, costCase: 1903 },
  { condition: "Infectious Disease", nipaBn: 122.7, episodes: 50353445, costCase: 2437 },
  { condition: "Trauma/Injury", nipaBn: 110.5, episodes: 64553424, costCase: 1712 },
  { condition: "COPD & Asthma", nipaBn: 105.5, episodes: 79745433, costCase: 1323 },
  { condition: "Osteoarthritis", nipaBn: 89.4, episodes: 59405382, costCase: 1504 },
  { condition: "Diabetes", nipaBn: 69.2, episodes: 47800898, costCase: 1447 },
  { condition: "CNS Disorders", nipaBn: 67.0, episodes: 47977602, costCase: 1396 },
  { condition: "Skin Disorders", nipaBn: 65.2, episodes: 67323576, costCase: 969 },
  { condition: "Back Problems", nipaBn: 63.7, episodes: 37401132, costCase: 1703 },
  { condition: "Hypertension", nipaBn: 62.6, episodes: 59615623, costCase: 1051 },
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

const WAGE_GROWTH_2000_2021 = 73; // BLS/FRED LEU0252881500A: $576/wk (2000) → $998/wk (2021)

const snapshotLookup = Object.fromEntries(diseaseSnapshot.map(d => [d.condition, d]));

// OECD per-capita health spending (2022, USD PPP)
// Derived: OECD Health Expenditure % of GDP × GDP per capita (PPP)
// Source: OECD_health_expenditure_and_financing_by_country.csv + OECD National Accounts
const oecdSpending = [
  { country: "United States", spend: 12555, highlight: true },
  { country: "Switzerland", spend: 9512 },
  { country: "Germany", spend: 7383 },
  { country: "Netherlands", spend: 6753 },
  { country: "Australia", spend: 6627 },
  { country: "Canada", spend: 6319 },
  { country: "France", spend: 6157 },
  { country: "United Kingdom", spend: 5387 },
  { country: "Japan", spend: 4768 },
  { country: "South Korea", spend: 3983 },
];

// BIR cost per inpatient bill (PPP-adjusted 2020 USD) — Richman et al. 2022
// Note: Canada figure is NONSURGICAL bill ($6); US figure is SURGICAL ($215)
// This matches the paper's own headline comparison. Other countries shown are surgical.
const birCosts = [
  { country: "United States", surgical: 215, highlight: true },
  { country: "Australia", surgical: 163 },
  { country: "Germany", surgical: 65 },
  { country: "Netherlands", surgical: 55 },
  { country: "Singapore", surgical: 37 },
  { country: "Canada (nonsurgical)", surgical: 6 },
];

// Waste taxonomy — Shrank et al. JAMA 2019, Table 2
// $Bn figures are the paper's reported annual estimates/ranges (2019 dollars)
// Pct = share of total waste ($760–935B midpoint ~$847B)
const wasteBreakdown = [
  { category: "Administrative Complexity", range: "$265.6B", bn: 265.6, pct: 31, color: "#e05c6f", desc: "Billing, coding, prior auth, insurance paperwork — largest single category" },
  { category: "Pricing Failure", range: "$231–241B", bn: 235, pct: 28, color: "#e8855a", desc: "Drug & service prices far above other nations for identical care" },
  { category: "Failure of Care Delivery", range: "$102–166B", bn: 134, pct: 16, color: "#7c6fcd", desc: "Preventable complications, medical errors, unsafe care" },
  { category: "Low-Value Care", range: "$76–101B", bn: 88, pct: 10, color: "#5a9eb5", desc: "Tests and procedures that provide no measurable clinical benefit" },
  { category: "Fraud & Abuse", range: "$59–84B", bn: 71, pct: 8, color: "#f0c96a", desc: "Fraudulent billing, upcoding, scams against Medicare/Medicaid" },
  { category: "Care Coordination Failures", range: "$27–78B", bn: 53, pct: 6, color: "#8baa7e", desc: "Avoidable readmissions, duplicate tests, poor care transitions" },
];

// ─── QUALITY COMPARISON DATA ─────────────────────────────────────────────────
// All figures from: Peterson-KFF Health System Tracker
// "How does the quality of the U.S. health system compare to other countries?"
// Uploaded source: quality_comparison.pdf (2026 print)

// Life expectancy at birth, 2023 — PDF p.2–3
// "78.4 years in the U.S. versus 82.5 years in comparable countries"
// "U.S. life expectancy is 4.1 years shorter than comparable countries" (chart annotation)
const LIFE_EXP_US = 78.4;
const LIFE_EXP_PEER = 82.5;
const LIFE_EXP_GAP = 4.1;

// 30-day mortality per 100 patients, age-standardized, ages 45+, 2022 — PDF p.4
const mortalityRates = [
  { condition: "Haemorrhagic\nStroke", us: 18.7, peer: 22.7, usLower: true },
  { condition: "Heart Attack\n(AMI)", us: 5.2, peer: 5.5, usLower: true },
  { condition: "Ischaemic\nStroke", us: 4.5, peer: 6.9, usLower: true },
];

// Maternal mortality per 100,000 live births, 2023 — PDF p.5
const maternalMortality = [
  { country: "United States", rate: 18.6, highlight: true },
  { country: "Canada", rate: 12.2 },
  { country: "Belgium", rate: 8.8 },
  { country: "Comparable Avg", rate: 5.1, isAvg: true },
  { country: "Australia", rate: 4.7 },
  { country: "Netherlands", rate: 4.3 },
  { country: "Germany", rate: 4.2 },
  { country: "Japan", rate: 3.6 },
  { country: "Sweden", rate: 3.0 },
  { country: "Austria", rate: 2.6 },
  { country: "Switzerland", rate: 2.5 },
];

// Hospital admissions per 100,000 population, age-std, ages 15+, 2022 — PDF p.7
const preventableAdmissions = [
  { condition: "Heart Failure", us: 386.5, peer: 191.9, usHigher: true },
  { condition: "Diabetes", us: 223.4, peer: 103.3, usHigher: true },
  { condition: "COPD", us: 100.4, peer: 157.6, usHigher: false },
  { condition: "Asthma", us: 22.4, peer: 23.7, usHigher: false },
];

// % adults with a regular source of care, 2023 — PDF p.12
// Source: Commonwealth Fund 2023 International Health Policy Survey
const regularCare = [
  { country: "Netherlands", pct: 99 },
  { country: "United Kingdom", pct: 97 },
  { country: "Germany", pct: 96 },
  { country: "Australia", pct: 94 },
  { country: "Comparable Avg", pct: 93, isAvg: true },
  { country: "Switzerland", pct: 92 },
  { country: "France", pct: 91 },
  { country: "Sweden", pct: 88 },
  { country: "United States", pct: 87, highlight: true },
  { country: "Canada", pct: 86 },
];

// % adults 19–64 using ER for avoidable reasons, 2023 — PDF p.13
// Source: Commonwealth Fund 2023 International Health Policy Survey
const avoidableER = [
  { country: "Netherlands", pct: 5 },
  { country: "Germany", pct: 7 },
  { country: "France", pct: 9 },
  { country: "Comparable Avg", pct: 11, isAvg: true },
  { country: "United Kingdom", pct: 11 },
  { country: "Australia", pct: 11 },
  { country: "Switzerland", pct: 13 },
  { country: "Sweden", pct: 14 },
  { country: "United States", pct: 16, highlight: true },
  { country: "Canada", pct: 19 },
];

// General practitioners per 1,000 population, 2022 — PDF p.15
// Source: KFF analysis of OECD data
const gpDensity = [
  { country: "Netherlands", gp: 2.0 },
  { country: "Australia", gp: 1.9 },
  { country: "Austria", gp: 1.6 },
  { country: "France", gp: 1.5 },
  { country: "Canada", gp: 1.4 },
  { country: "Comparable Avg", gp: 1.4, isAvg: true },
  { country: "Switzerland", gp: 1.4 },
  { country: "Belgium", gp: 1.3 },
  { country: "Germany", gp: 1.2 },
  { country: "United Kingdom", gp: 1.0 },
  { country: "Sweden", gp: 0.7 },
  { country: "United States", gp: 0.6, highlight: true },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = {
  B: v => { if (!v && v !== 0) return "—"; if (v >= 1000) return `$${(v / 1000).toFixed(1)}T`; if (v >= 1) return `$${v.toFixed(1)}B`; return `$${(v * 1000).toFixed(0)}M`; },
  N: v => { if (!v && v !== 0) return "—"; if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`; if (v >= 1000) return `${(v / 1000).toFixed(1)}K`; return v.toLocaleString(); },
};

const TT = ({ children }) => (
  <div style={{
    background: "#0f0f14", border: "1px solid #2a2a3a", borderRadius: 8,
    padding: "12px 16px", fontFamily: "'DM Mono',monospace", fontSize: 12,
    color: "#e0dff5", boxShadow: "0 8px 32px rgba(0,0,0,.5)", maxWidth: 240
  }}>{children}</div>
);
const TR = ({ label, value, color = "#fff" }) => (
  <div style={{ color: "#9b9abf", marginBottom: 3 }}>
    {label}: <span style={{ color }}>{value}</span>
  </div>
);

// ─── SHARED CSS ───────────────────────────────────────────────────────────────

const SHARED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  .stat-card{background:#0f0f1a;border:1px solid #1a1a2e;border-radius:8px;padding:14px 18px;}
  .stat-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.15em;margin-bottom:6px;}
  .stat-val{font-size:22px;font-weight:500;}
  .stat-sub{font-size:11px;margin-top:2px;color:#6b6a8f;}
  .card{background:#0c0c15;border:1px solid #1a1a2e;border-radius:10px;padding:20px 16px 14px;}
  .card-title{font-size:11px;color:#5a58a0;text-transform:uppercase;letter-spacing:.12em;margin-bottom:14px;padding-left:4px;}
  .recharts-cartesian-axis-tick text{font-family:'DM Mono',monospace!important;}
  .back-btn{background:transparent;border:none;color:#5a58a0;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;padding:0;display:flex;align-items:center;gap:6px;}
  .back-btn:hover{color:#c0bfef;}
`;

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

function MainScreen({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "#09090f", color: "#e0dff5", fontFamily: "'DM Mono',monospace" }}>
      <style>{SHARED_CSS}</style>

      <div style={{ borderBottom: "1px solid #1a1a2e", padding: "20px 40px", background: "linear-gradient(180deg,#0f0e1a 0%,#09090f 100%)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <button className="back-btn" onClick={onBack} style={{ marginBottom: 8 }}>← Back to Story</button>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#5a58a0", textTransform: "uppercase", marginBottom: 4 }}>Disease Cost Burden · United States</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(20px,3.5vw,30px)", color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            How Healthcare Costs Outpaced America
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["BEA 2000–2021", "#7c6fcd"], ["BLS Wage Data", "#8baa7e"]].map(([lbl, c]) => (
            <span key={lbl} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 12, border: `1px solid ${c}40`, color: c, background: c + "10", letterSpacing: "0.08em" }}>{lbl}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: "32px 40px 64px" }}>

        {/* Key stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { lbl: "Median Wage Growth", val: "+73%", sub: "2000 → 2021, nominal (FRED)", c: "#f0c96a" },
            { lbl: "Conditions Beating It", val: "7 of 10", sub: "outpaced wage growth", c: "#e05c6f" },
            { lbl: "Worst Offender", val: "+331%", sub: "Infectious Disease cost/case", c: "#b563b5" },
            { lbl: "Cancer Cost/Case", val: "$3,602", sub: "up from $1,782 in 2000", c: "#e8855a" },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-lbl" style={{ color: s.c }}>{s.lbl}</div>
              <div className="stat-val" style={{ color: s.c }}>{s.val}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Wage anchor callout */}
        <div style={{
          background: "linear-gradient(135deg,#1a0f0f 0%,#0f0f1a 100%)",
          border: "1px solid #3a1a2e", borderRadius: 10, padding: "20px 24px",
          marginBottom: 20, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center"
        }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 10, color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 8 }}>The Gap That Explains Everything</div>
            <div style={{ fontSize: 13, color: "#c0bfef", lineHeight: 1.75 }}>
              Between 2000 and 2021, the <span style={{ color: "#f0c96a", fontWeight: 600 }}>median US worker's wages grew +73%</span> in nominal terms (BLS/FRED data).
              Over that same period, the cost of treating 7 of 10 major diseases grew <span style={{ color: "#e05c6f", fontWeight: 600 }}>faster still</span> —
              meaning healthcare ate an ever-larger share of every paycheck, every year.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center", padding: "14px 20px", background: "#1a1a0f", border: "1px solid #3a3a1a", borderRadius: 8 }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: "#f0c96a" }}>+73%</div>
              <div style={{ fontSize: 10, color: "#5a5820", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 4 }}>Median Wage Growth</div>
              <div style={{ fontSize: 10, color: "#3a3820" }}>2000 → 2021 · BLS/FRED</div>
            </div>
            <div style={{ textAlign: "center", padding: "14px 20px", background: "#1a0f0f", border: "1px solid #3a1a1a", borderRadius: 8 }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: "#e05c6f" }}>+331%</div>
              <div style={{ fontSize: 10, color: "#5a2020", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 4 }}>Infectious Disease</div>
              <div style={{ fontSize: 10, color: "#3a1818" }}>Cost per Case</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Treatment Cost Growth vs. Wage Growth — 2000 to 2021</div>
          <div style={{ fontSize: 11, color: "#5a58a0", marginBottom: 4 }}>
            Each bar is cost-per-episode growth. The <span style={{ color: "#f0c96a" }}>gold line</span> marks wage growth (+73%, BLS/FRED). Everything above it outpaced what workers could afford.
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
                const snap = snapshotLookup[d.condition];
                return <TT>
                  <div style={{ fontWeight: 700, marginBottom: 6, color: "#fff" }}>{d.condition}</div>
                  <TR label="2000 cost/case" value={`$${d.cpc2000.toLocaleString()}`} />
                  <TR label="2021 cost/case" value={`$${d.cpc2021.toLocaleString()}`} color="#f0c96a" />
                  <TR label="Cost growth" value={`+${d.growthPct}%`} color="#e05c6f" />
                  <TR label="Affordability gap" value={`+${gap}pp above wages`} color={gap > 100 ? "#e05c6f" : "#e8855a"} />
                  {snap && <TR label="2021 total spend" value={`$${snap.nipaBn}B`} color="#7c6fcd" />}
                </TT>;
              }} />
              <Bar dataKey="growthPct" radius={[0, 4, 4, 0]}>
                {diseaseCpcCompare.map((d, i) => (
                  <Cell key={i} fill={d.growthPct >= 200 ? "#e05c6f" : d.growthPct >= 100 ? "#e8855a" : "#7c6fcd"} fillOpacity={0.85} />
                ))}
              </Bar>
              <Line type="monotone" dataKey={() => WAGE_GROWTH_2000_2021} stroke="#f0c96a" strokeWidth={2} strokeDasharray="6 3" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 24, height: 2, background: "#f0c96a", borderRadius: 1 }} />
              <span style={{ fontSize: 10, color: "#5a58a0" }}>Median wage growth benchmark (+73%, BLS/FRED 2000–2021)</span>
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

        {/* Per-condition cards — snapshot data folded in */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 56 }}>
          {diseaseCpcCompare.map((d, i) => {
            const gap = d.growthPct - WAGE_GROWTH_2000_2021;
            const color = d.growthPct >= 200 ? "#e05c6f" : d.growthPct >= 100 ? "#e8855a" : "#7c6fcd";
            const snap = snapshotLookup[d.condition];
            return (
              <div key={i} className="card" style={{ borderColor: color + "30" }}>
                <div style={{ fontSize: 10, color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>{d.condition}</div>
                <div style={{ fontSize: 20, fontWeight: 600, color, marginBottom: 2 }}>+{d.growthPct}%</div>
                <div style={{ fontSize: 10, color: "#6b6a8f", marginBottom: 8 }}>${d.cpc2000.toLocaleString()} → ${d.cpc2021.toLocaleString()} per case</div>
                <div style={{ background: "#1a1a2e", borderRadius: 4, height: 4, marginBottom: 8 }}>
                  <div style={{ width: `${Math.min((d.growthPct / 360) * 100, 100)}%`, height: "100%", background: color, opacity: 0.8, borderRadius: 4 }} />
                </div>
                {snap && (
                  <div style={{ fontSize: 10, color: "#4a4870", marginBottom: 6, borderTop: "1px solid #1a1a2e", paddingTop: 6 }}>
                    2021: <span style={{ color: "#7c6fcd" }}>${snap.nipaBn}B</span> · {fmt.N(snap.episodes)} episodes
                  </div>
                )}
                <div style={{ fontSize: 10, color: gap > 0 ? color : "#8baa7e" }}>
                  {gap > 0 ? `+${gap}pp above wage growth` : "Within wage growth range"}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Section divider: The Broken System ── */}
        <div style={{ borderTop: "1px solid #1a1a2e", margin: "0 0 40px", paddingTop: 48, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 14 }}>The question remains</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(18px,3vw,28px)", color: "#fff", fontWeight: 700, lineHeight: 1.25, maxWidth: 640, margin: "0 auto" }}>
            Why does the US spend this much — and get <span style={{ color: "#e05c6f" }}>worse outcomes</span> than every peer nation?
          </div>
        </div>

        {/* Thesis */}
        <div style={{
          background: "linear-gradient(135deg,#12080a 0%,#0a080f 100%)",
          border: "1px solid #3a1a2e", borderRadius: 10, padding: "32px 36px", marginBottom: 32
        }}>
          <div style={{ fontSize: 10, color: "#7c2040", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12 }}>Research Finding</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(18px,3vw,28px)", color: "#fff", fontWeight: 700, lineHeight: 1.3, marginBottom: 16 }}>
            The US spends <span style={{ color: "#e05c6f" }}>more than twice per capita</span> what most wealthy nations spend on healthcare — and gets <span style={{ color: "#e8855a" }}>worse outcomes</span> in return.
          </div>
          <div style={{ fontSize: 13, color: "#7a7890", lineHeight: 1.8, maxWidth: 760 }}>
            Americans have the lowest life expectancy among large, wealthy OECD nations — lagging peers by up to 6 years — while spending ~17% of GDP on care.
            Up to <span style={{ color: "#f0c96a" }}>25% of that spending is waste</span>, with administrative complexity and pricing failures as the largest culprits.
            <span style={{ color: "#4a4870" }}> Sources: Berwick et al., Health Affairs 2025; Richman et al., Health Affairs 2022.</span>
          </div>
        </div>

        {/* OECD + BIR */}
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, marginBottom: 16 }}>
          <div className="card">
            <div className="card-title">Per-Capita Health Spending — US vs. OECD Peers (2022, USD PPP)</div>
            <div style={{ fontSize: 11, color: "#5a58a0", marginBottom: 12 }}>
              The US outspends every comparable nation — <span style={{ color: "#e05c6f" }}>$3,000+ above Switzerland</span>, the next-highest, and nearly twice Germany.
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={oecdSpending} layout="vertical" margin={{ top: 4, right: 80, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fill: "#6b6a8f", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#1a1a2e" }} />
                <YAxis type="category" dataKey="country" tick={{ fill: "#c0bfef", fontSize: 10 }} tickLine={false} axisLine={false} width={120} />
                <Tooltip cursor={{ fill: "rgba(124,111,205,.08)" }} content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return <TT>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: d.highlight ? "#e05c6f" : "#fff" }}>{d.country}</div>
                    <TR label="Per-capita spend" value={`$${d.spend.toLocaleString()}`} color={d.highlight ? "#e05c6f" : "#f0c96a"} />
                    {d.highlight && <TR label="vs. OECD avg (~$6,200)" value="+102% above avg" color="#e8855a" />}
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
              Richman et al. (2022) measured actual staff time and overhead per bill. The US surgical bill costs 36× Canada's nonsurgical bill — and the gap is driven by coding complexity, not wages.
            </div>
            {birCosts.map((d, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: d.highlight ? "#e05c6f" : "#c0bfef", fontWeight: d.highlight ? 600 : 400 }}>{d.country}</span>
                  <span style={{ fontSize: 12, color: d.highlight ? "#e05c6f" : "#f0c96a", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>${d.surgical}/bill</span>
                </div>
                <div style={{ background: "#1a1a2e", borderRadius: 4, height: 7 }}>
                  <div style={{ width: `${(d.surgical / 215) * 100}%`, height: "100%", background: d.highlight ? "#e05c6f" : "#7c6fcd", opacity: d.highlight ? 1 : 0.6, borderRadius: 4 }} />
                </div>
                {d.highlight && (
                  <div style={{ fontSize: 10, color: "#5a2030", marginTop: 3 }}>36× Canada (nonsurgical) · 3× Germany · ~6× Singapore</div>
                )}
              </div>
            ))}
            <div style={{ fontSize: 10, color: "#3a3a5a", marginTop: 8 }}>
              High costs driven by complex coding and multipayer fragmentation, not higher wages. Source: Richman et al. 2022.
            </div>
          </div>
        </div>

        {/* Waste + equity */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 40 }}>
          <div className="card">
            <div className="card-title">Where the Waste Goes — Estimated $760B–$935B Annually</div>
            <div style={{ fontSize: 11, color: "#5a58a0", marginBottom: 16 }}>
              Shrank et al. (JAMA 2019) identified six waste categories. Administrative complexity alone — $265.6B — rivals the entire Canadian healthcare budget.
            </div>
            {wasteBreakdown.map((d, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: "#c0bfef" }}>{d.category}</span>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ fontSize: 11, color: "#5a58a0", fontVariantNumeric: "tabular-nums" }}>{d.range}</span>
                    <span style={{ fontSize: 11, color: d.color, fontVariantNumeric: "tabular-nums", fontWeight: 600, minWidth: 34, textAlign: "right" }}>{d.pct}%</span>
                  </div>
                </div>
                <div style={{ background: "#1a1a2e", borderRadius: 4, height: 6, marginBottom: 3 }}>
                  <div style={{ width: `${(d.bn / 265.6) * 100}%`, height: "100%", background: d.color, opacity: 0.8, borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 10, color: "#3a3a5a" }}>{d.desc}</div>
              </div>
            ))}
            <div style={{ fontSize: 10, color: "#3a3a5a", marginTop: 4 }}>Source: Shrank et al. JAMA 2019. % = share of total waste; bars scaled to largest category.</div>
          </div>

          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="card-title">Outcomes Don't Match the Spending</div>
            {[
              { icon: "📉", label: "Life Expectancy Gap (2023)", val: "4.1 years shorter", sub: "78.4 yrs US vs 82.5 yrs peer avg — KFF/Peterson Health System Tracker", color: "#e05c6f" },
              { icon: "🏥", label: "Medical Debt", val: "100M+ Americans", sub: "Largest driver of personal bankruptcy (Berwick et al. 2025)", color: "#e8855a" },
              { icon: "🚫", label: "Uninsured", val: "25M+ Americans", sub: "As of 2023, despite ACA expansion (Berwick et al. 2025)", color: "#7c6fcd" },
              { icon: "👶", label: "Maternal Mortality (2023)", val: "18.6 per 100K", sub: "3.6× the comparable country avg of 5.1 — KFF/Peterson", color: "#b563b5" },
              { icon: "🏨", label: "Avoidable ER Use (2023)", val: "16% of US adults", sub: "vs. 11% peer avg — lack of regular primary care (KFF/Peterson)", color: "#5a9eb5" },
              { icon: "👩‍⚕️", label: "GP Shortage (2022)", val: "0.6 per 1,000", sub: "US has 57% fewer GPs than peer avg of 1.4 (KFF/Peterson)", color: "#f0c96a" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "10px 14px", background: "#0f0f1a", borderRadius: 6, borderLeft: `3px solid ${s.color}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 10, color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: s.color, margin: "1px 0" }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "#4a4870", lineHeight: 1.5 }}>{s.sub}</div>
                </div>
              </div>
            ))}
            <div style={{ fontSize: 10, color: "#2a2a3a", marginTop: 4 }}>Sources: Berwick et al. 2025 · KFF/Peterson Health System Tracker 2026</div>
          </div>
        </div>

        {/* ── QUALITY OUTCOMES DEEP-DIVE ── */}
        <div style={{ borderTop: "1px solid #1a1a2e", paddingTop: 28, marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 6 }}>Quality Deep-Dive</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(14px,2vw,18px)", color: "#c0bfef", fontWeight: 700, marginBottom: 4 }}>
            Where the US Leads, Lags, and Falls Short
          </div>
          <div style={{ fontSize: 11, color: "#5a58a0", marginBottom: 20 }}>
            Source: Peterson-KFF Health System Tracker 2026 · KFF analysis of OECD data, CDC, Commonwealth Fund
          </div>

          {/* Row A: Maternal mortality + Preventable admissions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

            {/* Maternal mortality */}
            <div className="card">
              <div className="card-title">Maternal Mortality Rate per 100,000 Live Births (2023)</div>
              <div style={{ fontSize: 11, color: "#5a58a0", marginBottom: 12 }}>
                The US rate of <span style={{ color: "#e05c6f" }}>18.6</span> is <span style={{ color: "#e05c6f" }}>3.6× the comparable country average</span> of 5.1. Every racial and socioeconomic group in the US exceeds the peer country average.
              </div>
              {maternalMortality.map((d, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: d.highlight ? "#e05c6f" : d.isAvg ? "#7c6fcd" : "#9b9abf", fontWeight: d.highlight || d.isAvg ? 600 : 400 }}>{d.country}</span>
                    <span style={{ fontSize: 11, color: d.highlight ? "#e05c6f" : d.isAvg ? "#7c6fcd" : "#c0bfef", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{d.rate}</span>
                  </div>
                  <div style={{ background: "#1a1a2e", borderRadius: 3, height: 5 }}>
                    <div style={{ width: `${(d.rate / 18.6) * 100}%`, height: "100%", background: d.highlight ? "#e05c6f" : d.isAvg ? "#7c6fcd" : "#3a3a5a", borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Preventable admissions */}
            <div className="card">
              <div className="card-title">Preventable Hospital Admissions per 100,000 Population (2022)</div>
              <div style={{ fontSize: 11, color: "#5a58a0", marginBottom: 16 }}>
                Heart failure and diabetes hospitalizations are far higher in the US — a sign of poor preventive and primary care. US performs better on COPD.
              </div>
              {preventableAdmissions.map((d, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#c0bfef", marginBottom: 6, fontWeight: 600 }}>{d.condition}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: "#5a58a0", width: 28 }}>US</span>
                    <div style={{ flex: 1, background: "#1a1a2e", borderRadius: 3, height: 8 }}>
                      <div style={{ width: `${(d.us / 400) * 100}%`, height: "100%", background: d.usHigher ? "#e05c6f" : "#8baa7e", borderRadius: 3, opacity: 0.9 }} />
                    </div>
                    <span style={{ fontSize: 11, color: d.usHigher ? "#e05c6f" : "#8baa7e", fontVariantNumeric: "tabular-nums", width: 42, textAlign: "right", fontWeight: 600 }}>{d.us}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "#5a58a0", width: 28 }}>Peer</span>
                    <div style={{ flex: 1, background: "#1a1a2e", borderRadius: 3, height: 8 }}>
                      <div style={{ width: `${(d.peer / 400) * 100}%`, height: "100%", background: "#7c6fcd", borderRadius: 3, opacity: 0.7 }} />
                    </div>
                    <span style={{ fontSize: 11, color: "#7c6fcd", fontVariantNumeric: "tabular-nums", width: 42, textAlign: "right" }}>{d.peer}</span>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                {[["#e05c6f", "US higher (worse)"], ["#8baa7e", "US lower (better)"], ["#7c6fcd", "Peer avg"]].map(([c, l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 8, height: 8, background: c, borderRadius: 2, opacity: 0.85 }} />
                    <span style={{ fontSize: 10, color: "#5a58a0" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row B: ER avoidable use + GP density */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

            {/* Avoidable ER */}
            <div className="card">
              <div className="card-title">Adults Using ER for Avoidable Reasons (2023)</div>
              <div style={{ fontSize: 11, color: "#5a58a0", marginBottom: 12 }}>
                16% of US adults used the ER for care a regular doctor could have provided — vs. 11% peer average. Reflects lack of accessible primary care.
              </div>
              {avoidableER.map((d, i) => (
                <div key={i} style={{ marginBottom: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: d.highlight ? "#e05c6f" : d.isAvg ? "#7c6fcd" : "#9b9abf", fontWeight: d.highlight || d.isAvg ? 600 : 400 }}>{d.country}</span>
                    <span style={{ fontSize: 11, color: d.highlight ? "#e05c6f" : d.isAvg ? "#7c6fcd" : "#c0bfef", fontVariantNumeric: "tabular-nums", fontWeight: d.highlight ? 700 : 400 }}>{d.pct}%</span>
                  </div>
                  <div style={{ background: "#1a1a2e", borderRadius: 3, height: 5 }}>
                    <div style={{ width: `${(d.pct / 19) * 100}%`, height: "100%", background: d.highlight ? "#e05c6f" : d.isAvg ? "#7c6fcd" : "#3a3a5a", borderRadius: 3 }} />
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 10, color: "#3a3a5a", marginTop: 8 }}>Source: Commonwealth Fund 2023 International Health Policy Survey</div>
            </div>

            {/* GP density */}
            <div className="card">
              <div className="card-title">General Practitioners per 1,000 Population (2022)</div>
              <div style={{ fontSize: 11, color: "#5a58a0", marginBottom: 12 }}>
                The US has just 0.6 GPs per 1,000 — <span style={{ color: "#e05c6f" }}>57% below the peer average of 1.4</span>. As of 2024, 53% of the US population lives in areas with a primary care shortage.
              </div>
              {gpDensity.map((d, i) => (
                <div key={i} style={{ marginBottom: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: d.highlight ? "#e05c6f" : d.isAvg ? "#7c6fcd" : "#9b9abf", fontWeight: d.highlight || d.isAvg ? 600 : 400 }}>{d.country}</span>
                    <span style={{ fontSize: 11, color: d.highlight ? "#e05c6f" : d.isAvg ? "#7c6fcd" : "#c0bfef", fontVariantNumeric: "tabular-nums", fontWeight: d.highlight ? 700 : 400 }}>{d.gp}</span>
                  </div>
                  <div style={{ background: "#1a1a2e", borderRadius: 3, height: 5 }}>
                    <div style={{ width: `${(d.gp / 2.0) * 100}%`, height: "100%", background: d.highlight ? "#e05c6f" : d.isAvg ? "#7c6fcd" : "#3a3a5a", borderRadius: 3 }} />
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 10, color: "#3a3a5a", marginTop: 8 }}>Source: KFF analysis of OECD data on practicing physicians</div>
            </div>
          </div>

          {/* Row C: 30-day mortality nuance callout */}
          <div className="card" style={{ marginBottom: 4 }}>
            <div className="card-title">⚠ Where the US Actually Leads: 30-Day Mortality After Acute Events (2022)</div>
            <div style={{ fontSize: 11, color: "#5a58a0", marginBottom: 16 }}>
              The US performs better than the comparable country average on 30-day mortality after heart attacks and strokes — a genuine area of strength in acute care. This does not offset the broader pattern of poor outcomes, but it matters for an honest picture.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {mortalityRates.map((d, i) => {
                const label = d.condition.replace("\n", " ");
                const usBetter = d.us < d.peer;
                return (
                  <div key={i} style={{ background: "#0f0f1a", borderRadius: 8, padding: "14px 16px", borderTop: `2px solid ${usBetter ? "#8baa7e" : "#e05c6f"}` }}>
                    <div style={{ fontSize: 10, color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: usBetter ? "#8baa7e" : "#e05c6f" }}>{d.us}</div>
                        <div style={{ fontSize: 10, color: "#4a4870" }}>US</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#7c6fcd" }}>{d.peer}</div>
                        <div style={{ fontSize: 10, color: "#4a4870" }}>Peer Avg</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: usBetter ? "#8baa7e" : "#e05c6f", fontWeight: 600 }}>
                      {usBetter ? `US is ${(d.peer - d.us).toFixed(1)} pts better` : `US is ${(d.us - d.peer).toFixed(1)} pts worse`}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 10, color: "#3a3a5a", marginTop: 12 }}>
              Deaths per 100 patients, age-standardized, ages 45+, 2022. Source: KFF analysis of OECD data. Note: several individual peer nations outperform the US even on these metrics.
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid #1a1a2e", paddingTop: 36 }}>
          <div style={{ fontSize: 10, color: "#5a58a0", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 24, textAlign: "center" }}>What This Means</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
            {[
              { val: "$3,000+", lbl: "more spent per person annually vs. Switzerland — the next-highest OECD spender", color: "#e05c6f" },
              { val: "$760–935B", lbl: "in annual waste producing no measurable health benefit (Shrank et al. JAMA 2019)", color: "#e8855a" },
              { val: "4.1 years", lbl: "life expectancy gap vs. peer nations in 2023 (78.4 US vs 82.5 peer avg) — KFF/Peterson Health System Tracker", color: "#7c6fcd" },
              { val: "100M+", lbl: "Americans carrying medical debt in the world's wealthiest country", color: "#f0c96a" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "22px 20px", background: "#0c0c15", border: `1px solid ${s.color}20`, borderRadius: 10, borderTop: `2px solid ${s.color}` }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 10, fontFamily: "'Syne',sans-serif" }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "#7a7890", lineHeight: 1.65 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 10, color: "#2a2a3a", textAlign: "center", paddingBottom: 16 }}>
        Sources: BEA Health Care Satellite Account 2000–2021 · BLS/FRED Median Weekly Earnings (LEU0252881500A) · OECD Health Expenditure &amp; Financing 2022 · Richman et al. Health Affairs 2022 · Shrank et al. JAMA 2019 · Berwick et al. Health Affairs 2025 · Peterson-KFF Health System Tracker 2026
      </div>
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
        *{box-sizing:border-box;margin:0;padding:0;}
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
        A Personal &amp; Public Health Story
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
  const [screen, setScreen] = useState("landing");
  if (screen === "landing") return <LandingScreen onEnter={() => setScreen("main")} />;
  return <MainScreen onBack={() => setScreen("landing")} />;
}