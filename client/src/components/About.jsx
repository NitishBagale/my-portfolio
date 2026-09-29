import { usePublicContent } from "../hooks/usePublicContent";
import { useLayoutEffect, useRef } from "react";
import {
  CodeXml,
  Monitor,
  Spline,
  TrendingUp,
  Code2,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./About.css";

gsap.registerPlugin(ScrollTrigger);

// Original frontend content, available before the CMS responds.
const defaultAbout = {
  topLabel: "ABOUT ME",
  heading: "Turning ideas\ninto digital\nexperiences.",
  description: "I'm Nitish, a frontend developer who enjoys turning simple ideas into beautiful web experiences. I love clean design, smooth animations and building things that people actually enjoy using.",
  buttonText: "EXPLORE MY WORK",
  buttonUrl: "#projects",
  cards: [
    { number: "01", icon: "CodeXml", title: "Frontend Development", description: "Modern, responsive and fast. I build clean and accessible web experiences." },
    { number: "02", icon: "Spline", title: "Animation", description: "Bringing ideas to life with smooth and meaningful animations." },
    { number: "03", icon: "Monitor", title: "Web Design", description: "Clean, simple and user-friendly interfaces that people love." },
    { number: "04", icon: "TrendingUp", title: "Currently", description: "Building & Learning. Exploring new tools, ideas and improving every day." },
  ],
};

/* =========================
   ICONS
========================= */

const iconMap = {
  CodeXml,
  Monitor,
  Spline,
  TrendingUp,
  Code2,
};

/* =========================
   ABOUT CARD
========================= */

function AboutCard({ number, icon, title, description }) {
  const Icon = iconMap[icon] || Code2;

  return (
    <article className="about-card">
      <div className="about-card-top">
        <Icon
          size={21}
          strokeWidth={1.4}
          aria-hidden="true"
        />

        <span>{number}</span>
      </div>

      <h3>{title}</h3>

      <p>{description}</p>
    </article>
  );
}

/* =========================
   CURVES
========================= */

function AboutCurves() {
  return (
    <div className="about-curves" aria-hidden="true">
      <div className="about-curve-reveal about-curve-left">
        <span className="about-arc about-arc-outer" />
        <span className="about-arc about-arc-inner" />
      </div>

      <div className="about-curve-reveal about-curve-right">
        <span className="about-arc about-arc-outer" />
        <span className="about-arc about-arc-inner" />
      </div>

      <span className="about-curve-dot about-dot-left" />
      <span className="about-curve-dot about-dot-right" />
    </div>
  );
}

/* =========================
   ABOUT
========================= */

export default function About() {
  const sectionRef = useRef(null);

  const { content: about, ready } = usePublicContent("about", defaultAbout);

  /* =========================
     GSAP ANIMATION
  ========================= */

  useLayoutEffect(() => {
    if (!ready) return;
    const media = gsap.matchMedia();

    // Leave all content visible when reduced motion is preferred.
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const timeline = gsap.timeline({
          defaults: {
            duration: 0.5,
            ease: "power3.out",
          },

          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            once: true,
          },
        });

        timeline
          .from(
            ".about-label",
            {
              y: 12,
              opacity: 0,
              duration: 0.35,
            },
            0
          )

          .from(
            ".about-heading",
            {
              y: 20,
              opacity: 0,
            },
            0.1
          )

          .from(
            ".about-description",
            {
              y: 14,
              opacity: 0,
            },
            0.2
          )

          .from(
            ".about-work-link",
            {
              opacity: 0,
              duration: 0.4,
            },
            0.3
          )

          // A moving clip reveals the CSS borders like a line drawing.
          .fromTo(
            ".about-curve-reveal",
            {
              clipPath: "inset(0 0 100% 0)",
            },
            {
              clipPath: "inset(0 0 0% 0)",
              duration: 0.65,
              stagger: 0.06,
              ease: "power2.inOut",
            },
            0.2
          )

          .from(
            ".about-curve-dot",
            {
              opacity: 0,
              duration: 0.3,
            },
            0.75
          )

          // Overlap the cards with the center reveal.
          .from(
            ".about-cards-left .about-card",
            {
              y: 18,
              opacity: 0,
              stagger: 0.08,
            },
            0.3
          )

          .from(
            ".about-cards-right .about-card",
            {
              y: 18,
              opacity: 0,
              stagger: 0.08,
            },
            0.42
          );

        // Keep the overlapping reveals, with a slightly more relaxed pace.
        timeline.timeScale(0.7);
      },
      sectionRef
    );

    return () => media.revert();
  }, [ready]);

  /* =========================
     SPLIT HEADING
  ========================= */

  const headingLines = about.heading
    ? about.heading.split("\n")
    : [];

  /* =========================
     CARD POSITIONS
  ========================= */

  const leftCards = about.cards?.filter(
    (_, index) => index % 2 === 0
  );

  const rightCards = about.cards?.filter(
    (_, index) => index % 2 !== 0
  );

  return (
    <section
      id="about"
      aria-busy={!ready}
      className="about-section"
      ref={sectionRef}
      aria-labelledby="about-heading"
    >
      <div className="about-container" style={{ visibility: ready ? undefined : "hidden" }}>

        {/* =========================
            CENTER CONTENT
        ========================= */}

        <div className="about-center">
          <div className="about-content">

            <p className="about-label">
              {about.topLabel}
            </p>

            <h2
              id="about-heading"
              className="about-heading"
            >
              {headingLines.length > 0 ? (
                headingLines.map((line, index) => (
                  <span key={index}>
                    {index === headingLines.length - 1 ? (
                      <span>{line}</span>
                    ) : (
                      <>
                        {line}
                        <br />
                      </>
                    )}
                  </span>
                ))
              ) : (
                about.heading
              )}
            </h2>

            <p className="about-description">
              {about.description}
            </p>

            <a
              className="about-work-link"
              href={about.buttonUrl}
            >
              {about.buttonText}

              <span aria-hidden="true">
                →
              </span>
            </a>

          </div>

          <AboutCurves />
        </div>

        {/* =========================
            LEFT CARDS
        ========================= */}

        <div className="about-cards about-cards-left">
          {leftCards?.map((card, index) => (
            <AboutCard
              key={`${card.number}-${index}`}
              {...card}
            />
          ))}
        </div>

        {/* =========================
            RIGHT CARDS
        ========================= */}

        <div className="about-cards about-cards-right">
          {rightCards?.map((card, index) => (
            <AboutCard
              key={`${card.number}-${index}`}
              {...card}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
