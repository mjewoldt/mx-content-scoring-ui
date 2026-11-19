const BASE = "http://localhost:8000";

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  stats: () => get("/stats"),
  categories: () => get("/stats/categories"),
  brands: () => get("/stats/brands"),
  items: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v != null && v !== "" && q.set(k, v));
    return get(`/items?${q}`);
  },
  item: (gtin) => get(`/items/${gtin}`),
};
