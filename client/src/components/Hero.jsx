import { normalizeHero } from "../config/content";
import { useCmsContent } from "../hooks/publicCmsContext";

import { ArrowUpRight, Mail } from "lucide-react";
import Navbar from "./Navbar";
import "./Banner.css";

export default function Hero() {
  const cmsHero = useCmsContent("hero");
  const hero = {
    name: "NITISH BAGALE",
    secondaryButton: "Contact",
    description:
      "I’m a web developer turning ideas into clean, responsive websites. I bring thoughtful design and smooth interactions together to create experiences that feel simple and natural.",
    primaryButton: "View my work",
    buttonUrl: "#projects",
    ...normalizeHero(cmsHero),
  };

  const titleParts = hero.name.trim().split(/\s+/);

  const firstName = titleParts[0] ?? "";
  const lastName = titleParts.slice(1).join(" ");

  return (
    <>
      <section id="home" className="photo-banner" aria-label="Nitish portfolio">
        <img
          className="photo-banner-image"
          src={hero.image || "/images/nitish.jpg"}
          alt="Nitish Bagale"
          fetchPriority="high"
          width="1080"
          height="607"
        />

        <div className="banner-detail-layer" aria-hidden="true">
          <span className="banner-cross banner-cross-one">+</span>
          <span className="banner-cross banner-cross-two">+</span>
          <span className="banner-cross banner-cross-three">+</span>
        </div>

        <div className="banner-texture" aria-hidden="true">
          <div className="banner-grid-lines" />
          <div className="banner-light-points" />
        </div>

        <div className="banner-atmosphere" aria-hidden="true">
          <div className="banner-ambient-light" />
          <div className="banner-orbit banner-orbit-outer" />
          <div className="banner-orbit banner-orbit-middle" />
          <div className="banner-orbit banner-orbit-inner" />
        </div>

        <Navbar />

        <div className="banner-introduction">
         
          <h1>
            {firstName}
            <br />
            <span className="banner-name-accent">{lastName}</span>
          </h1>

          <p>{hero.description}</p>

          <div className="banner-actions">
            {hero.primaryButton && (
              <a
                className="banner-button banner-button-primary"
                href={hero.buttonUrl}
              >
                {hero.primaryButton}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            )}

            {hero.secondaryButton && (
              <a
                className="banner-button banner-button-outline"
                href={hero.secondaryButtonUrl ?? "#contact"}
              >
                {hero.secondaryButton}
                <Mail size={17} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
