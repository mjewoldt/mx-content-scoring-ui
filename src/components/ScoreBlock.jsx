import { useState } from "react";
import { scoreClass, shortLabel, isPassCheck, splitPipe } from "../utils";

const COLOR = { pass: "#0A7E41", warn: "#FF6B00", fail: "#C0002A", muted: "#4A5568" };
const BG    = { pass: "#E8F5E9", warn: "#FFF3E0", fail: "#FFEBEE", neutral: "#F5F5F5" };
const BORDER= { pass: "#C8E6C9", warn: "#FFCC80", fail: "#FFCDD2", neutral: "#DDD" };
const BTEXT = { pass: "#2E7D32", warn: "#E65100", fail: "#C62828", neutral: "#555" };

function Chip({ text, type = "fail" }) {
  const icon = type === "pass" ? "✓" : type === "fail" ? "✗" : "!";
  return (
    <span style={{
      display: "inline-flex", alignItems: "flex-start", gap: 4,
      fontSize: 11, fontWeight: 600, padding: "3px 9px 3px 7px",
      borderRadius: 12, lineHeight: 1.35, border: `1px solid ${BORDER[type] || BORDER.neutral}`,
      background: BG[type] || BG.neutral, color: BTEXT[type] || BTEXT.neutral,
      whiteSpace: "normal",
    }}>
      <span style={{ fontSize: 12, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
      {text}
    </span>
  );
}

export default function ScoreBlock({ score, weight, issues = [], suggestions = [], extras = [], missing, guideline }) {
  const [showGuideline, setShowGuideline] = useState(false);
  const sc = scoreClass(score || 0);

  const passIssues = (issues || []).filter((t) => isPassCheck(t));
  const failItems  = (issues || []).filter((t) => !isPassCheck(t));

  const missingKws = missing
    ? missing.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  const hasAnything = extras.length || failItems.length || missingKws.length;

  return (
    <div style={{ background: "#F8F9FB", border: "1px solid #DDE2EF", borderRadius: 8, padding: "10px 12px", marginTop: 8 }}>
      {/* Score row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#4A5568", flex: 1 }}>Score</span>
        {weight && <span style={{ fontSize: 10, color: "#4A5568" }}>{weight}</span>}
        <span style={{
          padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700,
          color: "white", background: COLOR[sc],
        }}>{score || 0}/100</span>
      </div>

      {/* Bar */}
      <div style={{ background: "#E8EAF0", borderRadius: 4, height: 8, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ width: `${score || 0}%`, height: "100%", background: COLOR[sc], borderRadius: 4 }} />
      </div>

      {/* Chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {passIssues.length > 0 && (
          <div style={{ width: "100%", fontSize: 10, fontWeight: 600, color: "#0A7E41", marginBottom: 4 }}>
            ✓ {passIssues.length} check{passIssues.length > 1 ? "s" : ""} passed
            {failItems.length > 0 && ` · ${failItems.length} issue${failItems.length > 1 ? "s" : ""} below`}
          </div>
        )}
        {extras.map((ex, i) => (
          <Chip key={i} text={ex.label} type={ex.good ? "pass" : ex.bad ? "fail" : "neutral"} />
        ))}
        {failItems.map((iss, i) => (
          <Chip key={i} text={shortLabel(iss)} type="fail" />
        ))}
        {missingKws.map((kw, i) => (
          <Chip key={i} text={`Missing: ${kw}`} type="fail" />
        ))}
        {!hasAnything && (
          <Chip text="Meets guidelines" type="pass" />
        )}
      </div>

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div style={{ marginTop: 8, background: "#EBF0FF", border: "1px solid #C5D3F7", borderRadius: 6, padding: "7px 10px" }}>
          {suggestions.map((s, i) => (
            <div key={i} style={{ fontSize: 11, color: "#1A3080", lineHeight: 1.4, marginBottom: i < suggestions.length - 1 ? 3 : 0 }}>
              → {s}
            </div>
          ))}
        </div>
      )}

      {/* Guideline toggle */}
      {guideline && (
        <div style={{ marginTop: 10, borderTop: "1px solid #E8ECF4", paddingTop: 8 }}>
          <button
            onClick={() => setShowGuideline((v) => !v)}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              fontSize: 11, fontWeight: 600, color: "#3B5BDB", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <span style={{ fontSize: 13 }}>{showGuideline ? "▾" : "▸"}</span>
            {showGuideline ? "Hide guideline" : "View guideline"}
          </button>
          {showGuideline && (
            <div style={{
              marginTop: 8, padding: "10px 12px",
              background: "#FFFBEC", border: "1px solid #F5D89A",
              borderLeft: "3px solid #FF6B00", borderRadius: 6,
              fontSize: 11, color: "#4A5568", lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".6px", color: "#7A4800", marginBottom: 5 }}>
                DCM Guideline
              </div>
              {guideline}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
