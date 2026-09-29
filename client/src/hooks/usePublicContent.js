import { useEffect, useState } from "react";
import { API_URL } from "../config/api";

// Defaults preserve the existing design until the CMS response arrives.
export function usePublicContent(section, defaults) {
  const [content, setContent] = useState(defaults);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`${API_URL}/api/content/${section}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Unable to load ${section} content`);
        const data = await response.json();
        if (!controller.signal.aborted) {
          setContent({ ...defaults, ...(data.content ?? data) });
        }
      } catch (error) {
        if (error.name !== "AbortError") console.error(error.message);
      }
    }
    load();
    return () => controller.abort();
  }, [section, defaults]);

  return content;
}
