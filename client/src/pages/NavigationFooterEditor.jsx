import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { API_URL } from "../config/api";
import defaults from "../data/navigation-footer.json";

const footerGroups = [
  [
    "Contact details",
    [
      ["contactHeading", "Column heading"],
      ["emailLabel", "Email label"],
      ["email", "Email address"],
      ["emailPlaceholder", "Empty email text"],
      ["whatsappLabel", "WhatsApp label"],
      ["whatsapp", "WhatsApp number (include country code)"],
      ["phonePlaceholder", "Empty number text"],
    ],
  ],
  [
    "Section links",
    [
      ["sectionsHeading", "Column heading"],
      ["navigationLabel", "Navigation accessibility label"],
    ],
  ],
  [
    "Location",
    [
      ["locationHeading", "Column heading"],
      ["location", "Location"],
      ["locationPlaceholder", "Empty location text"],
      ["locationNote", "Location note"],
    ],
  ],
  [
    "WhatsApp invitation",
    [
      ["connectHeading", "Column heading"],
      ["invitationTitle", "Title"],
      ["invitationAccent", "Highlighted title"],
      ["invitationDescription", "Description"],
      ["whatsappButton", "WhatsApp button text"],
      ["whatsappPlaceholder", "Unavailable WhatsApp text"],
      ["fallbackText", "Fallback link text"],
      ["fallbackUrl", "Fallback link destination"],
    ],
  ],
  [
    "Bottom row",
    [
      ["copyrightText", "Copyright text (year is automatic)"],
      ["credit", "Credit line"],
      ["backToTopText", "Back-to-top text"],
      ["backToTopUrl", "Back-to-top destination"],
    ],
  ],
];

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white outline-none focus:border-[#FF8C00]";
const buttonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 hover:border-[#FF8C00] disabled:cursor-not-allowed disabled:opacity-40";

export default function NavigationFooterEditor({ section, token }) {
  const [content, setContent] = useState(defaults[section]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const title = section === "navbar" ? "Navbar" : "Footer";

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setLoaded(false);
      setError("");
      setMessage("");
      try {
        const response = await fetch(
          `${API_URL}/api/admin/content/${section}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Unable to load content.");
        if (!controller.signal.aborted) {
          setContent({ ...defaults[section], ...(data.content ?? data) });
          setLoaded(true);
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [section, token, retry]);

  function change(field, value) {
    setContent((current) => ({ ...current, [field]: value }));
    setMessage("");
    setError("");
  }

  function changeLink(index, field, value) {
    change(
      "links",
      content.links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link,
      ),
    );
  }

  function moveLink(index, offset) {
    const links = [...content.links];
    [links[index], links[index + offset]] = [
      links[index + offset],
      links[index],
    ];
    change("links", links);
  }

  async function save(event) {
    event.preventDefault();
    if (!loaded || saving) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/admin/content/${section}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(content),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Unable to save changes.");
      setContent((current) => ({ ...current, ...data.content }));
      setMessage(`${title} saved successfully.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const groups =
    section === "navbar"
      ? [["Navigation", [["ariaLabel", "Navigation accessibility label"]]]]
      : footerGroups;

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-[#FF8C00]">
          Website content
        </p>
        <h1 className="text-2xl font-semibold text-white">Edit {title}</h1>
        <p className="mt-2 text-sm text-gray-400">
          Update the content and links shown in your existing {section}.
        </p>
      </div>
      {loading && <p role="status">Loading {section}...</p>}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300"
        >
          {error}
        </p>
      )}
      {!loading && !loaded && (
        <button
          type="button"
          className={buttonClass}
          onClick={() => setRetry((value) => value + 1)}
        >
          Retry loading
        </button>
      )}
      {loaded && (
        <form onSubmit={save}>
          <fieldset
            disabled={saving}
            className="space-y-6 border-0 p-0 min-w-0"
          >
            {groups.map(([heading, fields]) => (
              <section
                key={heading}
                className="rounded-2xl border border-white/10 bg-[#101010] p-5 md:p-6"
              >
                <h2 className="mb-5 text-lg font-medium text-white">
                  {heading}
                </h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {fields.map(([field, label]) => (
                    <div key={field}>
                      <label
                        htmlFor={`${section}-${field}`}
                        className="mb-2 block text-sm text-gray-300"
                      >
                        {label}
                      </label>
                      <input
                        id={`${section}-${field}`}
                        type={field === "email" ? "email" : "text"}
                        className={inputClass}
                        value={content[field] ?? ""}
                        onChange={(event) => change(field, event.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
            <section className="rounded-2xl border border-white/10 bg-[#101010] p-5 md:p-6">
              <h2 className="text-lg font-medium text-white">{title} links</h2>
              <p className="mt-2 mb-5 text-sm text-gray-400">
                Use #home, #about, #skills, #projects, #contact, a /path, or a
                full https:// address. Change the label without changing its
                destination.
              </p>
              <div className="space-y-4">
                {content.links.map((link, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 items-end gap-3 rounded-xl border border-white/10 p-4 xl:grid-cols-[1fr_1fr_auto]"
                  >
                    <div>
                      <label
                        htmlFor={`${section}-label-${index}`}
                        className="mb-2 block text-sm text-gray-300"
                      >
                        Link {index + 1} label
                      </label>
                      <input
                        id={`${section}-label-${index}`}
                        className={inputClass}
                        value={link.label}
                        maxLength={100}
                        required
                        onChange={(event) =>
                          changeLink(index, "label", event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`${section}-href-${index}`}
                        className="mb-2 block text-sm text-gray-300"
                      >
                        Destination
                      </label>
                      <input
                        id={`${section}-href-${index}`}
                        className={inputClass}
                        value={link.href}
                        required
                        onChange={(event) =>
                          changeLink(index, "href", event.target.value)
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={buttonClass}
                        disabled={index === 0}
                        aria-label={`Move link ${index + 1} up`}
                        onClick={() => moveLink(index, -1)}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        className={buttonClass}
                        disabled={index === content.links.length - 1}
                        aria-label={`Move link ${index + 1} down`}
                        onClick={() => moveLink(index, 1)}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        className={buttonClass}
                        aria-label={`Remove link ${index + 1}`}
                        onClick={() =>
                          change(
                            "links",
                            content.links.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className={`${buttonClass} mt-5`}
                disabled={content.links.length >= 20}
                onClick={() =>
                  change("links", [
                    ...content.links,
                    { label: "", href: "#contact" },
                  ])
                }
              >
                <Plus size={16} /> Add link
              </button>
            </section>
            <button
              type="submit"
              className="rounded-xl bg-[#FF8C00] px-6 py-3 text-sm font-medium text-black disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </fieldset>
          <p
            role="status"
            aria-live="polite"
            className="mt-4 text-sm text-green-300"
          >
            {message}
          </p>
        </form>
      )}
    </div>
  );
}
