import { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import { PublicCmsContext } from "../hooks/publicCmsContext";

const sections = ["hero", "about", "skills", "projects", "contact", "navbar", "footer"];

export default function PublicCmsLoader({ children }) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    // Allow the hosted backend time to wake up, but never wait indefinitely.
    const timeout = setTimeout(() => controller.abort(), 90000);
    let active = true;
    async function load() {
      setError(false);
      try {
        const entries = await Promise.all([
          ...sections.map((section) => [section, `/api/content/${section}`]),
          ["projectCards", "/api/projects"],
        ].map(async ([section, path]) => {
          const response = await fetch(`${API_URL}${path}`, {
            signal: controller.signal,
            cache: "no-store",
          });
          if (!response.ok) throw new Error(`Unable to load ${section}`);
          const data = await response.json();
          const value = data.content ?? data;
          if (section === "projectCards" ? !Array.isArray(value)
            : !value || typeof value !== "object" || Array.isArray(value)) {
            throw new Error(`Invalid ${section} content`);
          }
          return [section, value];
        }));
        if (active) setContent(Object.fromEntries(entries));
      } catch {
        if (active) setError(true);
        controller.abort();
      } finally {
        clearTimeout(timeout);
      }
    }
    load();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  if (!content) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center" aria-busy={!error}>
        <div>
          <p role="status" className="text-sm text-white/50">
            {error ? "Unable to load the portfolio. Please try again." : "Loading portfolio…"}
          </p>
          {error && (
            <button type="button" onClick={() => { setError(false); setAttempt((value) => value + 1); }}
              className="mt-4 px-4 py-2 rounded-lg border border-white/20 text-sm text-white">
              Try again
            </button>
          )}
        </div>
      </main>
    );
  }

  return <PublicCmsContext.Provider value={content}>{children}</PublicCmsContext.Provider>;
}
