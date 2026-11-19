export default function KpiCard({ label, value, color, sub }) {
  return (
    <div style={{
      background: "white",
      border: "1px solid #E4E8F0",
      borderLeft: `4px solid ${color}`,
      borderRadius: 12,
      padding: "22px 24px",
      display: "flex", flexDirection: "column", gap: 6,
      boxShadow: "0 1px 4px rgba(0,0,0,.04)",
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#7A849C", textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#1A2340", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, fontWeight: 500, color: "#7A849C" }}>{sub}</div>}
    </div>
  );
}
