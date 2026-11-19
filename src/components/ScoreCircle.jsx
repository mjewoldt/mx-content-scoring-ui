import { scoreColor } from "../utils";

export default function ScoreCircle({ score, size = 38, fontSize = 13 }) {
  const bg = scoreColor(score);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize, fontWeight: 700,
      color: "white", flexShrink: 0,
    }}>
      {score ?? "—"}
    </div>
  );
}
