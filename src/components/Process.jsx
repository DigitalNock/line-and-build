import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Heading } from "./Words.jsx";
import "./process.css";

/* =====================================================================
   PROCESS — stacked site cards
   Each step is a card with a real photo. As you scroll, the next card
   slides up and stacks on top; the previous one sinks back and dims.

   ✏️ To change a step: edit it below.
      img   → put your image in /public/process/ and write its path here
      icon  → any 42×42 SVG path (stroke icon)
      stamp → true shows the yellow "Approved" stamp on the photo
   ===================================================================== */
export const PROCESS_STEPS = [
  {
    title: "Consult",
    text: "We visit your site, listen to how you want to live or work, and understand your budget before a single line is drawn.",
    points: ["Site visit", "Requirement brief", "Budget guidance"],
    img: "process/01-consult.webp",
    icon: "M8 34V14l13-8 13 8v20M4 34h34M17 34v-9h8v9M21 6v-3",
  },
  {
    title: "Design",
    text: "Concept sketches grow into plans, elevations and 3D views, refined with you until the design feels exactly right.",
    points: ["Concept plans", "Elevations & façades", "3D views"],
    img: "process/02-design.webp",
    icon: "M6 36L30 12l6 6-24 24H6zM26 16l6 6M6 36l4-4",
  },
  {
    title: "Approve",
    text: "Working drawings and a detailed estimate are finalised, and we support the approvals needed to start on site.",
    points: ["Working drawings", "Detailed estimate", "Approval support"],
    img: "process/03-approve.webp",
    icon: "M10 4h16l8 8v26H10zM26 4v8h8M15 24l5 5 9-10",
    stamp: true,
  },
  {
    title: "Build",
    text: "Our site team takes the structure from foundation to roof, with supervision and quality checks at every stage.",
    points: ["Site supervision", "Quality checks", "Progress updates"],
    img: "process/04-build.webp",
    icon: "M6 38h30M10 38V8h6v30M26 38V16h6v22M10 14h6M10 22h6M10 30h6M26 22h6M26 30h6",
  },
  {
    title: "Finish",
    text: "Interiors, façade and finishing touches are executed in-house, so the finished space matches the drawing.",
    points: ["Interiors", "Façade & finishes", "Snag fixing"],
    img: "process/05-finish.webp",
    icon: "M6 30h30v6H6zM9 30v-8a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v8M21 4v6M15 10h12l-2 4H17z",
  },
  {
    title: "Handover",
    text: "A final walk-through and inspection, then the keys to a space built from foundation to finishing touches.",
    points: ["Final inspection", "Documentation", "Key handover"],
    img: "process/06-handover.webp",
    icon: "M14 22a8 8 0 1 1 8 8M20 26L6 40M10 36l4 4M14 32l3 3",
  },
];

export function Process() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".lbp-card");
      cards.forEach((card, i) => {
        const inner = card.querySelector(".lbp-inner");
        const photo = card.querySelector(".lbp-photo img");
        // card rises into place
        gsap.from(inner, {
          y: 80,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 88%" },
        });
        // photo drifts slowly (parallax)
        gsap.fromTo(
          photo,
          { yPercent: -6, scale: 1.12 },
          {
            yPercent: 6,
            scale: 1.02,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
        // checklist ticks in
        gsap.from(card.querySelectorAll(".lbp-points li"), {
          x: -20,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: card, start: "top 60%" },
        });
        // stamp lands
        const stamp = card.querySelector(".lbp-stamp");
        if (stamp)
          gsap.fromTo(
            stamp,
            { scale: 2.6, rotate: -30, autoAlpha: 0 },
            {
              scale: 1,
              rotate: -12,
              autoAlpha: 1,
              duration: 0.5,
              ease: "back.out(2.2)",
              scrollTrigger: { trigger: card, start: "top 45%" },
            },
          );
        // when the NEXT card covers this one: sink back + dim
        const next = cards[i + 1];
        if (next) {
          gsap.to(inner, {
            scale: 0.95,
            ease: "none",
            scrollTrigger: {
              trigger: next,
              start: "top bottom",
              end: "top 20%",
              scrub: true,
            },
          });
        }
        // progress bar on each card fills up to its step
        gsap.fromTo(
          card.querySelector(".lbp-progress i"),
          { scaleX: i / cards.length },
          {
            scaleX: (i + 1) / cards.length,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 70%",
              end: "top 25%",
              scrub: true,
            },
          },
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const total = String(PROCESS_STEPS.length).padStart(2, "0");

  return (
    <section id="process" className="lb-proc" ref={ref}>
      <div className="lb-proc-head pad">
        <div className="sec-head">
          <div className="eyebrow">Process</div>
          <Heading a="How your project" b="takes shape." />
        </div>
      </div>

      <div className="lbp-cards">
        {PROCESS_STEPS.map((s, i) => (
          <article className="lbp-card" key={s.title} style={{ "--i": i }}>
            <div className="lbp-inner">
              <div className="lbp-photo">
                <img src={s.img} alt={s.title} loading="lazy" />
                <span className="lbp-photo-tag">
                  Stage {String(i + 1).padStart(2, "0")}
                </span>
                {s.stamp && (
                  <div className="lbp-stamp">
                    <b>Approved</b>
                    <em>Line And Build</em>
                  </div>
                )}
              </div>
              <div className="lbp-content">
                <div className="lbp-top">
                  <span className="lbp-step">
                    Step <b>{String(i + 1).padStart(2, "0")}</b> / {total}
                  </span>
                  <svg className="lbp-icon" viewBox="0 0 42 42">
                    <path d={s.icon} />
                  </svg>
                </div>
                <div className="lbp-progress">
                  <i />
                </div>
                <div className="lbp-num">{String(i + 1).padStart(2, "0")}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <ul className="lbp-points">
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                {i === PROCESS_STEPS.length - 1 && (
                  <a href="#contact" className="btn fill lbp-cta" data-magnetic>
                    Start your project
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
