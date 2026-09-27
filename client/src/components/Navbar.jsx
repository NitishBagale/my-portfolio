import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const links = ["Home", "About", "Skills", "Projects", "Contact"];

export default function Navbar() {
  const nav = useRef(null);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      },
    );

    links.forEach((label) => {
      const section = document.getElementById(label.toLowerCase());

      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.from(".banner-navigation a", {
          opacity: 0,
          y: -8,
          stagger: 0.07,
          duration: 0.6,
          ease: "power2.out",
          clearProps: "transform,opacity",
        });
      }, nav);

      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return (
    <nav
      ref={nav}
      className="banner-navigation"
      aria-label="Main navigation"
    >
      {links.map((label) => {
        const id = label.toLowerCase();

        return (
          <a
            key={label}
            href={`#${id}`}
            aria-current={activeSection === id ? "location" : undefined}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}