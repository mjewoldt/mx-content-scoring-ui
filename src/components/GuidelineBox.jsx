export default function GuidelineBox({ label, children }) {
  return (
    <div style={{
      background: "#FFFBEC", border: "1px solid #F5D89A",
      borderLeft: "3px solid #FF6B00", borderRadius: 7,
      padding: "10px 12px", marginBottom: 10,
      fontSize: 11.5, lineHeight: 1.55,
    }}>
      {label && (
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".6px", color: "#7A4800", marginBottom: 5 }}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
