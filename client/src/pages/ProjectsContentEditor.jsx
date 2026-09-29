import { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import { applySavedContent } from "../config/content";
import defaults from "../data/projects-content.json";

const fields = [
  ["number", "Section number"], ["label", "Section label"],
  ["heading", "Heading"], ["headingAccent", "Muted heading text"],
  ["description", "Description"], ["selectedWorkLabel", "Selected work label"],
];

export default function ProjectsContentEditor({ token }) {
  const [content, setContent] = useState(defaults);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoaded(false);
      setError("");
      try {
        const response = await fetch(`${API_URL}/api/admin/content/projects`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load section content.");
        if (!controller.signal.aborted) {
          setContent({ ...defaults, ...data });
          setLoaded(true);
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      }
    }
    load();
    return () => controller.abort();
  }, [token, retry]);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/admin/content/projects`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save section content.");
      setContent((current) => applySavedContent(current, content, data.content));
      setMessage("Projects section content saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="bg-[#101010] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Projects section content</h2>
        <p className="text-sm text-gray-400 mt-2">Edit the heading and introduction displayed above your project cards.</p>
      </div>
      {!loaded && !error && <p className="text-gray-400">Loading section content...</p>}
      {error && <p role="alert" className="text-red-400">{error}</p>}
      {!loaded && error && (
        <button type="button" onClick={() => setRetry((value) => value + 1)} className="text-orange-400">Retry loading</button>
      )}
      <fieldset disabled={!loaded || saving} className="grid grid-cols-1 md:grid-cols-2 gap-5 disabled:opacity-50">
        {fields.map(([field, label]) => {
          const Input = field === "description" ? "textarea" : "input";
          return (
            <label key={field} className={field === "description" ? "md:col-span-2" : ""}>
              <span className="block text-sm text-gray-300 mb-2">{label}</span>
              <Input
                value={content[field]}
                rows={field === "description" ? 3 : undefined}
                onChange={(event) => {
                  setContent((current) => ({ ...current, [field]: event.target.value }));
                  setMessage("");
                }}
                className="w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white outline-none focus:border-[#FF8C00]"
              />
            </label>
          );
        })}
      </fieldset>
      {message && <p role="status" className="text-green-400">{message}</p>}
      <button type="submit" disabled={!loaded || saving} className="px-5 py-3 rounded-xl bg-[#FF8C00] text-white font-medium disabled:opacity-50">
        {saving ? "Saving..." : "Save section content"}
      </button>
    </form>
  );
}
