import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../config/api";

// Defaults reserve the existing layout, but stay hidden until fresh data arrives.
export function usePublicContent(section, defaults, path = `/api/content/${section}`) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let retry;
    let timeout;
    async function load() {
      const request = new AbortController();
      const cancel = () => request.abort();
      controller.signal.addEventListener("abort", cancel, { once: true });
      timeout = setTimeout(cancel, 90000);
      try {
        const response = await fetch(`${API_URL}${path}`, {
          signal: request.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`Unable to load ${section} content`);
        const body = await response.json();
        const value = body.content ?? body;
        if (Array.isArray(defaults) ? !Array.isArray(value)
          : !value || typeof value !== "object" || Array.isArray(value)) {
          throw new Error(`Invalid ${section} content`);
        }
        if (!controller.signal.aborted) setData(value);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error.message);
          // Retry cold-start/network failures without exposing old content.
          retry = setTimeout(load, 10000);
        }
      } finally {
        clearTimeout(timeout);
        controller.signal.removeEventListener("abort", cancel);
      }
    }
    load();
    return () => {
      controller.abort();
      clearTimeout(timeout);
      clearTimeout(retry);
    };
  }, [section, defaults, path]);

  const content = useMemo(() => Array.isArray(defaults)
    ? data ?? defaults : { ...defaults, ...data }, [defaults, data]);
  return { content, ready: data !== null, data };
}
