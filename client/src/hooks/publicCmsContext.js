import { createContext, useContext } from "react";

export const PublicCmsContext = createContext(null);

export function useCmsContent(section) {
  return useContext(PublicCmsContext)[section];
}
