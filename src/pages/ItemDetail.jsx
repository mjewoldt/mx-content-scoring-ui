import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { scoreColor, scoreLabel, failIssues, splitPipe } from "../utils";
import ScoreCircle from "../components/ScoreCircle";
import ScoreBar from "../components/ScoreBar";

export default function ItemDetail() {
  const { gtin } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.item(gtin)
      .then(setItem)
      .catch(() => setError("Item not found"))
      .finally(() => setLoading(false));
  }, [gtin]);

  if (loading) return <div style={{ padding: 40, color: "#4A5568" }}>Loading…</div>;
  if (error) return <div style={{ padding: 40, color: "#C0002A" }}>{error}</div>;
  if (!item) return null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 32px" }}>
      <button onClick={() => navigate(-1)} style={{
        fontSize: 12, color: "#4A5568", background: "none", border: "none",
        cursor: "pointer", marginBottom: 16, padding: 0,
      }}>← Back</button>

      {/* Header */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 28 }}>
        {item.imageUrl && (
          <img src={item.imageUrl} alt="" style={{
            width: 100, height: 100, objectFit: "contain",
            border: "1px solid #DDE2EF", borderRadius: 8, flexShrink: 0,
          }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#2C3454", lineHeight: 1.3, marginBottom: 6 }}>
            {item.productTitle}
          </div>
          <div style={{ fontSize: 12, color: "#4A5568" }}>
            {item.brand}{item.subBrand ? ` · ${item.subBrand}` : ""} · GTIN {item.gtin}
          </div>
          {item.contentStandardsCategory && (
            <span style={{
              display: "inline-block", marginTop: 6, background: "#EBF0FF",
              color: "#3B5BDB", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
            }}>{item.contentStandardsCategory}</span>
          )}
          <div style={{ fontSize: 11, color: "#4A5568", marginTop: 4 }}>
            {item.commodity} · {item.subCommodity}
          </div>
        </div>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <ScoreCircle score={item.compositeScore} size={64} fontSize={22} />
          <div style={{ fontSize: 11, color: scoreColor(item.compositeScore), fontWeight: 600, marginTop: 4 }}>
            {scoreLabel(item.compositeScore)}
          </div>
        </div>
      </div>

      {/* Score grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Product Title", score: item.titleScore, issues: failIssues(item.titleIssues), suggestions: splitPipe(item.titleSuggestions), guideline: item.titleGuideline },
          { label: "Customer Facing Size", score: item.sizeScore, issues: failIssues(item.sizeIssues), suggestions: [], guideline: item.sizeGuideline },
          { label: "Product Description", score: item.descLongScore, issues: failIssues(item.longDescIssues), suggestions: splitPipe(item.longDescSuggestions), guideline: item.longDescGuideline },
          { label: "Features & Bullets", score: item.descBulletScore, issues: failIssues(item.bulletIssues), suggestions: splitPipe(item.bulletSuggestions), guideline: item.bulletGuideline },
          { label: "Images", score: item.imageScore, issues: failIssues(item.imageIssues), suggestions: splitPipe(item.imageSuggestions), guideline: item.imageGuidelines },
          { label: "Keywords / SEO", score: item.keywordScore, issues: failIssues(item.keywordsMissing), suggestions: splitPipe(item.aiKeywordRecommendations), guideline: null },
        ].map((s) => (
          <ScoreSection key={s.label} {...s} />
        ))}
      </div>

      {/* Customer Facing Size */}
      {item.customerFacingSize && (
        <InfoRow label="Customer Facing Size" value={item.customerFacingSize} />
      )}
    </div>
  );
}

function ScoreSection({ label, score, issues, suggestions, guideline }) {
  const [showGuide, setShowGuide] = useState(false);
  return (
    <div style={{
      background: "white", border: "1px solid #DDE2EF", borderRadius: 10, padding: "14px 16px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#2C3454" }}>{label}</div>
        <ScoreCircle score={score} size={32} fontSize={11} />
      </div>
      <ScoreBar score={score} height={6} />
      <div style={{ marginTop: 10 }}>
        {issues.length === 0 ? (
          <div style={{ fontSize: 11, color: "#0A7E41", fontWeight: 600 }}>✓ No issues found</div>
        ) : (
          issues.map((issue, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
              <span style={{ color: "#C0002A", fontSize: 11, flexShrink: 0 }}>✗</span>
              <span style={{ fontSize: 11, color: "#2C3454" }}>{issue}</span>
            </div>
          ))
        )}
      </div>
      {suggestions.length > 0 && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #F0F4FF" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#4A5568", textTransform: "uppercase", marginBottom: 4 }}>Suggestions</div>
          {suggestions.map((s, i) => (
            <div key={i} style={{ fontSize: 11, color: "#3B5BDB", marginBottom: 2 }}>→ {s}</div>
          ))}
        </div>
      )}
      {guideline && (
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => setShowGuide((v) => !v)}
            style={{ fontSize: 10, color: "#4A5568", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
          >
            {showGuide ? "Hide" : "View"} guideline
          </button>
          {showGuide && (
            <div style={{ marginTop: 6, padding: "8px 10px", background: "#F8F9FF", borderRadius: 6, fontSize: 11, color: "#4A5568", lineHeight: 1.5 }}>
              {guideline}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", borderTop: "1px solid #DDE2EF" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#4A5568", width: 180, flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 12, color: "#2C3454" }}>{value}</div>
    </div>
  );
}
