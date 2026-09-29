import { useMemo } from "react";
import { useCmsContent } from "./publicCmsContext";

// Fill omitted fields only after the CMS response arrives.
export function usePublicContent(section, defaults) {
  const content = useCmsContent(section);
  return useMemo(() => ({ ...defaults, ...content }), [defaults, content]);
}