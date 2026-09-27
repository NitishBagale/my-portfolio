import { ArrowUpRight, Mail } from "lucide-react";
import Navbar from "./Navbar";
import "./Banner.css";

export default function Hero() {
  return (
    <>
      <section id="home" className="photo-banner" aria-label="Nitish portfolio">
        <img
          className="photo-banner-image"
          src="/images/nitish.jpg"
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
            Nitish
            <br />
            <span className="banner-name-accent">Bagale</span>
          </h1>
          <p>
            I’m a web developer turning ideas into clean, responsive websites. I
            bring thoughtful design and smooth interactions together to create
            experiences that feel simple and natural.
          </p>

          <div className="banner-actions">
            <a className="banner-button banner-button-primary" href="#projects">
              View my work
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a className="banner-button banner-button-outline" href="#contact">
              Contact
              <Mail size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
