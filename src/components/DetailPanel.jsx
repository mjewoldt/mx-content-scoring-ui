import { useRef } from "react";
import { scoreClass, scoreLabel, scoreColor, splitPipe, failIssues, krogerUrl } from "../utils";
import ScoreBlock from "./ScoreBlock";

const BORDER_COLOR  = { pass: "#0A7E41", warn: "#FF6B00", fail: "#C0002A" };
const HEADER_BG     = { pass: "#EBF7EF", warn: "#FFF3E0", fail: "#FDECEA" };
const HEADER_BORDER = { pass: "#C8E6C9", warn: "#FFCC80", fail: "#FFCDD2" };

function Section({ id, title, weight, score, children }) {
  const sc = scoreClass(score);
  const color = BORDER_COLOR[sc] || "#4A5568";
  const headerBg = HEADER_BG[sc] || "#F5F7FB";
  const headerBorder = HEADER_BORDER[sc] || "#DDE2EF";

  return (
    <div
      id={id}
      style={{
        marginBottom: 20,
        borderRadius: 10,
        border: `1px solid ${headerBorder}`,
        borderLeft: `4px solid ${color}`,
        background: "white",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,.05)",
      }}
    >
      {/* Section header — tinted by status */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px",
        background: headerBg,
        borderBottom: `1px solid ${headerBorder}`,
      }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#2C3454" }}>{title}</span>
          {weight && <span style={{ fontSize: 11, color: "#4A5568", marginLeft: 7 }}>{weight}</span>}
        </div>
        {score != null && (
          <div style={{
            padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 800,
            color: "white", background: color, letterSpacing: ".3px",
          }}>
            {score}
          </div>
        )}
      </div>

      {/* Section body — always white */}
      <div style={{ padding: "14px 16px" }}>
        {children}
      </div>
    </div>
  );
}

export default function DetailPanel({ item, onClose, onToggleExpand, expanded }) {
  if (!item) return null;

  const bodyRef = useRef(null);

  const sc = scoreClass(item.compositeScore);
  const heroUrl = item.imageUrl || "";
  const kUrl = krogerUrl(item.gtin, item.productTitle);

  let parsedDesc = "", parsedBullets = [];
  if (item.marketingMessage) {
    const tmp = document.createElement("div");
    tmp.innerHTML = item.marketingMessage;
    tmp.querySelectorAll("p").forEach((p) => { const t = p.textContent.trim(); if (t) parsedDesc += (parsedDesc ? "\n\n" : "") + t; });
    tmp.querySelectorAll("li").forEach((li) => { const t = li.textContent.trim(); if (t) parsedBullets.push(t); });
  }

  const allDescIssues = splitPipe(item.descIssues);
  const longIssues = failIssues(item.longDescIssues || (allDescIssues.filter((s) => !/bullet/i.test(s)).join("|")));
  const longSugs = splitPipe(item.longDescSuggestions);
  const bulletIssues = failIssues(item.bulletIssues || (allDescIssues.filter((s) => /bullet/i.test(s)).join("|")));
  const bulletSugs = splitPipe(item.bulletSuggestions);

  const imgChecks = [
    { label: "Front facing",       pass: item.imageFrontFacing === "True",   fail: item.imageFrontFacing === "False" },
    { label: "White/transp. bg",   pass: item.imageWhiteBg === "True",       fail: item.imageWhiteBg === "False" },
    { label: "Meets category req", pass: item.imageMeetsCategory === "True", fail: item.imageMeetsCategory === "False" },
  ];
  const allPass = imgChecks.every((c) => c.pass);
  const anyFail = imgChecks.some((c) => c.fail);
  const heroColor = BORDER_COLOR[allPass ? "pass" : anyFail ? "fail" : "warn"];

  const hasDcmKw = item.dcmKeywords && item.dcmKeywords.trim().length > 0;
  const aiKws = item.aiKeywordRecommendations
    ? item.aiKeywordRecommendations.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  // Score summary sections for the quick-nav strip
  const sections = [
    { id: "dp-title",   label: "Title",       score: item.titleScore },
    { id: "dp-size",    label: "Size",         score: item.sizeScore },
    { id: "dp-desc",    label: "Description",  score: item.descLongScore },
    { id: "dp-bullets", label: "Bullets",      score: item.descBulletScore },
    { id: "dp-images",  label: "Images",       score: item.imageScore },
    { id: "dp-kw",      label: "Keywords",     score: item.keywordScore },
  ];

  function scrollTo(id) {
    const el = bodyRef.current?.querySelector(`#${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "white" }}>

      {/* Item header */}
      <div style={{ background: "#2C3E6B", color: "white", padding: "18px 20px", flexShrink: 0, position: "relative", borderBottom: "3px solid #4D7CFE" }}>
        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
          <button onClick={onToggleExpand} title={expanded ? "Collapse" : "Expand"} style={headerBtn}>{expanded ? "⟨" : "⟩"}</button>
          <button onClick={onClose} title="Close" style={headerBtn}>×</button>
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.35, paddingRight: 76, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.productTitle || "—"}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.65)", marginBottom: 12 }}>
          {[item.gtin, item.brand, item.subBrand].filter(Boolean).join(" · ")}
          {item.contentStandardsCategory && (
            <span style={{ marginLeft: 8, background: "rgba(255,255,255,.15)", padding: "1px 7px", borderRadius: 10, fontWeight: 600 }}>
              {item.contentStandardsCategory}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 20, fontWeight: 700, color: "white",
            flexShrink: 0, border: "3px solid rgba(255,255,255,.3)", background: scoreColor(item.compositeScore),
          }}>
            {item.compositeScore}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: sc === "pass" ? "#A5D6A7" : sc === "warn" ? "#FFCC80" : "#EF9A9A" }}>
              {scoreLabel(item.compositeScore)}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", marginTop: 3 }}>
              Composite score · Threshold: 90 to pass
            </div>
          </div>
        </div>
      </div>

      {/* Quick-nav score strip */}
      <div style={{
        display: "flex", gap: 6, padding: "10px 14px", flexShrink: 0,
        background: "#F8F9FB", borderBottom: "1px solid #DDE2EF",
        overflowX: "auto",
      }}>
        {sections.map((s) => {
          const ssc = scoreClass(s.score);
          const col = BORDER_COLOR[ssc] || "#4A5568";
          return (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              title={`Jump to ${s.label}`}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "6px 10px", borderRadius: 8, border: `1px solid ${col}20`,
                background: `${col}10`, cursor: "pointer", flexShrink: 0,
                fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: col, lineHeight: 1 }}>
                {s.score ?? "—"}
              </span>
              <span style={{ fontSize: 9, fontWeight: 600, color: "#4A5568", textTransform: "uppercase", letterSpacing: ".4px" }}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hero image row */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 16px", background: "white", borderBottom: "1px solid #DDE2EF", flexShrink: 0 }}>
        {heroUrl ? (
          <img src={heroUrl} alt="" onClick={() => window.open(heroUrl, "_blank")}
            style={{ width: 100, height: 100, objectFit: "contain", border: "1px solid #DDE2EF", borderRadius: 8, background: "white", flexShrink: 0, cursor: "pointer" }}
            onError={(e) => { e.target.style.opacity = "0.25"; }}
          />
        ) : (
          <div style={{ width: 100, height: 100, border: "1px dashed #DDE2EF", borderRadius: 8, background: "#F8F9FB", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#4A5568", fontSize: 11 }}>No image</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".6px", color: "#4A5568", marginBottom: 3 }}>GTIN: {item.gtin}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2C3454", lineHeight: 1.4, marginBottom: 8 }}>{item.productTitle || "—"}</div>
          {kUrl ? (
            <a href={kUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#3B5BDB", textDecoration: "none", border: "1px solid #3B5BDB", borderRadius: 5, padding: "4px 10px", fontWeight: 600 }}>
              🔗 View on Kroger.com
            </a>
          ) : (
            <span style={{ fontSize: 11, color: "#4A5568", fontStyle: "italic" }}>Product URL unavailable</span>
          )}
          <div style={{ fontSize: 10, color: "#4A5568", marginTop: 5 }}>{item.commodity} · {item.subCommodity}</div>
        </div>
      </div>

      {/* Scrollable body */}
      <div ref={bodyRef} style={{ flex: 1, overflowY: "auto", padding: "16px 16px 32px" }}>

        <Section id="dp-title" title="Product Title" weight="20%" score={item.titleScore}>
          <div style={{ fontSize: 12, color: "#2C3454", lineHeight: 1.5, marginBottom: 10 }}>{item.productTitle || "—"}</div>
          <ScoreBlock score={item.titleScore} weight="20%" issues={splitPipe(item.titleIssues)} suggestions={splitPipe(item.titleSuggestions)} guideline={item.titleGuideline} />
        </Section>

        <Section id="dp-size" title="Customer Facing Size" weight="10%" score={item.sizeScore}>
          <div style={{ fontSize: 12, color: "#2C3454", lineHeight: 1.5, marginBottom: 10 }}>{item.customerFacingSize || "—"}</div>
          <ScoreBlock score={item.sizeScore} weight="10%" issues={splitPipe(item.sizeIssues)} guideline={item.sizeGuideline} />
        </Section>

        <Section id="dp-desc" title="Product Description" weight="15%" score={item.descLongScore}>
          {parsedDesc ? (
            <div style={{ background: "white", border: "1px solid #DDE2EF", borderRadius: 8, padding: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#2C3454", lineHeight: 1.6, whiteSpace: "pre-line" }}>{parsedDesc}</div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#4A5568", fontStyle: "italic", marginBottom: 10 }}>No description available</div>
          )}
          <ScoreBlock score={item.descLongScore} weight="15%" issues={longIssues} suggestions={longSugs}
            extras={item.charCount ? [{ label: `Chars: ${item.charCount}` }] : []} guideline={item.longDescGuideline} />
        </Section>

        <Section id="dp-bullets" title="Feature / Benefit Bullets" weight="10%" score={item.descBulletScore}>
          {parsedBullets.length > 0 ? (
            <div style={{ background: "white", border: "1px solid #DDE2EF", borderRadius: 8, padding: 12, marginBottom: 10 }}>
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {parsedBullets.map((b, i) => (
                  <li key={i} style={{ fontSize: 12, lineHeight: 1.6, color: "#2C3454", marginBottom: 4 }}>{b}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#4A5568", fontStyle: "italic", marginBottom: 10 }}>No bullets available</div>
          )}
          <ScoreBlock score={item.descBulletScore} weight="10%" issues={bulletIssues} suggestions={bulletSugs}
            extras={item.bulletCount != null ? [{ label: `Bullets: ${item.bulletCount}` }] : []} guideline={item.bulletGuideline} />
        </Section>

        <Section id="dp-images" title="Images" weight="30%" score={item.imageScore}>
          {heroUrl ? (
            <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "4px 0 12px" }}>
              <div style={{ display: "flex", flexDirection: "column", width: 120, flexShrink: 0 }}>
                <div style={{ display: "flex", height: 112 }}>
                  <img src={heroUrl} alt="Hero"
                    style={{ flex: 1, minWidth: 0, border: "1px solid #DDE2EF", borderRadius: 6, objectFit: "contain", background: "white", cursor: "pointer" }}
                    onClick={() => window.open(heroUrl, "_blank")}
                    onError={(e) => { e.target.style.opacity = "0.25"; }}
                  />
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#2C3454", marginTop: 5 }}>Hero Image</div>
                {imgChecks.map((c, i) => (
                  <div key={i} style={{ fontSize: 9, fontWeight: 600, color: c.pass ? "#0A7E41" : c.fail ? "#C0002A" : "#4A5568", marginTop: 2 }}>
                    {c.pass ? "✓" : c.fail ? "✗" : "–"} {c.label}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ width: 120, height: 120, border: "1px dashed #DDE2EF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#4A5568", fontSize: 11, marginBottom: 10 }}>No image</div>
          )}
          <ScoreBlock score={item.imageScore} weight="30%" issues={splitPipe(item.imageIssues)} suggestions={splitPipe(item.imageSuggestions)} guideline={item.imageGuidelines} />
        </Section>

        <Section id="dp-kw" title="Keywords / SEO" weight="10%" score={hasDcmKw ? item.keywordScore : null}>
          {hasDcmKw ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
              {item.dcmKeywords.split(",").map((k) => k.trim()).filter(Boolean).map((kw, i) => (
                <span key={i} style={{ fontSize: 10, background: "#FFF3E0", border: "1px solid #FFB74D", borderRadius: 4, padding: "1px 6px", color: "#7A4800" }}>{kw}</span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#4A5568", fontStyle: "italic", marginBottom: 10 }}>
              No DCM keywords specified for this category.
            </div>
          )}
          {aiKws.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "#6A1B9A", marginBottom: 5 }}>✨ AI Recommended (not DCM-approved)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {aiKws.map((kw, i) => (
                  <span key={i} style={{ fontSize: 10, background: "#F3E5F5", border: "1px solid #CE93D8", borderRadius: 4, padding: "1px 6px", color: "#6A1B9A" }}>{kw}</span>
                ))}
              </div>
            </div>
          )}
          {!hasDcmKw ? (
            <div style={{ padding: "8px 10px", background: "#FFF3E0", border: "1px solid #FFCC80", borderRadius: 8, fontSize: 11, fontWeight: 600, color: "#E65100" }}>
              ! DCM must add keywords for this category before scoring is possible
            </div>
          ) : (
            <ScoreBlock score={item.keywordScore} weight="10%" missing={item.keywordsMissing} guideline={`Required keywords: ${item.dcmKeywords}`} />
          )}
        </Section>

      </div>
    </div>
  );
}

const headerBtn = {
  background: "rgba(255,255,255,.15)", border: "none", color: "white",
  width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
  fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
  fontFamily: "inherit",
};
