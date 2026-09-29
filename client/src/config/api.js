// Local development uses Vite's /api proxy; production uses the deployed API.
// VITE_API_URL can override either environment when testing a specific backend.
export const API_URL = (
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "" : "https://my-portfolio-xj70.onrender.com")
).replace(/\/+$/, "");
