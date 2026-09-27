import { useRef, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  LoaderCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Section from "./Section";
import "./Contact.css";

export default function Contact() {
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");
  const submitting = useRef(false);
  const [count, setCount] = useState(0);

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
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("application/json")
      )
        throw new Error("Send failed");
      await response.json();
      setStatus("success");
      setFeedback("Thanks for reaching out! Your message has been received.");
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
      label="CONTACT"
      title={
        <>
          Let's build <span className="muted">something great.</span>
        </>
      }
    >
      <div className="contact-grid">
        <div className="contact-left reveal">
          <div className="contact-badge">
            <Sparkles size={14} aria-hidden="true" /> GOOD IDEAS START WITH A
            HELLO
          </div>
          <h3 className="contact-main-title">
            Your next idea.
            <br />
            <span>Our next conversation.</span>
          </h3>
          <p className="contact-description">
            A website, a collaboration, or just a question. Tell me what you
            have in mind and let's see what we can create together.
          </p>
          <div className="contact-note">
            <span className="contact-note-icon">
              <MessageSquare size={22} aria-hidden="true" />
            </span>
            <div>
              <h4>A little detail goes a long way.</h4>
              <p>
                Share your idea, goals, and timeline.
                <br />
                I'll take it from there.
              </p>
            </div>
          </div>
          <div className="contact-signature">
            Thoughtful design. Clean code. <span>A personal touch.</span>
          </div>
        </div>
        <div className="contact-form-box reveal">
          <div className="contact-form-glow" aria-hidden="true" />
          <div className="contact-form-heading">
            <div>
              <span className="contact-small-label">LET'S CONNECT</span>
              <h3>Send a message</h3>
            </div>
            <ArrowUpRight size={28} aria-hidden="true" />
          </div>
          <form onSubmit={handleSubmit} aria-busy={status === "sending"}>
            <fieldset disabled={status === "sending"}>
              <div className="contact-field-row">
                <div className="contact-field">
                  <label htmlFor="contact-name">
                    Your name <span>*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="How should I call you?"
                    required
                    maxLength={100}
                  />
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-email">
                    Email address <span>*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    maxLength={254}
                  />
                </div>
              </div>
              <div className="contact-field">
                <label htmlFor="contact-message">
                  What's on your mind? <span>*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Tell me a little about your project..."
                  required
                  maxLength={3000}
                  onChange={(event) => setCount(event.target.value.length)}
                  aria-describedby="message-count"
                />
                <span id="message-count" className="contact-character-count">
                  {count} / 3,000
                </span>
              </div>
              <button type="submit" className="contact-submit">
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
                    Send message <ArrowUpRight size={18} aria-hidden="true" />
                  </>
                )}
              </button>
            </fieldset>
            <p className="contact-form-hint">
              Just a conversation. No commitment required.
            </p>
            <div
              className={`contact-feedback contact-feedback--${status}`}
              role="status"
              aria-live="polite"
            >
              {status === "success" && (
                <CheckCircle2 size={18} aria-hidden="true" />
              )}
              {feedback}
            </div>
          </form>
        </div>
      </div>
    </Section>
  );
}
