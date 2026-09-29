import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import defaults from "../data/navigation-footer.json";
import { usePublicContent } from "../hooks/usePublicContent";

export default function Navbar() {
  const nav = useRef(null);
  const content = usePublicContent("navbar", defaults.navbar);
  const links = content.links;
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

    links.forEach(({ href }) => {
      const section = href.startsWith("#")
        ? document.getElementById(href.slice(1))
        : null;

      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, [links]);

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
    <nav ref={nav} className="banner-navigation" aria-label={content.ariaLabel}>
      {links.map(({ label, href }, index) => {
        const id = href.startsWith("#") ? href.slice(1) : null;

        return (
          <a
            key={`${href}-${index}`}
            href={href}
            aria-current={activeSection === id ? "location" : undefined}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
