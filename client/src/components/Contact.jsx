import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  LoaderCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Section from "./Section";
import "./Contact.css";

import { API_URL } from "../config/api";

const defaultContent = {
  topLabel: "CONTACT",
  heading: "Let's build something great.",
  badge: "GOOD IDEAS START WITH A HELLO",
  mainTitle: "Your next idea.",
  mainTitleAccent: "Our next conversation.",
  description:
    "A website, a collaboration, or just a question. Tell me what you have in mind and let's see what we can create together.",
  noteTitle: "A little detail goes a long way.",
  noteDescription: "Share your idea, goals, and timeline. I'll take it from there.",
  signature: "Thoughtful design. Clean code.",
  signatureAccent: "A personal touch.",
  formLabel: "LET'S CONNECT",
  formTitle: "Send a message",
  nameLabel: "Your name",
  namePlaceholder: "How should I call you?",
  emailLabel: "Email address",
  emailPlaceholder: "you@example.com",
  messageLabel: "What's on your mind?",
  messagePlaceholder: "Tell me a little about your project...",
  submitText: "Send message",
  formHint: "Just a conversation. No commitment required.",
};

export default function Contact() {
  const [content, setContent] = useState(defaultContent);
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");
  const submitting = useRef(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await fetch(`${API_URL}/api/content/contact`);

        if (!response.ok) {
          throw new Error("Failed to fetch contact content");
        }

        const data = await response.json();

        setContent({
          ...defaultContent,
          ...data,
        });
      } catch (error) {
        console.error("Error fetching contact content:", error);
      }
    };

    fetchContact();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting.current) return;

    const form = event.currentTarget;

    const values = Object.fromEntries(new FormData(form));

    const payload = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value.trim()]),
    );

    if (!payload.name || !payload.email || !payload.message) {
      setStatus("error");
      setFeedback("Please fill in each field before sending your message.");
      return;
    }

    submitting.current = true;
    setStatus("sending");
    setFeedback("");

    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("application/json")
      ) {
        throw new Error("Send failed");
      }

      await response.json();

      setStatus("success");
      setFeedback(
        "Thanks for reaching out! Your message has been received.",
      );

      form.reset();
      setCount(0);
    } catch {
      setStatus("error");
      setFeedback(
        "Your message couldn't be sent. Please try again shortly. Your draft is still here.",
      );
    } finally {
      submitting.current = false;
    }
  }

  return (
    <Section
      id="contact"
      number="05"
      label={content.topLabel}
      title={
        <>
          {content.heading.includes("something great.") ? (
            <>
              Let's build{" "}
              <span className="muted">something great.</span>
            </>
          ) : (
            content.heading
          )}
        </>
      }
    >
      <div className="contact-grid">
        <div className="contact-left reveal">
          <div className="contact-badge">
            <Sparkles size={14} aria-hidden="true" />
            {content.badge}
          </div>

          <h3 className="contact-main-title">
            {content.mainTitle}
            <br />
            <span>{content.mainTitleAccent}</span>
          </h3>

          <p className="contact-description">
            {content.description}
          </p>

          <div className="contact-note">
            <span className="contact-note-icon">
              <MessageSquare size={22} aria-hidden="true" />
            </span>

            <div>
              <h4>{content.noteTitle}</h4>

              <p>
                {content.noteDescription}
              </p>
            </div>
          </div>

          <div className="contact-signature">
            {content.signature}{" "}
            <span>{content.signatureAccent}</span>
          </div>
        </div>

        <div className="contact-form-box reveal">
          <div className="contact-form-glow" aria-hidden="true" />

          <div className="contact-form-heading">
            <div>
              <span className="contact-small-label">
                {content.formLabel}
              </span>

              <h3>{content.formTitle}</h3>
            </div>

            <ArrowUpRight size={28} aria-hidden="true" />
          </div>

          <form
            onSubmit={handleSubmit}
            aria-busy={status === "sending"}
          >
            <fieldset disabled={status === "sending"}>
              <div className="contact-field-row">
                <div className="contact-field">
                  <label htmlFor="contact-name">
                    {content.nameLabel} <span>*</span>
                  </label>

                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder={content.namePlaceholder}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-email">
                    {content.emailLabel} <span>*</span>
                  </label>

                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={content.emailPlaceholder}
                    required
                    maxLength={254}
                  />
                </div>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">
                  {content.messageLabel} <span>*</span>
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder={content.messagePlaceholder}
                  required
                  maxLength={3000}
                  onChange={(event) =>
                    setCount(event.target.value.length)
                  }
                  aria-describedby="message-count"
                />

                <span
                  id="message-count"
                  className="contact-character-count"
                >
                  {count} / 3,000
                </span>
              </div>

              <button
                type="submit"
                className="contact-submit"
              >
                {status === "sending" ? (
                  <>
                    Sending message{" "}
                    <LoaderCircle
                      className="contact-spinner"
                      size={18}
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <>
                    {content.submitText}
                    <ArrowUpRight
                      size={18}
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>
            </fieldset>

            <p className="contact-form-hint">
              {content.formHint}
            </p>

            <div
              className={`contact-feedback contact-feedback--${status}`}
              role="status"
              aria-live="polite"
            >
              {status === "success" && (
                <CheckCircle2
                  size={18}
                  aria-hidden="true"
                />
              )}

              {feedback}
            </div>
          </form>
        </div>
      </div>
    </Section>
  );
}
