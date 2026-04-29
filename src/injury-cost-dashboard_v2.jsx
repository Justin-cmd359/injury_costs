import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  Line,
} from "recharts";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const fatalRaw = [
  {
    mechanism: "Drug Poisoning",
    intent: "Unintentional",
    deaths: 97231,
    combinedTotal: 1100,
  },
  {
    mechanism: "Motor Vehicle",
    intent: "Unintentional",
    deaths: 43273,
    combinedTotal: 456.99,
  },
  {
    mechanism: "Fall",
    intent: "Unintentional",
    deaths: 47026,
    combinedTotal: 194.59,
  },
  {
    mechanism: "Firearm",
    intent: "Suicide",
    deaths: 27300,
    combinedTotal: 271.36,
  },
  {
    mechanism: "Firearm",
    intent: "Homicide",
    deaths: 17927,
    combinedTotal: 215.37,
  },
  {
    mechanism: "Suffocation",
    intent: "Suicide",
    deaths: 12023,
    combinedTotal: 136.79,
  },
  {
    mechanism: "Suffocation",
    intent: "Unintentional",
    deaths: 7333,
    combinedTotal: 60.57,
  },
  {
    mechanism: "Drowning",
    intent: "Unintentional",
    deaths: 4310,
    combinedTotal: 49.2,
  },
  {
    mechanism: "Drug Poisoning",
    intent: "Suicide",
    deaths: 4660,
    combinedTotal: 48.3,
  },
  {
    mechanism: "Fire/Flame",
    intent: "Unintentional",
    deaths: 3375,
    combinedTotal: 29.42,
  },
  {
    mechanism: "Non-Drug Poisoning",
    intent: "Unintentional",
    deaths: 3073,
    combinedTotal: 33.44,
  },
  {
    mechanism: "Drug Poisoning",
    intent: "Undetermined",
    deaths: 2903,
    combinedTotal: 33.12,
  },
  {
    mechanism: "Natural/Environmental",
    intent: "Unintentional",
    deaths: 2880,
    combinedTotal: 24.4,
  },
  {
    mechanism: "Cut/Pierce",
    intent: "Homicide",
    deaths: 1704,
    combinedTotal: 19.2,
  },
  {
    mechanism: "Transport Other",
    intent: "Unintentional",
    deaths: 1292,
    combinedTotal: 13.57,
  },
  { mechanism: "Fall", intent: "Suicide", deaths: 1297, combinedTotal: 14.1 },
  {
    mechanism: "Non-Drug Poisoning",
    intent: "Suicide",
    deaths: 1284,
    combinedTotal: 13.31,
  },
  {
    mechanism: "Cut/Pierce",
    intent: "Suicide",
    deaths: 1047,
    combinedTotal: 10.75,
  },
  {
    mechanism: "Struck by/against",
    intent: "Unintentional",
    deaths: 1013,
    combinedTotal: 9.8,
  },
  {
    mechanism: "Pedal Cyclist",
    intent: "Unintentional",
    deaths: 440,
    combinedTotal: 4.2,
  },
];

const nonfatalRaw = [
  {
    mechanism: "Fall",
    intent: "Unintentional",
    hospitalizations: 1850000,
    combinedTotal: 495.8,
  },
  {
    mechanism: "Poisoning",
    intent: "Unintentional",
    hospitalizations: 344683,
    combinedTotal: 18.81,
  },
  {
    mechanism: "Firearm",
    intent: "Assault",
    hospitalizations: 70772,
    combinedTotal: 15.55,
  },
  {
    mechanism: "Cut/Pierce",
    intent: "Self-Harm",
    hospitalizations: 69112,
    combinedTotal: 5.33,
  },
  {
    mechanism: "Cut/Pierce",
    intent: "Unintentional",
    hospitalizations: 56642,
    combinedTotal: 6.89,
  },
  {
    mechanism: "Overexertion",
    intent: "Unintentional",
    hospitalizations: 49545,
    combinedTotal: 9.47,
  },
  {
    mechanism: "Foreign Body",
    intent: "Unintentional",
    hospitalizations: 44837,
    combinedTotal: 3.13,
  },
  {
    mechanism: "Fire/Burn",
    intent: "Unintentional",
    hospitalizations: 45297,
    combinedTotal: 7.34,
  },
  {
    mechanism: "Cut/Pierce",
    intent: "Assault",
    hospitalizations: 32587,
    combinedTotal: 5.44,
  },
  {
    mechanism: "Bite: Other",
    intent: "Unintentional",
    hospitalizations: 32306,
    combinedTotal: 3.79,
  },
  {
    mechanism: "Firearm",
    intent: "Unintentional",
    hospitalizations: 14184,
    combinedTotal: 2.61,
  },
  {
    mechanism: "Natural/Environmental",
    intent: "Unintentional",
    hospitalizations: 13247,
    combinedTotal: 1.25,
  },
  {
    mechanism: "Inhalation/Suffocation",
    intent: "Unintentional",
    hospitalizations: 12366,
    combinedTotal: 0.95,
  },
  {
    mechanism: "Machinery",
    intent: "Unintentional",
    hospitalizations: 12191,
    combinedTotal: 2.36,
  },
  {
    mechanism: "Bite: Dog",
    intent: "Unintentional",
    hospitalizations: 19499,
    combinedTotal: 2.21,
  },
  {
    mechanism: "Inhalation/Suffocation",
    intent: "Self-Harm",
    hospitalizations: 8605,
    combinedTotal: 3.66,
  },
  {
    mechanism: "Firearm",
    intent: "Self-Harm",
    hospitalizations: 5141,
    combinedTotal: 1.74,
  },
];

// WISQARS Nonfatal ED, 2023 — intent-level totals
const edRaw = [
  {
    intent: "Unintentional",
    visits: 25424384,
    crudeRate: 7591.3,
    ageAdjRate: 7528.35,
  },
  { intent: "Assault", visits: 1482863, crudeRate: 442.76, ageAdjRate: 463.59 },
  {
    intent: "Self-Harm",
    visits: 496966,
    crudeRate: 148.39,
    ageAdjRate: 157.34,
  },
  {
    intent: "Sexual Assault",
    visits: 126809,
    crudeRate: 37.86,
    ageAdjRate: 41.32,
  },
  {
    intent: "Legal Intervention",
    visits: 93758,
    crudeRate: 27.99,
    ageAdjRate: 29.63,
  },
];

// BLS CFOI 2023
const occEventData = [
  { event: "Transportation", fatalities: 1942 },
  { event: "Violent Acts", fatalities: 740 },
  { event: "Falls/Slips/Trips", fatalities: 885 },
  { event: "Harmful Substances", fatalities: 820 },
  { event: "Contact w/ Equipment", fatalities: 779 },
  { event: "Fires/Explosions", fatalities: 104 },
];

const occIndustryData = [
  { industry: "Construction", fatalities: 1075 },
  { industry: "Transportation/Warehousing", fatalities: 895 },
  { industry: "Government", fatalities: 445 },
  { industry: "Agriculture/Forestry", fatalities: 448 },
  { industry: "Professional Services", fatalities: 289 },
  { industry: "Manufacturing", fatalities: 323 },
  { industry: "Retail Trade", fatalities: 237 },
  { industry: "Leisure/Hospitality", fatalities: 194 },
  { industry: "Other Services", fatalities: 124 },
  { industry: "Wholesale Trade", fatalities: 143 },
  { industry: "Mining", fatalities: 113 },
  { industry: "Health/Social Services", fatalities: 97 },
].sort((a, b) => b.fatalities - a.fatalities);

// WISQARS × CFOI cross-reference overlap
const crossRefData = [
  {
    mechanism: "Motor Vehicle",
    wisqarsFatal: 43273,
    occFatal: 1310,
    pctOcc: 3.0,
  },
  { mechanism: "Fall", wisqarsFatal: 47026, occFatal: 885, pctOcc: 1.9 },
  {
    mechanism: "Violent Acts",
    wisqarsFatal: 19631,
    occFatal: 740,
    pctOcc: 3.8,
  },
  {
    mechanism: "Harmful Subst.",
    wisqarsFatal: 103694,
    occFatal: 820,
    pctOcc: 0.8,
  },
  {
    mechanism: "Contact/Equip.",
    wisqarsFatal: 1013,
    occFatal: 779,
    pctOcc: 76.9,
  },
  {
    mechanism: "Fire/Explosion",
    wisqarsFatal: 3375,
    occFatal: 104,
    pctOcc: 3.1,
  },
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const INTENT_COLORS = {
  Unintentional: "#e8855a",
  Suicide: "#7c6fcd",
  Homicide: "#e05c6f",
  "Self-Harm": "#b563b5",
  Assault: "#e05c6f",
  "Sexual Assault": "#d4507a",
  Undetermined: "#8baa7e",
  "Legal Intervention": "#5a9eb5",
};

const EVENT_COLORS = {
  Transportation: "#5a9eb5",
  "Violent Acts": "#e05c6f",
  "Falls/Slips/Trips": "#e8855a",
  "Harmful Substances": "#7c6fcd",
  "Contact w/ Equipment": "#8baa7e",
  "Fires/Explosions": "#f0c96a",
};

const INTENT_ORDER = [
  "Unintentional",
  "Suicide",
  "Homicide",
  "Self-Harm",
  "Assault",
  "Sexual Assault",
  "Undetermined",
  "Legal Intervention",
];

const TABS = [
  {
    id: "fatal",
    label: "⚰  Fatal",
    subtitle: "WISQARS fatal injury costs · CDC",
  },
  {
    id: "nonfatal",
    label: "🏥  Nonfatal Hosp.",
    subtitle: "WISQARS hospitalization costs · CDC",
  },
  {
    id: "ed",
    label: "🚑  ED Visits",
    subtitle: "WISQARS emergency department volume · CDC",
  },
  {
    id: "occ",
    label: "🏗  Occupational",
    subtitle: "BLS Census of Fatal Occupational Injuries 2023",
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = {
  B: (v) => {
    if (!v && v !== 0) return "—";
    if (v >= 1000) return `$${(v / 1000).toFixed(1)}T`;
    if (v >= 1) return `$${v.toFixed(1)}B`;
    return `$${(v * 1000).toFixed(0)}M`;
  },
  N: (v) => {
    if (!v && v !== 0) return "—";
    if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v.toLocaleString();
  },
  rate: (v) => (v ? v.toFixed(1) : "—"),
  pct: (v) => (v ? `${v.toFixed(1)}%` : "—"),
};

// ─── SHARED TOOLTIP ───────────────────────────────────────────────────────────

const TT = ({ children }) => (
  <div
    style={{
      background: "#0f0f14",
      border: "1px solid #2a2a3a",
      borderRadius: 8,
      padding: "12px 16px",
      fontFamily: "'DM Mono',monospace",
      fontSize: 12,
      color: "#e0dff5",
      boxShadow: "0 8px 32px rgba(0,0,0,.5)",
      maxWidth: 240,
    }}
  >
    {children}
  </div>
);
const TR = ({ label, value, color = "#fff" }) => (
  <div style={{ color: "#9b9abf", marginBottom: 3 }}>
    {label}: <span style={{ color }}>{value}</span>
  </div>
);

// ─── WISQARS PANEL (fatal + nonfatal) ─────────────────────────────────────────

function WisqarsPanel({ mode }) {
  const [sortBy, setSortBy] = useState("cost");
  const [filterIntent, setFilterIntent] = useState("All");
  const [topN, setTopN] = useState(12);

  const rawData = mode === "fatal" ? fatalRaw : nonfatalRaw;
  const countKey = mode === "fatal" ? "deaths" : "hospitalizations";
  const countLabel = mode === "fatal" ? "Deaths" : "Hospitalizations";

  const allIntents = useMemo(() => {
    const s = new Set(rawData.map((d) => d.intent));
    return ["All", ...INTENT_ORDER.filter((i) => s.has(i))];
  }, [rawData]);

  const filtered = useMemo(() => {
    let d =
      filterIntent === "All"
        ? rawData
        : rawData.filter((r) => r.intent === filterIntent);
    d = [...d].sort((a, b) =>
      sortBy === "cost"
        ? b.combinedTotal - a.combinedTotal
        : b[countKey] - a[countKey]
    );
    return d.slice(0, topN);
  }, [rawData, filterIntent, sortBy, topN, countKey]);

  const total = useMemo(
    () => filtered.reduce((s, d) => s + d.combinedTotal, 0),
    [filtered]
  );
  const totalCases = useMemo(
    () => filtered.reduce((s, d) => s + (d[countKey] || 0), 0),
    [filtered, countKey]
  );

  const scatterData = useMemo(
    () =>
      filtered
        .map((d) => ({
          ...d,
          count: d[countKey],
          costPer: (d.combinedTotal * 1e9) / d[countKey],
        }))
        .filter((d) => d.count > 0 && isFinite(d.costPer)),
    [filtered, countKey]
  );

  return (
    <div>
      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { lbl: "Showing", val: filtered.length, sub: "categories" },
          { lbl: countLabel, val: fmt.N(totalCases), sub: "total cases" },
          {
            lbl: "Combined Cost",
            val: fmt.B(total),
            sub: "selected subset",
            gold: true,
          },
          {
            lbl: "Top Category",
            val: filtered[0]?.mechanism,
            sub: filtered[0]?.intent,
            ic: INTENT_COLORS[filtered[0]?.intent],
          },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div
              className="stat-lbl"
              style={{ color: s.gold ? "#f0c96a" : undefined }}
            >
              {s.lbl}
            </div>
            <div
              className="stat-val"
              style={{
                color: s.gold ? "#f0c96a" : "#fff",
                fontSize:
                  typeof s.val === "string" && s.val.length > 6
                    ? "15px"
                    : "22px",
              }}
            >
              {s.val}
            </div>
            <div className="stat-sub" style={{ color: s.ic || "#6b6a8f" }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <span className="ctrl-lbl">Filter:</span>
        {allIntents.map((intent) => (
          <button
            key={intent}
            className={`pill${filterIntent === intent ? " pill-on" : ""}`}
            style={
              filterIntent === intent && intent !== "All"
                ? {
                  borderColor: INTENT_COLORS[intent],
                  color: INTENT_COLORS[intent],
                }
                : {}
            }
            onClick={() => setFilterIntent(intent)}
          >
            {intent}
          </button>
        ))}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <span className="ctrl-lbl">Sort:</span>
          <select
            className="sel"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="cost">Combined Cost</option>
            <option value="count">{countLabel}</option>
          </select>
          <span className="ctrl-lbl">Top:</span>
          <select
            className="sel"
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
          >
            {[8, 12, 16, 99].map((n) => (
              <option key={n} value={n}>
                {n === 99 ? "All" : n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bar chart */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">
          Combined Economic Cost by Injury Mechanism
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={filtered}
            margin={{ top: 4, right: 20, left: 10, bottom: 80 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1a1a2e"
              vertical={false}
            />
            <XAxis
              dataKey="mechanism"
              tick={{ fill: "#6b6a8f", fontSize: 10 }}
              angle={-38}
              textAnchor="end"
              interval={0}
              tickLine={false}
              axisLine={{ stroke: "#1a1a2e" }}
            />
            <YAxis
              tickFormatter={fmt.B}
              tick={{ fill: "#6b6a8f", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={62}
            />
            <Tooltip
              cursor={{ fill: "rgba(124,111,205,.08)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <TT>
                    <div
                      style={{
                        fontWeight: 700,
                        marginBottom: 6,
                        color: "#fff",
                      }}
                    >
                      {d.mechanism}
                    </div>
                    <TR
                      label="Intent"
                      value={d.intent}
                      color={INTENT_COLORS[d.intent]}
                    />
                    <TR label={countLabel} value={fmt.N(d[countKey])} />
                    <TR
                      label="Combined Cost"
                      value={fmt.B(d.combinedTotal)}
                      color="#f0c96a"
                    />
                  </TT>
                );
              }}
            />
            <Bar dataKey="combinedTotal" radius={[4, 4, 0, 0]}>
              {filtered.map((e, i) => (
                <Cell
                  key={i}
                  fill={INTENT_COLORS[e.intent] || "#7c6fcd"}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend + Scatter */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div className="card">
          <div className="card-title">Intent Legend</div>
          {INTENT_ORDER.filter((i) => filtered.some((d) => d.intent === i)).map(
            (intent) => (
              <div
                key={intent}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: INTENT_COLORS[intent],
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 12, color: "#c0bfef" }}>{intent}</span>
                <span
                  style={{ marginLeft: "auto", fontSize: 11, color: "#5a58a0" }}
                >
                  {filtered.filter((d) => d.intent === intent).length} cat.
                </span>
              </div>
            )
          )}
        </div>
        <div className="card">
          <div className="card-title">
            Cost per Case vs. Volume — bubble = total cost
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 4, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
              <XAxis
                dataKey="count"
                type="number"
                tickFormatter={fmt.N}
                tick={{ fill: "#6b6a8f", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "#1a1a2e" }}
              />
              <YAxis
                dataKey="costPer"
                type="number"
                tickFormatter={(v) =>
                  v >= 1e6
                    ? `$${(v / 1e6).toFixed(1)}M`
                    : `$${(v / 1e3).toFixed(0)}K`
                }
                tick={{ fill: "#6b6a8f", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={62}
              />
              <ZAxis dataKey="combinedTotal" range={[40, 600]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3", stroke: "#2a2a3a" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <TT>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>
                        {d.mechanism}
                      </div>
                      <TR
                        label="Intent"
                        value={d.intent}
                        color={INTENT_COLORS[d.intent]}
                      />
                      <TR
                        label="Cost/case"
                        value={
                          d.costPer >= 1e6
                            ? `$${(d.costPer / 1e6).toFixed(2)}M`
                            : `$${(d.costPer / 1e3).toFixed(0)}K`
                        }
                        color="#f0c96a"
                      />
                      <TR
                        label="Total"
                        value={fmt.B(d.combinedTotal)}
                        color="#f0c96a"
                      />
                    </TT>
                  );
                }}
              />
              {INTENT_ORDER.filter((i) =>
                scatterData.some((d) => d.intent === i)
              ).map((intent) => (
                <Scatter
                  key={intent}
                  data={scatterData.filter((d) => d.intent === intent)}
                  fill={INTENT_COLORS[intent]}
                  fillOpacity={0.75}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{ padding: "14px 20px", borderBottom: "1px solid #1a1a2e" }}
          className="card-title"
        >
          Detail Table
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
                {["Mechanism", "Intent", countLabel, "Combined Cost"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        color: "#5a58a0",
                        fontWeight: 400,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontSize: 10,
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid #12121e" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#12121e")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "9px 16px", color: "#e0dff5" }}>
                    {row.mechanism}
                  </td>
                  <td style={{ padding: "9px 16px" }}>
                    <span
                      style={{
                        color: INTENT_COLORS[row.intent] || "#9b9abf",
                        background:
                          (INTENT_COLORS[row.intent] || "#9b9abf") + "18",
                        padding: "2px 8px",
                        borderRadius: 10,
                        fontSize: 10,
                      }}
                    >
                      {row.intent}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "9px 16px",
                      color: "#c0bfef",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {fmt.N(row[countKey])}
                  </td>
                  <td
                    style={{
                      padding: "9px 16px",
                      color: "#f0c96a",
                      fontVariantNumeric: "tabular-nums",
                      fontWeight: 500,
                    }}
                  >
                    {fmt.B(row.combinedTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ED PANEL ─────────────────────────────────────────────────────────────────

function EDPanel() {
  const sorted = [...edRaw].sort((a, b) => b.visits - a.visits);
  const totalVisits = edRaw.reduce((s, d) => s + d.visits, 0);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          {
            lbl: "Total ED Visits",
            val: fmt.N(totalVisits),
            sub: "all injury intents",
            gold: true,
          },
          {
            lbl: "Largest Category",
            val: "Unintentional",
            sub: "25.4M visits",
            ic: INTENT_COLORS["Unintentional"],
          },
          { lbl: "Rate per 100K", val: "8,248", sub: "crude rate, 2023" },
          { lbl: "Population Base", val: "334.9M", sub: "US 2023" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div
              className="stat-lbl"
              style={{ color: s.gold ? "#f0c96a" : undefined }}
            >
              {s.lbl}
            </div>
            <div
              className="stat-val"
              style={{ color: s.gold ? "#f0c96a" : "#fff", fontSize: 18 }}
            >
              {s.val}
            </div>
            <div className="stat-sub" style={{ color: s.ic || "#6b6a8f" }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div className="card">
          <div className="card-title">ED Visit Volume by Intent — 2023</div>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart
              data={sorted}
              layout="vertical"
              margin={{ top: 4, right: 60, left: 10, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1a1a2e"
                horizontal={false}
              />
              <XAxis
                type="number"
                tickFormatter={fmt.N}
                tick={{ fill: "#6b6a8f", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "#1a1a2e" }}
              />
              <YAxis
                type="category"
                dataKey="intent"
                tick={{ fill: "#c0bfef", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={130}
              />
              <Tooltip
                cursor={{ fill: "rgba(124,111,205,.08)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <TT>
                      <div
                        style={{
                          fontWeight: 700,
                          marginBottom: 6,
                          color: INTENT_COLORS[d.intent] || "#fff",
                        }}
                      >
                        {d.intent}
                      </div>
                      <TR label="ED Visits" value={fmt.N(d.visits)} />
                      <TR
                        label="Crude Rate"
                        value={`${fmt.rate(d.crudeRate)} per 100K`}
                      />
                      <TR
                        label="Age-Adj Rate"
                        value={`${fmt.rate(d.ageAdjRate)} per 100K`}
                        color="#f0c96a"
                      />
                      <TR
                        label="Share of total"
                        value={fmt.pct((d.visits / totalVisits) * 100)}
                        color="#f0c96a"
                      />
                    </TT>
                  );
                }}
              />
              <Bar dataKey="visits" radius={[0, 4, 4, 0]}>
                {sorted.map((e, i) => (
                  <Cell
                    key={i}
                    fill={INTENT_COLORS[e.intent] || "#7c6fcd"}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Rate per 100K Population</div>
          <div style={{ marginTop: 8 }}>
            {sorted.map((d, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: INTENT_COLORS[d.intent] || "#c0bfef",
                    }}
                  >
                    {d.intent}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#f0c96a",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {fmt.rate(d.crudeRate)}
                  </span>
                </div>
                <div
                  style={{ background: "#1a1a2e", borderRadius: 4, height: 6 }}
                >
                  <div
                    style={{
                      width: `${(d.crudeRate / 7591.3) * 100}%`,
                      height: "100%",
                      background: INTENT_COLORS[d.intent] || "#7c6fcd",
                      opacity: 0.8,
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            ))}
            <div style={{ fontSize: 10, color: "#3a3a5a", marginTop: 8 }}>
              Scaled to largest category (Unintentional = 7,591)
            </div>
          </div>
        </div>
      </div>

      {/* Care-setting funnel */}
      <div
        className="card"
        style={{ background: "#0e0d1c", borderColor: "#2a2845" }}
      >
        <div className="card-title" style={{ marginBottom: 12 }}>
          Care-Setting Funnel — All Injury Outcomes
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 8,
          }}
        >
          {[
            {
              lbl: "ED Visits",
              val: "27.6M",
              sub: "WISQARS ED 2023",
              color: "#5a9eb5",
            },
            {
              lbl: "Hospitalizations",
              val: "~2.5M",
              sub: "WISQARS Nonfatal Hosp.",
              color: "#e8855a",
            },
            {
              lbl: "Fatal Outcomes",
              val: "~220K",
              sub: "WISQARS Fatal",
              color: "#e05c6f",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                padding: "14px 16px",
                background: "#11111e",
                borderRadius: 6,
                borderLeft: `3px solid ${s.color}`,
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: s.color,
                  marginBottom: 2,
                }}
              >
                {s.val}
              </div>
              <div style={{ fontSize: 12, color: "#c0bfef" }}>{s.lbl}</div>
              <div style={{ fontSize: 10, color: "#5a58a0", marginTop: 2 }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: "#3a3a5a", marginTop: 10 }}>
          ED visits are ~11× hospitalizations and ~125× fatal outcomes — the
          vast majority of injury burden is treated and discharged.
        </div>
      </div>
    </div>
  );
}

// ─── OCCUPATIONAL PANEL ───────────────────────────────────────────────────────

function OccPanel() {
  const [view, setView] = useState("event");
  const totalOcc = occEventData.reduce((s, d) => s + d.fatalities, 0);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          {
            lbl: "Total Occ. Fatal",
            val: "5,283",
            sub: "US workplaces, 2023",
            gold: true,
          },
          {
            lbl: "Leading Event",
            val: "Transportation",
            sub: "1,942 (37%)",
            ic: EVENT_COLORS["Transportation"],
          },
          {
            lbl: "Top Industry",
            val: "Construction",
            sub: "1,075 (20%)",
            ic: "#e8855a",
          },
          { lbl: "Share of All Fatal", val: "2.4%", sub: "vs WISQARS ~220K" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div
              className="stat-lbl"
              style={{ color: s.gold ? "#f0c96a" : undefined }}
            >
              {s.lbl}
            </div>
            <div
              className="stat-val"
              style={{
                color: s.gold ? "#f0c96a" : s.ic || "#fff",
                fontSize: 18,
              }}
            >
              {s.val}
            </div>
            <div className="stat-sub" style={{ color: "#6b6a8f" }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", marginBottom: 20 }}>
        {[
          ["event", "By Event"],
          ["industry", "By Industry"],
          ["crossref", "WISQARS Overlap"],
        ].map(([id, lbl], i, arr) => (
          <button
            key={id}
            className={`tab-btn${view === id ? " active" : ""}`}
            style={{
              borderRadius:
                i === 0
                  ? "4px 0 0 4px"
                  : i === arr.length - 1
                    ? "0 4px 4px 0"
                    : "0",
              borderLeft: i > 0 ? "none" : undefined,
            }}
            onClick={() => setView(id)}
          >
            {lbl}
          </button>
        ))}
      </div>

      {view === "event" && (
        <div
          style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}
        >
          <div className="card">
            <div className="card-title">
              Fatal Injuries by Event Type — All Industries 2023
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={occEventData}
                margin={{ top: 4, right: 20, left: 10, bottom: 44 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1a1a2e"
                  vertical={false}
                />
                <XAxis
                  dataKey="event"
                  tick={{ fill: "#6b6a8f", fontSize: 10 }}
                  angle={-28}
                  textAnchor="end"
                  interval={0}
                  tickLine={false}
                  axisLine={{ stroke: "#1a1a2e" }}
                />
                <YAxis
                  tickFormatter={fmt.N}
                  tick={{ fill: "#6b6a8f", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip
                  cursor={{ fill: "rgba(124,111,205,.08)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <TT>
                        <div
                          style={{
                            fontWeight: 700,
                            marginBottom: 6,
                            color: EVENT_COLORS[d.event] || "#fff",
                          }}
                        >
                          {d.event}
                        </div>
                        <TR label="Fatalities" value={fmt.N(d.fatalities)} />
                        <TR
                          label="Share of total"
                          value={fmt.pct((d.fatalities / totalOcc) * 100)}
                          color="#f0c96a"
                        />
                      </TT>
                    );
                  }}
                />
                <Bar dataKey="fatalities" radius={[4, 4, 0, 0]}>
                  {occEventData.map((e, i) => (
                    <Cell
                      key={i}
                      fill={EVENT_COLORS[e.event] || "#7c6fcd"}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-title">Share Breakdown</div>
            {occEventData.map((d, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: EVENT_COLORS[d.event] || "#c0bfef",
                    }}
                  >
                    {d.event}
                  </span>
                  <span style={{ fontSize: 11, color: "#f0c96a" }}>
                    {fmt.pct((d.fatalities / totalOcc) * 100)}
                  </span>
                </div>
                <div
                  style={{ background: "#1a1a2e", borderRadius: 4, height: 6 }}
                >
                  <div
                    style={{
                      width: `${(d.fatalities / 1942) * 100}%`,
                      height: "100%",
                      background: EVENT_COLORS[d.event] || "#7c6fcd",
                      opacity: 0.8,
                      borderRadius: 4,
                    }}
                  />
                </div>
                <div style={{ fontSize: 10, color: "#5a58a0", marginTop: 2 }}>
                  {fmt.N(d.fatalities)} fatalities
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "industry" && (
        <div className="card">
          <div className="card-title">
            Fatal Injuries by Industry Sector — 2023
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={occIndustryData}
              layout="vertical"
              margin={{ top: 4, right: 80, left: 20, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1a1a2e"
                horizontal={false}
              />
              <XAxis
                type="number"
                tickFormatter={fmt.N}
                tick={{ fill: "#6b6a8f", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "#1a1a2e" }}
              />
              <YAxis
                type="category"
                dataKey="industry"
                tick={{ fill: "#c0bfef", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={200}
              />
              <Tooltip
                cursor={{ fill: "rgba(124,111,205,.08)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <TT>
                      <div
                        style={{
                          fontWeight: 700,
                          marginBottom: 6,
                          color: "#fff",
                        }}
                      >
                        {d.industry}
                      </div>
                      <TR label="Fatalities" value={fmt.N(d.fatalities)} />
                      <TR
                        label="Share of total"
                        value={fmt.pct((d.fatalities / 5283) * 100)}
                        color="#f0c96a"
                      />
                    </TT>
                  );
                }}
              />
              <Bar
                dataKey="fatalities"
                radius={[0, 4, 4, 0]}
                fill="#e8855a"
                fillOpacity={0.82}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === "crossref" && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">
              Occupational Fatalities as % of WISQARS Total — by Mechanism
            </div>
            <div style={{ fontSize: 11, color: "#5a58a0", marginBottom: 16 }}>
              Blue bars = all WISQARS deaths · Teal bars = occupational subset ·
              Gold line = occupational % (right axis)
            </div>
            <ResponsiveContainer width="100%" height={290}>
              <ComposedChart
                data={crossRefData}
                margin={{ top: 4, right: 40, left: 10, bottom: 44 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1a1a2e"
                  vertical={false}
                />
                <XAxis
                  dataKey="mechanism"
                  tick={{ fill: "#6b6a8f", fontSize: 10 }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tickLine={false}
                  axisLine={{ stroke: "#1a1a2e" }}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={fmt.N}
                  tick={{ fill: "#6b6a8f", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={58}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: "#6b6a8f", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={38}
                />
                <Tooltip
                  cursor={{ fill: "rgba(124,111,205,.08)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <TT>
                        <div
                          style={{
                            fontWeight: 700,
                            marginBottom: 6,
                            color: "#fff",
                          }}
                        >
                          {d.mechanism}
                        </div>
                        <TR
                          label="WISQARS Total"
                          value={fmt.N(d.wisqarsFatal)}
                        />
                        <TR
                          label="Occupational"
                          value={fmt.N(d.occFatal)}
                          color="#5a9eb5"
                        />
                        <TR
                          label="Occ. Share"
                          value={fmt.pct(d.pctOcc)}
                          color="#f0c96a"
                        />
                      </TT>
                    );
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="wisqarsFatal"
                  fill="#2a2a4a"
                  fillOpacity={0.9}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  yAxisId="left"
                  dataKey="occFatal"
                  fill="#5a9eb5"
                  fillOpacity={0.9}
                  radius={[3, 3, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="pctOcc"
                  stroke="#f0c96a"
                  strokeWidth={2}
                  dot={{ fill: "#f0c96a", r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div
            className="card"
            style={{ background: "#0e0d1c", borderColor: "#2a2845" }}
          >
            <div className="card-title" style={{ marginBottom: 10 }}>
              Key Insight
            </div>
            <div style={{ fontSize: 12, color: "#9b9abf", lineHeight: 1.7 }}>
              <span style={{ color: "#f0c96a", fontWeight: 600 }}>
                Contact/Equipment injuries
              </span>{" "}
              are the most occupationally concentrated — ~77% of WISQARS "Struck
              by/against" deaths occur at work, making this a primarily
              occupational hazard. By contrast,{" "}
              <span style={{ color: "#e8855a", fontWeight: 600 }}>
                Drug Poisoning
              </span>{" "}
              and{" "}
              <span style={{ color: "#7c6fcd", fontWeight: 600 }}>
                Suffocation/Suicide
              </span>{" "}
              deaths are overwhelmingly non-occupational (&lt;1% workplace
              share). Transportation and Falls sit in the middle at 2–4% — still
              thousands of preventable workplace deaths annually.
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
    <div
      style={{
        minHeight: "100vh",
        background: "#09090f",
        color: "#e0dff5",
        fontFamily: "'DM Mono', monospace",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&family=Lora:ital,wght@0,400;0,500;1,400;1,500&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:.15; } 50% { opacity:.28; } }
        .ls-fade-1 { animation: fadeUp .7s ease both; animation-delay:.1s; }
        .ls-fade-2 { animation: fadeUp .7s ease both; animation-delay:.35s; }
        .ls-fade-3 { animation: fadeUp .7s ease both; animation-delay:.6s; }
        .ls-fade-4 { animation: fadeUp .7s ease both; animation-delay:.85s; }
        .ls-fade-5 { animation: fadeUp .7s ease both; animation-delay:1.1s; }
        .enter-btn {
          background: transparent;
          border: 1px solid #7c6fcd;
          color: #c8c6ff;
          padding: 13px 36px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: .18em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 4px;
          transition: all .25s;
        }
        .enter-btn:hover { background: #1e1d2e; box-shadow: 0 0 24px rgba(124,111,205,.25); }
        .stat-pill {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 24px;
          background: #0f0f1a;
          border: 1px solid #1a1a2e;
          border-radius: 8px;
          min-width: 140px;
        }
      `}</style>

      {/* Background radial glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 600,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(124,111,205,.07) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "pulse 6s ease-in-out infinite",
        }}
      />

      {/* Eyebrow */}
      <div
        className="ls-fade-1"
        style={{
          fontSize: 10,
          letterSpacing: "0.25em",
          color: "#5a58a0",
          textTransform: "uppercase",
          marginBottom: 28,
        }}
      >
        A Personal & Public Health Story
      </div>

      {/* Headline */}
      <h1
        className="ls-fade-2"
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(28px, 5vw, 52px)",
          color: "#fff",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          textAlign: "center",
          maxWidth: 720,
          marginBottom: 36,
        }}
      >
        The Cost of Getting Sick
        <br />
        <span style={{ color: "#7c6fcd" }}>in America</span>
      </h1>

      {/* Story block — placeholder for your personal words */}
      <div
        className="ls-fade-3"
        style={{
          maxWidth: 620,
          textAlign: "center",
          marginBottom: 44,
          borderLeft: "2px solid #2a2a3a",
          borderRight: "2px solid #2a2a3a",
          padding: "0 32px",
        }}
      >
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: "clamp(14px, 2vw, 17px)",
            lineHeight: 1.85,
            color: "#c0bfef",
            marginBottom: 20,
          }}
        >
          {/* ✏️  YOUR STORY GOES HERE — replace this paragraph with your own words. */}
          My aunt passed away on Saturday, April 13, 2024, after a long battle
          against breast cancer. She was surrounded by her family, including me,
          in her final couple days. She was a survivor of the Khmer Rouge and a
          loving mother. Her doctors gave her as much time as they could after
          the diagnosis.
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.75, color: "#9b9abf" }}>
          {/* ✏️  BRIDGING SENTENCE — connects your story to the data below. */}
          Stories like this one are not rare. Millions of Americans face
          crushing medical costs every year — from cancer, from accidents, from
          conditions that could have been caught sooner. The numbers below are
          an attempt to show the true scale of that burden.
        </p>
      </div>

      {/* Stat pills */}
      <div
        className="ls-fade-4"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
          marginBottom: 48,
        }}
      >
        {[
          { val: "$27.6M", lbl: "ED visits per year", color: "#5a9eb5" },
          { val: "$3.7T", lbl: "total injury cost burden", color: "#e8855a" },
          { val: "220K+", lbl: "fatal injuries annually", color: "#e05c6f" },
          { val: "$240B", lbl: "cancer care cost by 2030", color: "#7c6fcd" },
        ].map((s, i) => (
          <div key={i} className="stat-pill">
            <span
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: s.color,
                marginBottom: 4,
              }}
            >
              {s.val}
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#5a58a0",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                textAlign: "center",
              }}
            >
              {s.lbl}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="ls-fade-5">
        <button className="enter-btn" onClick={onEnter}>
          Explore the Data →
        </button>
      </div>

      {/* Footer note */}
      <div
        className="ls-fade-5"
        style={{
          position: "absolute",
          bottom: 20,
          fontSize: 10,
          color: "#2a2a3a",
          letterSpacing: "0.1em",
        }}
      >
        Sources: CDC WISQARS · BLS CFOI · CDC Chronic Disease Facts · NCI Cancer
        Cost Projections
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("fatal");
  const [showLanding, setShowLanding] = useState(true);

  if (showLanding)
    return <LandingScreen onEnter={() => setShowLanding(false)} />;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09090f",
        color: "#e0dff5",
        fontFamily: "'DM Mono',monospace",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .tab-btn{background:transparent;border:1px solid #2a2a3a;color:#6b6a8f;padding:8px 18px;cursor:pointer;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.08em;transition:all .2s;text-transform:uppercase;}
        .tab-btn:hover{border-color:#5a58a0;color:#c0bfef;}
        .tab-btn.active{background:#1e1d2e;border-color:#7c6fcd;color:#c8c6ff;}
        .pill{background:transparent;border:1px solid #1e1d2e;border-radius:20px;color:#6b6a8f;padding:4px 12px;cursor:pointer;font-family:'DM Mono',monospace;font-size:11px;transition:all .2s;white-space:nowrap;}
        .pill:hover{border-color:#3a3a5a;color:#c0bfef;}
        .pill-on{border-color:#7c6fcd!important;color:#c8c6ff!important;background:#1a192b!important;}
        .stat-card{background:#0f0f1a;border:1px solid #1a1a2e;border-radius:8px;padding:14px 18px;}
        .stat-lbl{font-size:10px;color:#5a58a0;text-transform:uppercase;letter-spacing:.15em;margin-bottom:6px;}
        .stat-val{font-size:22px;font-weight:500;}
        .stat-sub{font-size:11px;margin-top:2px;}
        .card{background:#0c0c15;border:1px solid #1a1a2e;border-radius:10px;padding:20px 16px 14px;}
        .card-title{font-size:11px;color:#5a58a0;text-transform:uppercase;letter-spacing:.12em;margin-bottom:14px;padding-left:4px;}
        .ctrl-lbl{font-size:11px;color:#5a58a0;text-transform:uppercase;letter-spacing:.12em;}
        .sel{background:#0f0f1a;border:1px solid #2a2a3a;color:#c0bfef;padding:5px 8px;font-family:'DM Mono',monospace;font-size:11px;border-radius:4px;cursor:pointer;outline:none;}
        .recharts-cartesian-axis-tick text{font-family:'DM Mono',monospace!important;}
      `}</style>

      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #1a1a2e",
          padding: "24px 40px 0",
          background: "linear-gradient(180deg,#0f0e1a 0%,#09090f 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <button
              onClick={() => setShowLanding(true)}
              style={{
                background: "transparent",
                border: "none",
                color: "#5a58a0",
                fontFamily: "'DM Mono',monospace",
                fontSize: 10,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: "pointer",
                marginBottom: 8,
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ← Back to Story
            </button>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.2em",
                color: "#5a58a0",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Healthcare Cost Analysis · United States
            </div>
            <h1
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: "clamp(22px,4vw,34px)",
                color: "#fff",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Injury Costs in 2023
            </h1>
            <div style={{ fontSize: 11, color: "#5a58a0", marginTop: 6 }}>
              CDC WISQARS · BLS CFOI · 4 integrated data sources
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              ["WISQARS Fatal", "#e05c6f"],
              ["WISQARS Nonfatal", "#e8855a"],
              ["WISQARS ED", "#5a9eb5"],
              ["BLS CFOI", "#8baa7e"],
            ].map(([lbl, c]) => (
              <span
                key={lbl}
                style={{
                  fontSize: 10,
                  padding: "3px 10px",
                  borderRadius: 12,
                  border: `1px solid ${c}40`,
                  color: c,
                  background: c + "10",
                  letterSpacing: "0.08em",
                }}
              >
                {lbl}
              </span>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex" }}>
          {TABS.map((t, i) => (
            <button
              key={t.id}
              className={`tab-btn${tab === t.id ? " active" : ""}`}
              style={{
                borderRadius:
                  i === 0
                    ? "4px 0 0 0"
                    : i === TABS.length - 1
                      ? "0 4px 0 0"
                      : "0",
                borderLeft: i > 0 ? "none" : undefined,
                paddingBottom: tab === t.id ? "11px" : "9px",
                borderBottom:
                  tab === t.id ? "2px solid #7c6fcd" : "1px solid #2a2a3a",
              }}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subtitle strip */}
      <div style={{ padding: "9px 40px", borderBottom: "1px solid #1a1a2e" }}>
        <span style={{ fontSize: 11, color: "#4a4870" }}>
          {TABS.find((t) => t.id === tab)?.subtitle}
        </span>
      </div>

      {/* Panel */}
      <div style={{ padding: "24px 40px 48px" }}>
        {tab === "fatal" && <WisqarsPanel mode="fatal" />}
        {tab === "nonfatal" && <WisqarsPanel mode="nonfatal" />}
        {tab === "ed" && <EDPanel />}
        {tab === "occ" && <OccPanel />}
      </div>

      <div
        style={{
          fontSize: 10,
          color: "#2a2a3a",
          textAlign: "center",
          paddingBottom: 16,
        }}
      >
        Sources: CDC WISQARS 2023 · BLS Census of Fatal Occupational Injuries
        2023 · Combined costs include medical, work-loss, quality-of-life, and
        VSL components
      </div>
    </div>
  );
}
