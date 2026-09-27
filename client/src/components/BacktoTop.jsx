import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import "./BacktoTop.css";

export default function BackToTop() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");

    const handleScroll = () => {
      const isScrolled = window.scrollY > 500;

      if (!footer) {
        setShowButton(isScrolled);
        return;
      }

      const footerRect = footer.getBoundingClientRect();
      const footerVisible = footerRect.top < window.innerHeight;

      setShowButton(isScrolled && !footerVisible);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <button
      type="button"
      className={`back-to-top ${showButton ? "show" : ""}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}
