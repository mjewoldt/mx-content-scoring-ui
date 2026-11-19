import { scoreColor } from "../utils";

export default function ScoreBar({ score, height = 6 }) {
  const color = scoreColor(score);
  return (
    <div style={{ background: "#E8ECF4", borderRadius: 3, height, overflow: "hidden" }}>
      <div style={{
        width: `${score ?? 0}%`, height: "100%",
        background: color, borderRadius: 3, transition: "width .3s",
      }} />
    </div>
  );
}
