import React, { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./backtotop.css";

/* Back-to-top button: shows after the first screen,
   yellow ring = how far down the page you are,
   click = smooth scroll to the very top of the site. */
export function BackToTop({ onNav }) {
  const btn = useRef(null),
    ring = useRef(null);

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        btn.current.classList.toggle(
          "show",
          self.scroll() > window.innerHeight * 1.2,
        );
        ring.current.style.strokeDashoffset = String(1 - self.progress);
      },
    });
    return () => st.kill();
  }, []);

  const goTop = () => {
    if (onNav)
      onNav("#top"); // uses Lenis smooth scroll from App.jsx
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      ref={btn}
      className="lb-top"
      aria-label="Back to top"
      onClick={goTop}
      data-magnetic
    >
      <svg className="lb-top-ring" viewBox="0 0 52 52" aria-hidden="true">
        <circle className="track" cx="26" cy="26" r="24" pathLength="1" />
        <circle
          ref={ring}
          className="prog"
          cx="26"
          cy="26"
          r="24"
          pathLength="1"
        />
      </svg>
      <svg className="lb-top-arrow" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" />
      </svg>
    </button>
  );
}
