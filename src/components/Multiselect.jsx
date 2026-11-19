import { useState, useRef, useEffect } from "react";
import { scoreColor } from "../utils";

export default function Multiselect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(name) {
    const next = new Set(selected);
    next.has(name) ? next.delete(name) : next.add(name);
    onChange(next);
  }

  function selectAll() {
    onChange(new Set(filtered.map((o) => o.name)));
  }

  function clear() {
    const next = new Set(selected);
    filtered.forEach((o) => next.delete(o.name));
    onChange(next);
  }

  const triggerLabel =
    selected.size === 0 ? label
    : selected.size === 1 ? Array.from(selected)[0]
    : `${selected.size} selected`;

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "10px 14px",
          border: `1px solid ${selected.size > 0 ? "#3B5BDB" : "#DDE2EF"}`,
          borderRadius: 8, background: selected.size > 0 ? "#EBF0FF" : "white",
          cursor: "pointer", fontSize: 13, color: "#2C3454",
          fontFamily: "inherit", fontWeight: selected.size > 0 ? 600 : 400,
        }}
      >
        <span>{triggerLabel}</span>
        <span style={{ transform: open ? "rotate(180deg)" : "none", transition: ".15s" }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "white", border: "1px solid #DDE2EF", borderRadius: 8,
          boxShadow: "0 6px 24px rgba(0,0,0,.12)", zIndex: 300,
          display: "flex", flexDirection: "column", maxHeight: 300,
        }}>
          <div style={{ padding: "8px 10px", borderBottom: "1px solid #DDE2EF", flexShrink: 0 }}>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search…`}
              style={{
                width: "100%", border: "1px solid #DDE2EF", borderRadius: 6,
                padding: "5px 8px", fontSize: 12, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{
            display: "flex", gap: 6, padding: "5px 10px",
            borderBottom: "1px solid #DDE2EF", flexShrink: 0,
          }}>
            <button onClick={selectAll} style={actionBtn}>Select All</button>
            <button onClick={clear} style={actionBtn}>Clear</button>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.map((o) => (
              <label key={o.name} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 12px", cursor: "pointer",
                background: selected.has(o.name) ? "#F0F4FF" : "white",
              }}>
                <input
                  type="checkbox"
                  checked={selected.has(o.name)}
                  onChange={() => toggle(o.name)}
                  style={{ accentColor: "#3B5BDB", flexShrink: 0 }}
                />
                <span style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{o.name}</span>
                <span style={{ fontSize: 11, color: "#4A5568", whiteSpace: "nowrap" }}>
                  <span style={{ color: scoreColor(o.avgScore), fontWeight: 700 }}>{o.avgScore}</span>
                  {" · "}{o.count}
                </span>
              </label>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: 12, fontSize: 12, color: "#4A5568", textAlign: "center" }}>No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const actionBtn = {
  padding: "2px 10px", border: "1px solid #DDE2EF", borderRadius: 5,
  background: "white", fontSize: 11, cursor: "pointer", color: "#4A5568", fontWeight: 500,
};
