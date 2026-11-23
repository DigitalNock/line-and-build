import React, { useEffect, useRef, useState } from "react";
import "./testimonials.css";

/* =====================================================================
   "Don't just take our words": client testimonials carousel
   Shows 2 cards at a time on desktop, 1 on mobile. Arrows, dots, swipe.
   photo: optional, e.g. "testimonials/nithin.jpg" in /public/testimonials/
          (leave "" to show the client's initials instead)
   The entries below are PLACEHOLDERS: replace them with real reviews
   (e.g. copied from your Google reviews) before going live.
   ===================================================================== */
const REVIEWS = [
  { title: "Reasonable price", name: "Client Name", photo: "", rating: 5,
    text: "Replace this with a real review from one of your clients. Two to four sentences works best, about what you built for them and how the project went." },
  { title: "Trustworthy and reliable", name: "Client Name", photo: "", rating: 5,
    text: "Replace this with a real review from one of your clients. Two to four sentences works best, about what you built for them and how the project went." },
  { title: "Delivered on time", name: "Client Name", photo: "", rating: 4,
    text: "Replace this with a real review from one of your clients. Two to four sentences works best, about what you built for them and how the project went." },
  { title: "Beautiful interiors", name: "Client Name", photo: "", rating: 5,
    text: "Replace this with a real review from one of your clients. Two to four sentences works best, about what you built for them and how the project went." },
];

const AUTOPLAY_MS = 6000; // 0 = off
const viewFor = (w) => (w <= 760 ? 1 : 2);
const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const Arrow = ({ dir }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Testimonials() {
  const [perView, setPerView] = useState(() => (typeof window === "undefined" ? 2 : viewFor(window.innerWidth)));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef(0);

  const pages = Math.max(1, REVIEWS.length - perView + 1);
  const go = (i) => setIndex(((i % pages) + pages) % pages);

  useEffect(() => {
    const onResize = () => setPerView(viewFor(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  useEffect(() => { if (index > pages - 1) setIndex(pages - 1); }, [pages, index]);
  useEffect(() => {
    if (!AUTOPLAY_MS || paused || pages < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % pages), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused, pages]);

  return (
    <section id="testimonials" className="lbt">
      <div className="lbt-wrap">
        <h2 className="lbt-title">Don't just take <span>our words</span></h2>

        <div
          className="lbt-viewport"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onPointerDown={(e) => (startX.current = e.clientX)}
          onPointerUp={(e) => {
            const dx = e.clientX - startX.current;
            if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
          }}
        >
          <div
            className="lbt-track"
            style={{ "--pv": perView, transform: `translateX(calc(${-index} * (100% + var(--gap)) / ${perView}))` }}
          >
            {REVIEWS.map((r, i) => (
              <article className="lbt-card" key={i}>
                <header className="lbt-top">
                  <div className="lbt-avatar">
                    {r.photo ? <img src={r.photo} alt={r.name} loading="lazy" /> : <span>{initials(r.name)}</span>}
                  </div>
                  <div>
                    <h4>{r.title}</h4>
                    <small>{r.name}</small>
                  </div>
                  <span className="lbt-quote" aria-hidden="true">&rdquo;</span>
                </header>
                <p className="lbt-text">{r.text}</p>
                <div className="lbt-stars" aria-label={`${r.rating} out of 5 stars`}>
                  {"★".repeat(r.rating)}<i>{"☆".repeat(5 - r.rating)}</i>
                </div>
              </article>
            ))}
          </div>
        </div>

        {pages > 1 && (
          <div className="lbt-nav">
            <button className="lbt-arrow" onClick={() => go(index - 1)} aria-label="Previous reviews"><Arrow dir="prev" /></button>
            <div className="lbt-dots">
              {Array.from({ length: pages }, (_, i) => (
                <button key={i} className={i === index ? "on" : ""} onClick={() => go(i)} aria-label={`Go to slide ${i + 1}`} />
              ))}
            </div>
            <button className="lbt-arrow" onClick={() => go(index + 1)} aria-label="Next reviews"><Arrow dir="next" /></button>
          </div>
        )}
      </div>
    </section>
  );
}
