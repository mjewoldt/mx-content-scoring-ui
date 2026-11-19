import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { scoreColor } from "../utils";
import ScoreCircle from "../components/ScoreCircle";
import DetailPanel from "../components/DetailPanel";
import Multiselect from "../components/Multiselect";

const PAGE_SIZE = 50;

export default function Items() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [panelWidth, setPanelWidth] = useState(500);
  const [expanded, setExpanded] = useState(false);
  const dragRef = useRef(null);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [passing, setPassing] = useState(searchParams.get("passing") || "");
  const [selectedCats, setSelectedCats] = useState(() => {
    const c = searchParams.get("category");
    return c ? new Set(c.split("|")) : new Set();
  });
  const [selectedBrands, setSelectedBrands] = useState(() => {
    const b = searchParams.get("brand");
    return b ? new Set(b.split("|")) : new Set();
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sort, setSort] = useState("composite_score");
  const [dir, setDir] = useState("asc");

  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    api.categories().then(setCategories);
    api.brands().then(setBrands);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const catVal = selectedCats.size ? Array.from(selectedCats).join("|") : "";
    const brandVal = selectedBrands.size ? Array.from(selectedBrands).join("|") : "";
    try {
      const result = await api.items({ page, page_size: PAGE_SIZE, search, sort, dir, category: catVal, brand: brandVal, passing });
      setData(result);
      // Auto-select first item on initial load if nothing is selected yet
      if (result?.items?.length && !selectedItem) {
        const first = result.items[0];
        setDetailLoading(true);
        try {
          const full = await api.item(first.gtin);
          setSelectedItem(full);
        } finally {
          setDetailLoading(false);
        }
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, sort, dir, selectedCats, selectedBrands, passing]);

  useEffect(() => { load(); }, [load]);

  function setPage(p) {
    setSearchParams((prev) => { prev.set("page", p); return prev; });
  }

  function applySearch() {
    setSearchParams((prev) => { search ? prev.set("search", search) : prev.delete("search"); prev.set("page", 1); return prev; });
  }

  function toggleSort(col) {
    if (sort === col) setDir((d) => d === "asc" ? "desc" : "asc");
    else { setSort(col); setDir("asc"); }
  }

  async function selectItem(item) {
    if (selectedItem?.gtin === item.gtin) { setSelectedItem(null); return; }
    setDetailLoading(true);
    try {
      const full = await api.item(item.gtin);
      setSelectedItem(full);
    } finally {
      setDetailLoading(false);
    }
  }

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;
  const hasPanel = selectedItem || detailLoading;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#F0F2F7", paddingTop: 10 }}>

      {/* Left: list */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Filter bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 20px", background: "white",
          borderBottom: "1px solid #E4E8F0", flexShrink: 0,
        }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            placeholder="Search title, GTIN, brand…"
            style={{ flex: 1, minWidth: 0, padding: "9px 14px", border: "1px solid #E4E8F0", borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "inherit", color: "#1A2340" }}
          />
          <button onClick={applySearch} style={{ padding: "9px 20px", background: "#2C3E6B", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, letterSpacing: ".02em" }}>
            Search
          </button>
          <select
            value={passing}
            onChange={(e) => { setPassing(e.target.value); setPage(1); }}
            style={{ padding: "9px 12px", border: "1px solid #E4E8F0", borderRadius: 8, fontSize: 13, background: "white", fontFamily: "inherit", flexShrink: 0, color: "#1A2340" }}
          >
            <option value="">All items</option>
            <option value="Yes">Compliant only</option>
            <option value="No">Non-compliant only</option>
          </select>
          <div style={{ width: 190, flexShrink: 0 }}>
            <Multiselect label="All categories" options={categories} selected={selectedCats} onChange={(s) => { setSelectedCats(s); setPage(1); }} />
          </div>
          <div style={{ width: 170, flexShrink: 0 }}>
            <Multiselect label="All brands" options={brands} selected={selectedBrands} onChange={(s) => { setSelectedBrands(s); setPage(1); }} />
          </div>
        </div>

        {/* Count + sort row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 20px", background: "#F8F9FB",
          borderBottom: "1px solid #E4E8F0", flexShrink: 0,
          fontSize: 12, color: "#7A849C", fontWeight: 500,
        }}>
          <span>{loading ? "Loading…" : `${data?.total?.toLocaleString() ?? 0} items`}</span>
          <div style={{ display: "flex", gap: 16 }}>
            {[["Name", "product_title"], ["Score", "composite_score"]].map(([lbl, col]) => (
              <button
                key={col}
                onClick={() => toggleSort(col)}
                style={{
                  background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 12, fontWeight: sort === col ? 700 : 500,
                  color: sort === col ? "#2C3E6B" : "#7A849C", padding: 0,
                }}
              >
                {lbl} {sort === col ? (dir === "asc" ? "↑" : "↓") : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Item list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data?.items?.map((item) => (
              <ItemRow
                key={item.gtin}
                item={item}
                selected={selectedItem?.gtin === item.gtin}
                onClick={() => selectItem(item)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: "20px 0 8px" }}>
              <button onClick={() => setPage(page - 1)} disabled={page <= 1} style={pageBtnStyle}>‹ Prev</button>
              <span style={{ fontSize: 12, color: "#4A5568" }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} style={pageBtnStyle}>Next ›</button>
            </div>
          )}
        </div>
      </div>

      {/* Right: detail panel */}
      {hasPanel && (
        <div style={{
          width: expanded ? "calc(100vw - 340px)" : panelWidth,
          flexShrink: 0, borderLeft: "1px solid #DDE2EF",
          display: "flex", flexDirection: "column", overflow: "hidden",
          position: "relative", transition: expanded ? "width .2s ease" : "none",
          background: "white",
        }}>
          {/* Drag handle */}
          <div
            style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, cursor: "col-resize", zIndex: 10 }}
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startW = panelWidth;
              function onMove(ev) {
                setPanelWidth(Math.max(360, Math.min(900, startW + (startX - ev.clientX))));
                setExpanded(false);
              }
              function onUp() {
                document.removeEventListener("mousemove", onMove);
                document.removeEventListener("mouseup", onUp);
              }
              document.addEventListener("mousemove", onMove);
              document.addEventListener("mouseup", onUp);
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,91,219,.35)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          />
          {detailLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "#4A5568", fontSize: 13 }}>Loading…</div>
          ) : (
            <DetailPanel
              item={selectedItem}
              expanded={expanded}
              onToggleExpand={() => setExpanded((v) => !v)}
              onClose={() => { setSelectedItem(null); setExpanded(false); }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ItemRow({ item, selected, onClick }) {
  const sc = item.compositeScore;
  const barColor = scoreColor(sc);

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "14px 18px",
        background: selected ? "#EEF2FF" : "white",
        border: `1px solid ${selected ? "#2C3E6B" : "#E4E8F0"}`,
        borderLeft: selected ? "4px solid #2C3E6B" : "4px solid transparent",
        borderRadius: 10,
        cursor: "pointer",
        boxShadow: selected ? "0 2px 8px rgba(44,62,107,.12)" : "0 1px 3px rgba(0,0,0,.04)",
        transition: "box-shadow .15s, border-color .15s",
      }}
      onMouseEnter={(e) => { if (!selected) { e.currentTarget.style.boxShadow = "0 2px 8px rgba(44,62,107,.08)"; e.currentTarget.style.borderColor = "#C5D3F7"; } }}
      onMouseLeave={(e) => { if (!selected) { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.04)"; e.currentTarget.style.borderColor = "#E4E8F0"; } }}
    >
      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2340", lineHeight: 1.4, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.productTitle || "—"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#4A5568" }}>{item.brand}</span>
          <span style={{ fontSize: 12, color: "#C8D0DC" }}>·</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: "#7A849C", fontVariantNumeric: "tabular-nums" }}>{item.gtin}</span>
          {item.contentStandardsCategory && (
            <span style={{ background: "#F0F2F7", color: "#4A5568", padding: "2px 8px", borderRadius: 10, fontWeight: 600, fontSize: 10, letterSpacing: ".03em" }}>
              {item.contentStandardsCategory}
            </span>
          )}
        </div>
      </div>

      {/* Score bar + circle */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, width: 140 }}>
        <div style={{ flex: 1, background: "#E8ECF4", borderRadius: 4, height: 5, overflow: "hidden" }}>
          <div style={{ width: `${sc ?? 0}%`, height: "100%", background: barColor, borderRadius: 4 }} />
        </div>
        <ScoreCircle score={sc} size={36} fontSize={12} />
      </div>
    </div>
  );
}

const pageBtnStyle = {
  padding: "6px 16px", border: "1px solid #DDE2EF", borderRadius: 7,
  background: "white", fontSize: 12, cursor: "pointer", color: "#2C3454", fontFamily: "inherit",
};
