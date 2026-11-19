import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { scoreColor } from "../utils";
import KpiCard from "../components/KpiCard";
import ScoreBar from "../components/ScoreBar";
import Multiselect from "../components/Multiselect";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCats, setSelectedCats] = useState(new Set());
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    api.stats().then(setStats);
    api.categories().then(setCategories);
    api.brands().then(setBrands);
  }, []);

  function handleView() {
    const params = new URLSearchParams();
    if (selectedCats.size) params.set("category", Array.from(selectedCats).join("|"));
    if (selectedBrands.size) params.set("brand", Array.from(selectedBrands).join("|"));
    navigate(`/items?${params}`);
  }

  const hasSelection = selectedCats.size > 0 || selectedBrands.size > 0;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#F0F2F7" }}>

      {/* Left sidebar — Browse */}
      <div style={{
        width: 288, flexShrink: 0,
        background: "white", borderRight: "1px solid #E4E8F0",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
      }}>
        <div style={{ padding: "28px 24px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7A849C", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>
            Browse Items
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#1A2340", lineHeight: 1.2 }}>
            Filter by category or brand
          </div>
        </div>

        <div style={{ padding: "0 24px 32px", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7A849C", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".07em" }}>Category</div>
            <Multiselect
              label="Select categories…"
              options={categories}
              selected={selectedCats}
              onChange={setSelectedCats}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7A849C", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".07em" }}>Brand</div>
            <Multiselect
              label="Select brands…"
              options={brands}
              selected={selectedBrands}
              onChange={setSelectedBrands}
            />
          </div>

          {hasSelection && (
            <div style={{ fontSize: 12, fontWeight: 500, color: "#4A5568", background: "#F4F6FB", borderRadius: 8, padding: "8px 12px", lineHeight: 1.5 }}>
              {[selectedCats.size && `${selectedCats.size} categor${selectedCats.size === 1 ? "y" : "ies"}`,
                selectedBrands.size && `${selectedBrands.size} brand${selectedBrands.size === 1 ? "" : "s"}`]
                .filter(Boolean).join(" + ")} selected
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={handleView}
              disabled={!hasSelection}
              style={{
                padding: "12px 0", borderRadius: 8, border: "none",
                background: hasSelection ? "#2C3E6B" : "#E4E8F0",
                color: hasSelection ? "white" : "#7A849C",
                fontSize: 13, fontWeight: 700, cursor: hasSelection ? "pointer" : "default",
                width: "100%", letterSpacing: ".02em",
              }}
            >
              View Selected Items
            </button>
            <button
              onClick={() => navigate("/items")}
              style={{
                padding: "12px 0", borderRadius: 8,
                border: "1px solid #E4E8F0", background: "white",
                fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#2C3454",
                width: "100%",
              }}
            >
              View All Items
            </button>
          </div>
        </div>
      </div>

      {/* Right — KPIs + compliance */}
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px" }}>

        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7A849C", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Overview</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1A2340" }}>Content Scoring Dashboard</h1>
        </div>

        {/* KPI Cards */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 40 }}>
            <KpiCard label="Total UPCs" value={stats.total.toLocaleString()} color="#3B5BDB" />
            <KpiCard
              label="Avg Content Score"
              value={`${stats.avgScore}%`}
              color={scoreColor(stats.avgScore)}
            />
            <KpiCard
              label="Compliant (≥90%)"
              value={stats.passing.toLocaleString()}
              color="#0A7E41"
              sub={`${stats.pctPassing}% of total`}
            />
            <KpiCard
              label="Non-Compliant (<90%)"
              value={stats.failing.toLocaleString()}
              color="#C0002A"
              sub={`${100 - stats.pctPassing}% of total`}
            />
          </div>
        )}

        {/* Compliance by Type */}
        {stats && (
          <div style={{ background: "white", border: "1px solid #E4E8F0", borderRadius: 14, padding: "28px 32px", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7A849C", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Breakdown</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1A2340", marginBottom: 28 }}>Guideline Compliance by Type</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {stats.compliance.map((c) => (
                <div key={c.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#1A2340" }}>{c.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: scoreColor(c.avg) }}>{c.avg}</span>
                  </div>
                  <ScoreBar score={c.avg} height={8} />
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#7A849C", marginTop: 6 }}>
                    {c.pctPassing}% passing · {c.scored.toLocaleString()} items scored
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
