import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { frameUrl } from "./SequenceStory.jsx";
import "./video-gallery.css";

/* =====================================================================
   Video gallery: "Glimpse of Our Works" (carousel)
   Add as many videos as you like. The carousel shows 3 at a time on
   desktop, 2 on tablet and 1 on mobile, with arrows, dots and swipe.

   For each video:
     title     big heading shown on hover
     subtitle  one line about the project
     client    client name (leave "" to hide)
     rating    1–5 stars (0 to hide)
     poster    thumbnail image, e.g. "videos/villa.webp" in /public/videos/
     youtube   YouTube video ID (the part after watch?v=)   ─┐ use one
     src       or your own file, e.g. "videos/villa.mp4"     ─┘
   The entries below are PLACEHOLDERS: replace them with real projects.
   ===================================================================== */
const VIDEOS = [
  { title: "Luxury Living", subtitle: "A fully constructed home with stylish interiors", client: "", rating: 0, poster: frameUrl(366), youtube: "", src: "" },
  { title: "Modern Facade", subtitle: "Contemporary elevation with brick and stone cladding", client: "", rating: 0, poster: frameUrl(206), youtube: "", src: "" },
  { title: "Interior Walkthrough", subtitle: "Living, dining and kitchen finished end to end", client: "", rating: 0, poster: frameUrl(300), youtube: "", src: "" },
  { title: "Structure to Shell", subtitle: "Slab, frame and masonry, done to schedule", client: "", rating: 0, poster: frameUrl(158), youtube: "", src: "" },
  { title: "Groundwork", subtitle: "Excavation, footings and pillars on site", client: "", rating: 0, poster: frameUrl(42), youtube: "", src: "" },
];

const AUTOPLAY_MS = 5000; // set to 0 to turn autoplay off

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
    <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
  </svg>
);
const Arrow = ({ dir }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const viewFor = (w) => (w <= 600 ? 1 : w <= 980 ? 2 : 3);

export function VideoGallery() {
  const ref = useRef(null);
  const [open, setOpen] = useState(null);       // index of the playing video
  const [perView, setPerView] = useState(() => (typeof window === "undefined" ? 3 : viewFor(window.innerWidth)));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const drag = useRef({ x: 0, moved: false });

  const pages = Math.max(1, VIDEOS.length - perView + 1);
  const go = (i) => setIndex(((i % pages) + pages) % pages); // loops at both ends
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  // responsive: cards per view
  useEffect(() => {
    const onResize = () => setPerView(viewFor(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  useEffect(() => { if (index > pages - 1) setIndex(pages - 1); }, [pages, index]);

  // autoplay (pauses on hover and while a video is open)
  useEffect(() => {
    if (!AUTOPLAY_MS || paused || open !== null || pages < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % pages), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused, open, pages]);

  // entrance animation (stays visible if the trigger never fires)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const opts = { immediateRender: false, clearProps: "transform,opacity,visibility" };
      gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 75%", once: true } })
        .from(".lbv-head > *", { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: "power3.out", ...opts })
        .from(".lbv-viewport", { y: 60, autoAlpha: 0, duration: 0.9, ease: "power3.out", ...opts }, "-=.4");
    }, ref);
    return () => ctx.revert();
  }, []);

  // popup: Esc to close, lock page scroll
  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // swipe / drag
  const onDown = (e) => { drag.current = { x: e.clientX, moved: false }; };
  const onUp = (e) => {
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 50) { drag.current.moved = true; dx < 0 ? next() : prev(); }
  };
  const play = (i) => {
    if (drag.current.moved) return; // was a swipe, not a click
    const it = VIDEOS[i];
    if (it.youtube || it.src) setOpen(i);
  };

  const v = open !== null ? VIDEOS[open] : null;

  return (
    <section id="videos" className="lbv" ref={ref}>
      {/* scaffold lines taken from the logo */}
      <svg className="lbv-scaffold" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 250 L400 250 M0 270 L400 270 M60 300 L60 40 M150 300 L150 0 M175 300 L175 0 M0 140 L260 0 M0 175 L300 0" />
      </svg>

      <div className="lbv-wrap">
        <header className="lbv-head">
          <span className="lbv-eyebrow">Video gallery</span>
          <h2 className="lbv-title">Glimpse of <span>Our Works</span></h2>
          <p className="lbv-sub">Video gallery of our projects, from the first dig to the finishing touches.</p>
        </header>

        <div
          className="lbv-viewport"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onPointerDown={onDown}
          onPointerUp={onUp}
        >
          <div
            className="lbv-track"
            style={{ "--pv": perView, transform: `translateX(calc(${-index} * (100% + var(--gap)) / ${perView}))` }}
          >
            {VIDEOS.map((item, i) => {
              const playable = !!(item.youtube || item.src);
              return (
                <article className="lbv-card" key={i} aria-hidden={i < index || i >= index + perView}>
                  <button
                    className={`lbv-thumb${playable ? "" : " no-video"}`}
                    onClick={() => play(i)}
                    aria-label={`Play video: ${item.title}`}
                  >
                    <img src={item.poster} alt={item.title} loading="lazy" draggable="false" />
                    <span className="lbv-play"><PlayIcon /></span>

                    {/* hover overlay */}
                    <span className="lbv-info">
                      <strong className="lbv-info-title">{item.title}</strong>
                      {item.subtitle && <span className="lbv-info-sub">{item.subtitle}</span>}
                      {item.client && <span className="lbv-info-client">{item.client}</span>}
                      {item.rating > 0 && (
                        <span className="lbv-stars" aria-label={`${item.rating} out of 5 stars`}>
                          {"★".repeat(item.rating)}<i>{"★".repeat(5 - item.rating)}</i>
                        </span>
                      )}
                      {!playable && <span className="lbv-soon">Video coming soon</span>}
                    </span>
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        {pages > 1 && (
          <div className="lbv-nav">
            <button className="lbv-arrow" onClick={prev} aria-label="Previous videos"><Arrow dir="prev" /></button>
            <div className="lbv-dots">
              {Array.from({ length: pages }, (_, i) => (
                <button key={i} className={i === index ? "on" : ""} onClick={() => go(i)} aria-label={`Go to slide ${i + 1}`} />
              ))}
            </div>
            <button className="lbv-arrow" onClick={next} aria-label="Next videos"><Arrow dir="next" /></button>
          </div>
        )}
      </div>

      {/* player popup */}
      {v && (
        <div className="lbv-modal" onClick={() => setOpen(null)} data-lenis-prevent>
          <div className="lbv-player" onClick={(e) => e.stopPropagation()}>
            <button className="lbv-close" onClick={() => setOpen(null)} aria-label="Close video">×</button>
            {v.youtube ? (
              <iframe
                src={`https://www.youtube.com/embed/${v.youtube}?autoplay=1&rel=0`}
                title={v.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <video src={v.src} poster={v.poster} controls autoPlay playsInline />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
