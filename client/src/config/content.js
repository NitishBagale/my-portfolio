// Support existing database field names without replacing deliberately empty text.
export function normalizeHero(content = {}) {
  return {
    ...content,
    name: content.name ?? content.title ?? "NITISH BAGALE",
    primaryButton:
      content.primaryButton ?? content.buttonText ?? "VIEW MY WORK",
    secondaryButton: content.secondaryButton ?? "GET IN TOUCH",
  };
}

// A save response must not replace edits made while the request was in flight.
export function applySavedContent(current, submitted, saved) {
  if (current !== submitted) return current;
  return { ...submitted, ...saved };
}
