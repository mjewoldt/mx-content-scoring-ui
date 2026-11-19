import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Items from "./pages/Items";

function Nav() {
  const navigate = useNavigate();
  return (
    <nav style={{
      display: "flex", alignItems: "center",
      background: "#1E2847", padding: "0 28px", height: 56, flexShrink: 0,
      borderBottom: "1px solid rgba(255,255,255,.08)",
    }}>
      <div
        onClick={() => navigate("/")}
        style={{ fontSize: 14, fontWeight: 800, color: "white", marginRight: 40, cursor: "pointer", letterSpacing: ".2px" }}
      >
        Kroger Content Scoring
      </div>
      {[
        { to: "/", label: "Dashboard", end: true },
        { to: "/items", label: "Items" },
      ].map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          style={({ isActive }) => ({
            padding: "0 18px", height: 56, display: "flex", alignItems: "center",
            fontSize: 13, fontWeight: 600,
            color: isActive ? "white" : "rgba(255,255,255,.5)",
            textDecoration: "none",
            borderBottom: isActive ? "2px solid #4D7CFE" : "2px solid transparent",
            transition: "color .15s",
          })}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: "#F0F2F7" }}>
        <Nav />
        <div style={{ flex: 1, overflow: "hidden" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/items" element={<Items />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
