import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./about.css";

/* =====================================================================
   ABOUT — "Drawing Sheet"
   The section is an architect's drawing sheet. As you scroll, a house
   elevation draws itself in three stages that follow the brand line
   "From Foundation to Finishing Touches", while the story changes beside it.
   Contact details live in the sheet's title block, which gets stamped.
   ===================================================================== */

const COMPANY = {
  name: "Line And Build",
  tagline: "From Foundation to Finishing Touches",
  logo: "brand/logo.png",
  architects: [
    { name: "Ar. Mohammed Inayath", phone: "+91 74119 31018" },
    { name: "Ar. Sunil Kumar Rathor", phone: "+91 74111 83117" },
  ],
  address:
    "#37, 1st Stage, NTI Layout RMV Extension, Bhoopasandra, Sanjayanagara, Bangalore – 560094",
  phone: "+91 74117 50986",
  email: "design@linenbuild.com", // as printed on the card — check spelling (domain is lineandbuild.com)
  web: "www.lineandbuild.com",
};

const STEPS = [
  {
    k: "01",
    t: "Foundation",
    h: "Who we are",
    p: `Line And Build is a Bengaluru architecture and construction studio led by ${COMPANY.architects[0].name} and ${COMPANY.architects[1].name}. We take every project from the first sketch and soil test to the final coat of paint.`,
  },
  {
    k: "02",
    t: "Structure",
    h: "What we do",
    p: "Architecture, structural coordination, turnkey construction and interiors for homes and commercial spaces, all handled by one accountable team, under one roof.",
  },
  {
    k: "03",
    t: "Finishing Touches",
    h: "How we work",
    p: "Clear drawings, honest estimates, regular site updates and finishes we would be proud to live with. That is the Line And Build standard.",
  },
];

const tel = (n) => "tel:" + n.replace(/\s/g, "");

/* ---------- sketch → reality panel ----------
   Each stage shows an architect's pencil sketch of the real site photo.
   The sketch draws itself, then a yellow scan line turns it into the photo. */
const SHOTS = [
  { k: "foundation", label: "RCC footings & starter bars", lvl: "−1.50 m" },
  { k: "structure", label: "RCC frame topping out", lvl: "+21.00 m" },
  { k: "finishing", label: "Façade, glazing & finishes", lvl: "Handover" },
];
function Reality() {
  return (
    <div className="lab-real">
      {SHOTS.map((s, i) => (
        <figure className="lab-shot" key={s.k}>
          <img className="photo" src={`about/${s.k}.webp`} alt={s.label} />
          <img
            className="sketch"
            src={`about/${s.k}-sketch.webp`}
            alt=""
            aria-hidden="true"
          />
          <i className="scan" />
        </figure>
      ))}
      <span className="lab-crop tl" />
      <span className="lab-crop tr" />
      <span className="lab-crop bl" />
      <span className="lab-crop br" />
      <div className="lab-callouts">
        {SHOTS.map((s, i) => (
          <div className="lab-callout" key={s.k}>
            <b>0{i + 1}</b>
            <span>{s.label}</span>
            <em>{s.lvl}</em>
          </div>
        ))}
      </div>
      <div className="lab-mode">
        <span className="m-sketch">Sketch</span>
        <span className="m-real">Reality</span>
      </div>
    </div>
  );
}

export function About() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    const prep = () => {
      gsap.set(q(".lab-shot"), { autoAlpha: 0 });
      gsap.set(q(".lab-shot .sketch"), {
        clipPath: "inset(0% 0% 100% 0%)",
        autoAlpha: 1,
      });
      gsap.set(q(".lab-shot .photo"), {
        clipPath: "inset(0% 100% 0% 0%)",
        scale: 1.1,
      });
      gsap.set(q(".lab-shot .scan"), { left: "0%", autoAlpha: 0 });
      gsap.set(q(".lab-callout"), { autoAlpha: 0, y: 12 });
      gsap.set(q(".lab-stamp"), { autoAlpha: 0, scale: 2.4, rotate: -28 });
    };
    const build = (tl) => {
      const shots = q(".lab-shot"),
        calls = q(".lab-callout"),
        mode = q(".lab-mode")[0];
      shots.forEach((fig, i) => {
        const t = i / 3,
          sk = fig.querySelector(".sketch"),
          ph = fig.querySelector(".photo"),
          sc = fig.querySelector(".scan");
        if (i > 0)
          tl.to(
            [shots[i - 1], calls[i - 1]],
            { autoAlpha: 0, duration: 0.03 },
            t,
          );
        tl.to(fig, { autoAlpha: 1, duration: 0.02 }, t)
          .to(calls[i], { autoAlpha: 1, y: 0, duration: 0.04 }, t + 0.02)
          .call(() => mode && mode.classList.remove("real"), null, t + 0.01)
          .to(
            sk,
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.12, ease: "none" },
            t,
          ) // sketch draws top → bottom
          .to(sc, { autoAlpha: 1, duration: 0.01 }, t + 0.14)
          .call(() => mode && mode.classList.add("real"), null, t + 0.15)
          .to(
            sc,
            { left: "100%", duration: 0.13, ease: "power1.inOut" },
            t + 0.14,
          ) // yellow scan line sweeps
          .to(
            ph,
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.13,
              ease: "power1.inOut",
            },
            t + 0.14,
          ) // photo revealed behind it
          .to(sk, { autoAlpha: 0, duration: 0.05 }, t + 0.25)
          .to(sc, { autoAlpha: 0, duration: 0.01 }, t + 0.27)
          .to(ph, { scale: 1, duration: 0.33, ease: "none" }, t); // slow push-in
      });
      tl.to(
        q(".lab-stamp"),
        {
          autoAlpha: 1,
          scale: 1,
          rotate: -12,
          duration: 0.05,
          ease: "back.out(2)",
        },
        0.94,
      );
    };
    const setStep = (i) => {
      q(".lab-step").forEach((el, k) => el.classList.toggle("on", k === i));
      q(".lab-tab").forEach((el, k) => {
        el.classList.toggle("on", k === i);
        el.classList.toggle("done", k < i);
      });
    };

    const ctx = gsap.context(() => {
      // desktop: pinned sheet, drawing scrubs with scroll
      mm.add("(min-width: 981px)", () => {
        prep();
        setStep(0);
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: q(".lab-pin")[0],
            start: "top top",
            end: () => "+=" + window.innerHeight * 2.4,
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
          onUpdate() {
            const p = tl.progress();
            setStep(p < 0.33 ? 0 : p < 0.66 ? 1 : 2);
            gsap.set(q(".lab-bar i"), { scaleX: p });
          },
        });
        tl.to({}, { duration: 1 }, 0);
        build(tl);
      });
      // mobile: no pin; draws as the sheet scrolls past, all steps visible
      mm.add("(max-width: 980px)", () => {
        prep();
        q(".lab-step").forEach((el) => el.classList.add("on"));
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: q(".lab-draw")[0],
            start: "top 75%",
            end: "+=" + window.innerHeight * 1.6,
            scrub: 0.8,
          },
        });
        tl.to({}, { duration: 1 }, 0);
        build(tl);
      });
      // heading reveal
      gsap.from(q(".lab-h .w"), {
        yPercent: 115,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.05,
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
    }, root);
    return () => {
      ctx.revert();
      mm.revert();
    };
  }, []);

  const words = (s) =>
    s.split(" ").map((w, i) => (
      <React.Fragment key={i}>
        <span className="wl">
          <span className="w">{w}</span>
        </span>{" "}
      </React.Fragment>
    ));

  return (
    <section id="about" className="lab-about" ref={root}>
      <div className="lab-pin">
        <div className="lab-sheet">
          <span className="lab-corner tl" />
          <span className="lab-corner tr" />
          <span className="lab-corner bl" />
          <span className="lab-corner br" />

          <header className="lab-top">
            <div className="lab-eyebrow">
              <i />
              About {COMPANY.name}
            </div>
            <h2 className="lab-h">
              {words("From foundation")}{" "}
              <em>{words("to finishing touches.")}</em>
            </h2>
          </header>

          <div className="lab-grid">
            <div className="lab-draw">
              <div className="lab-draw-tag">
                Site Record — Sketch to Reality
              </div>
              <Reality />
            </div>

            <div className="lab-side">
              <div className="lab-tabs">
                {STEPS.map((s) => (
                  <div className="lab-tab" key={s.k}>
                    <b>{s.k}</b>
                    <span>{s.t}</span>
                  </div>
                ))}
              </div>
              <div className="lab-bar">
                <i />
              </div>
              <div className="lab-steps">
                {STEPS.map((s) => (
                  <div className="lab-step" key={s.k}>
                    <h3>{s.h}</h3>
                    <p>{s.p}</p>
                  </div>
                ))}
              </div>

              {/* title block = company card */}
              <div className="lab-tb">
                <div className="lab-tb-logo">
                  <img src={COMPANY.logo} alt={COMPANY.name} />
                </div>
                <div className="lab-tb-row two">
                  {COMPANY.architects.map((a) => (
                    <div key={a.name}>
                      <small>Principal Architect</small>
                      <b>{a.name}</b>
                      <a href={tel(a.phone)}>{a.phone}</a>
                    </div>
                  ))}
                </div>
                <div className="lab-tb-row">
                  <div>
                    <small>Studio</small>
                    <span>{COMPANY.address}</span>
                  </div>
                </div>
                <div className="lab-tb-row three">
                  <div>
                    <small>Call</small>
                    <a href={tel(COMPANY.phone)}>{COMPANY.phone}</a>
                  </div>
                  <div>
                    <small>Email</small>
                    <a href={"mailto:" + COMPANY.email}>{COMPANY.email}</a>
                  </div>
                  <div>
                    <small>Web</small>
                    <a
                      href={"https://" + COMPANY.web}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {COMPANY.web}
                    </a>
                  </div>
                </div>
                <div className="lab-stamp">
                  <span>Approved</span>
                  <em>Foundation to Finishing</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
