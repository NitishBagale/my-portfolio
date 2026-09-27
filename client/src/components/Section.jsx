import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export default function Section({ id, number, label, title, children }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".section-heading", {
          y: 30,
          opacity: 0,
          duration: 0.9,
          scrollTrigger: { trigger: ref.current, start: "top 85%" },
        });
        gsap.from(".reveal", {
          y: id === "skills" ? 35 : 22,
          opacity: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%" },
        });
        if (id === "education")
          gsap.from(".timeline-line", {
            scaleY: 0,
            transformOrigin: "top",
            duration: 1.6,
            scrollTrigger: { trigger: ref.current, start: "top 70%" },
          });
        if (id === "projects")
          gsap.utils
            .toArray(".project-image")
            .forEach((image) =>
              gsap.fromTo(
                image,
                { yPercent: -3 },
                {
                  yPercent: 3,
                  ease: "none",
                  scrollTrigger: {
                    trigger: image,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                  },
                },
              ),
            );
      });
    }, ref);
    return () => {
      media.revert();
      context.revert();
    };
  }, [id]);
  return (
    <section id={id} ref={ref} className="section">
      <div className="container">
        <header className="section-heading">
          <div className="eyebrow">
            <span>{number} /</span> {label}
          </div>
          <h2>{title}</h2>
        </header>
        {children}
      </div>
    </section>
  );
}