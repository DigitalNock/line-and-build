import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Words } from "./Words.jsx";
import { createGLRenderer, createCanvasRenderer } from "./sequenceRenderer.js";

/* ===================== sequence config ===================== */
export const FRAME_COUNT = 380; // frames 0000.webp … 0379.webp in public/sequence/desktop (and mobile)
// window.__SEQ_BASE lets a single-folder preview override the path (unused in the real project)
export const frameUrl = (i, set = "desktop") =>
  (typeof window !== "undefined" && window.__SEQ_BASE
    ? window.__SEQ_BASE
    : `sequence/${set}/`) +
  String(i).padStart(4, "0") +
  ".webp";
const LAST = FRAME_COUNT - 1;
// "contain" = always show the COMPLETE frame (soft blurred fill on the spare edges)
// "cover"   = fill the whole screen edge to edge (crops the frame to fit the screen shape)
const FIT_DESKTOP = "cover";
const FIT_MOBILE = "cover"; // on portrait phones "contain" shows a smaller band; switch to "cover" to fill the screen
const P0 = 0.03,
  P1 = 0.93; // hold on frame 0 before / last frame after
const f2p = (f) => P0 + (f / LAST) * (P1 - P0);
const p2f = (p) => Math.min(LAST, Math.max(0, ((p - P0) / (P1 - P0)) * LAST));

export const STAGES = [
  { n: "Groundwork", f: 0 },
  { n: "Pillars", f: 40 },
  { n: "Slab & Frame", f: 96 },
  { n: "Structure", f: 159 },
  { n: "Façade", f: 208 },
  { n: "Interiors", f: 266 },
];
const PANELS = [
  { hero: true, f: [0, 10] },
  {
    f: [10, 40],
    eyebrow: "01 — Groundwork",
    a: "Every landmark begins",
    b: "on open ground.",
    body: "Survey, soil investigation and precise setting-out. Footings are cast and starter bars rise from the earth, exactly where the drawings say.",
    chips: ["Soil investigation", "Isolated footings", "Vastu-aligned layout"],
  },
  {
    f: [40, 96],
    eyebrow: "02 — Pillars",
    a: "Columns that will carry",
    b: "generations.",
    body: "High-grade TMT steel, design-mix concrete and cube-tested pours. Every pillar is checked for plumb before the next lift.",
    chips: ["Fe 550D TMT steel", "M30–M40 concrete", "Plumb-checked"],
  },
  {
    f: [96, 159],
    eyebrow: "03 — Slab & Frame",
    a: "Strength you can",
    b: "stand beneath.",
    body: "Beams and slabs are poured monolithically over engineered shuttering, curing under watch before the frame climbs higher.",
    chips: ["Monolithic slabs", "Engineered shuttering", "Controlled curing"],
  },
  {
    f: [159, 208],
    eyebrow: "04 — Structure",
    a: "Floor by floor,",
    b: "rising true.",
    body: "The RCC frame climbs storey after storey on a disciplined pour cycle, designed for the seismic zone and inspected daily.",
    chips: ["Seismic-zone design", "Daily site QA", "Weekly reports"],
  },
  {
    f: [208, 266],
    eyebrow: "05 — Façade",
    a: "Glass, light and",
    b: "bold cladding.",
    body: "Aluminium-framed glazing and ACP cladding panels give the building its identity: weatherproof, low-maintenance and built to stay sharp.",
    chips: ["Aluminium glazing", "ACP cladding", "Weather sealed"],
  },
  {
    f: [266, 304],
    right: true,
    eyebrow: "06 — Interiors",
    a: "Living spaces,",
    b: "finished to perfection.",
    body: "Italian-marble flooring, fluted wood panelling, cove lighting and bespoke TV units, all designed in-house and executed by our own craftsmen.",
    chips: ["Italian marble", "Cove lighting", "Bespoke joinery"],
  },
  {
    f: [304, LAST],
    end: true,
    cta: true,
    right: true,
    eyebrow: "06 — Interiors",
    a: "Kitchens made",
    b: "for real life.",
    body: "Modular kitchens with quartz countertops, soft-close storage and task lighting, planned around how you cook and live.",
    chips: ["Modular kitchen", "Quartz counters", "Soft-close storage"],
  },
];
// moments where the camera crosses into a new space → subtle exposure flash
const FLASHES = [159, 266, 369];
// warm light-leak strength per frame (outdoor golden hour vs indoor)
const leakAt = (f) => (f < 208 ? 0.55 : f < 266 ? 0.42 : f < 368 ? 0.14 : 0.5);

/* ===================== frame loader ===================== */
function createLoader(set, onProgress) {
  const imgs = new Array(FRAME_COUNT).fill(null),
    loaded = new Uint8Array(FRAME_COUNT);
  const order = [];
  const seen = new Set();
  const push = (i) => {
    if (i >= 0 && i < FRAME_COUNT && !seen.has(i)) {
      seen.add(i);
      order.push(i);
    }
  };
  const FIRST = 10; // opening frames the hero needs right away
  for (let i = 0; i < FIRST; i++) push(i);
  [24, 12, 6, 3, 1].forEach((step) => {
    for (let i = 0; i < FRAME_COUNT; i += step) push(i);
  }); // coarse → fine (keeps loading in the background after the preloader lifts)
  // lift the preloader once the opening frames + a coarse pass (every 24th) are in
  const keyCount = FIRST + Math.ceil(FRAME_COUNT / 24);
  let done = 0,
    cursor = 0,
    active = 0,
    cancelled = false;
  const MAX = 10; // parallel image requests
  const next = () => {
    while (!cancelled && active < MAX && cursor < order.length) {
      const i = order[cursor++];
      active++;
      const im = new Image();
      im.decoding = "async";
      im.src = frameUrl(i, set);
      const fin = (ok) => {
        active--;
        if (ok) {
          imgs[i] = im;
          loaded[i] = 1;
        }
        done++;
        onProgress(Math.min(1, done / keyCount), done / FRAME_COUNT);
        next();
      };
      (im.decode
        ? im.decode()
        : new Promise((r, j) => {
            im.onload = r;
            im.onerror = j;
          })
      ).then(
        () => fin(true),
        () => fin(false),
      );
    }
  };
  next();
  const nearest = (i) => {
    if (loaded[i]) return imgs[i];
    for (let d = 1; d < FRAME_COUNT; d++) {
      if (i - d >= 0 && loaded[i - d]) return imgs[i - d];
      if (i + d < FRAME_COUNT && loaded[i + d]) return imgs[i + d];
    }
    return null;
  };
  return {
    get: nearest,
    exact: (i) => (loaded[i] ? imgs[i] : null),
    cancel: () => {
      cancelled = true;
    },
  };
}

const fmtTC = (f) => {
  const s = Math.floor(f / 24),
    fr = Math.floor(f % 24);
  return `00:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}:${String(fr).padStart(2, "0")}`;
};

/* ===================== component ===================== */
export function SequenceStory({ onProgress, onReady, mobile }) {
  const wrap = useRef(null),
    canvasRef = useRef(null),
    leak = useRef(null),
    flash = useRef(null),
    bars = useRef(null);
  const pct = useRef(null),
    stNum = useRef(null),
    stName = useRef(null),
    fnum = useRef(null),
    tc = useRef(null),
    trk = useRef(null),
    rail = useRef(null),
    cue = useRef(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const FIT = mobile ? FIT_MOBILE : FIT_DESKTOP;
    let readyFired = false,
      lastSent = -1;
    const fireReady = () => {
      if (readyFired) return;
      readyFired = true;
      onReady && onReady();
    };
    // safety net: never hold the preloader longer than this on slow networks
    const maxWait = setTimeout(fireReady, 2500);
    const loader = createLoader(mobile ? "mobile" : "desktop", (key, all) => {
      if (onProgress && !readyFired && key - lastSent >= 0.02) {
        lastSent = key;
        onProgress(key);
      }
      if (key >= 1) fireReady();
    });

    /* ---- renderer: Three.js WebGL shader, or 2D fallback ---- */
    let R;
    try {
      R = createGLRenderer(canvas, { mobile, fit: FIT });
      wrap.current.classList.add("gl");
    } catch (e) {
      console.warn("WebGL unavailable, using 2D canvas", e);
      R = createCanvasRenderer(canvas, { fit: FIT });
    }
    const resize = () => R.resize();
    window.addEventListener("resize", resize);

    /* ---- render state ---- */
    let target = 0,
      cur = 0,
      lastCur = 0,
      vel = 0,
      dir = 1,
      mx = 0,
      my = 0,
      smx = 0,
      smy = 0,
      raf = 0,
      t0 = performance.now();
    const onMove = (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove);
    const visible = () => {
      const r = canvas.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };

    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible()) return;
      const t = (performance.now() - t0) / 1000;
      cur += (target - cur) * 0.16;
      if (Math.abs(target - cur) < 0.002) cur = target;
      const step = cur - lastCur;
      if (Math.abs(step) > 0.001) dir = step > 0 ? 1 : -1;
      vel += (Math.abs(step) - vel) * 0.25;
      lastCur = cur;
      smx += (mx - smx) * 0.05;
      smy += (my - smy) * 0.05;

      const fA = Math.floor(cur),
        fB = Math.min(LAST, fA + 1);
      const a = loader.exact(fA),
        b = loader.exact(fB);
      const leakV = leakAt(cur) * (0.85 + 0.15 * Math.sin(t * 0.7));
      R.draw({
        a: a || loader.get(Math.round(cur)),
        b: a && b ? b : null,
        mix: cur - fA,
        vel,
        dir,
        time: t,
        mx: smx,
        my: smy,
        // contain: no zoom / drift, so nothing gets cut off
        scale: FIT === "contain"
          ? 1
          : 1.045 * (1 + 0.012 * Math.sin(t * 0.35)) + Math.min(0.07, vel * 0.02), // breathing + speed push-in
        ox: FIT === "contain" ? 0 : -smx * 22 + Math.sin(t * 0.6) * 1.6,
        oy: FIT === "contain" ? 0 : -smy * 14 + Math.cos(t * 0.5) * 1.2, // parallax + handheld micro-shake
        leak: leakV,
      });
      // CSS light leak only used by the 2D fallback (the shader draws its own)
      if (R.kind === "2d" && leak.current) {
        leak.current.style.opacity = leakV.toFixed(3);
        leak.current.style.transform = `translate(${(-smx * 40 + Math.sin(t * 0.2) * 30).toFixed(1)}px, ${(Math.cos(t * 0.17) * 20).toFixed(1)}px)`;
      }
    };
    render();

    /* ---- HUD ---- */
    let lastStage = -1;
    const railEls = Array.from(rail.current.children);
    const hud = (p, f) => {
      let si = 0;
      STAGES.forEach((s, i) => {
        if (f >= s.f) si = i;
      });
      if (si !== lastStage) {
        lastStage = si;
        railEls.forEach((el, i) => {
          el.classList.toggle("act", i === si);
          el.classList.toggle("done", i < si);
        });
        stNum.current.textContent = "0" + (si + 1);
        stName.current.textContent = STAGES[si].n;
      }
      pct.current.innerHTML = Math.round(p * 100) + "<sup>%</sup>";
      fnum.current.textContent = String(Math.round(f)).padStart(4, "0");
      tc.current.textContent = fmtTC(f);
      trk.current.style.transform = `scaleX(${p})`;
      cue.current.style.opacity = p < 0.01 ? 1 : 0;
    };

    /* ---- GSAP scroll timeline ---- */
    const gctx = gsap.context(() => {
      const panels = gsap.utils.toArray(".panel", wrap.current);
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => "+=" + window.innerHeight * (mobile ? 11 : 14),
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate() {
          const p = tl.progress();
          const f = p2f(p);
          target = f;
          hud(p, f);
        },
      });
      tl.to({}, { duration: 1 }, 0);
      // cinematic letterbox: opens slightly as we enter, closes on the reveal
      tl.fromTo(
        bars.current,
        { "--bar": "0vh" },
        { "--bar": mobile || FIT === "contain" ? "0vh" : "5.5vh", duration: 0.03, ease: "none" },
        0,
      ).to(
        bars.current,
        { "--bar": "0vh", duration: 0.04, ease: "none" },
        f2p(364),
      );
      PANELS.forEach((pn, i) => {
        const el = panels[i];
        const a = pn.hero ? 0 : f2p(pn.f[0]);
        const b = pn.end ? 1 : f2p(pn.f[1]);
        const words = el.querySelectorAll(".w"),
          rest = el.querySelectorAll(".eyebrow, p, .chip, .cta");
        if (!pn.hero) {
          tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.004 }, a);
          tl.fromTo(
            words,
            { yPercent: 115 },
            { yPercent: 0, stagger: 0.0011, duration: 0.016 },
            a,
          );
          tl.fromTo(
            rest,
            { y: 28, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, stagger: 0.0014, duration: 0.014 },
            a + 0.004,
          );
        }
        if (!pn.end) {
          tl.to(
            words,
            {
              yPercent: -115,
              stagger: 0.0007,
              duration: 0.011,
              ease: "power2.in",
            },
            b - 0.015,
          );
          tl.to(
            rest,
            { y: -22, autoAlpha: 0, duration: 0.009, ease: "power2.in" },
            b - 0.015,
          );
          tl.to(el, { autoAlpha: 0, duration: 0.003 }, b - 0.003);
        }
      });
      FLASHES.forEach((f) =>
        tl
          .fromTo(
            flash.current,
            { opacity: 0 },
            {
              opacity: 0.22,
              duration: 0.004,
              ease: "power1.in",
              immediateRender: false,
            },
            f2p(f) - 0.004,
          )
          .to(flash.current, {
            opacity: 0,
            duration: 0.012,
            ease: "power2.out",
          }),
      );
      // gentle push on the final held frame
      if (FIT !== "contain")
        tl.fromTo(
          canvas,
          { scale: 1 },
          { scale: 1.06, duration: 1 - P1, ease: "none" },
          P1,
        );
    }, wrap);

    hud(0, 0);
    return () => {
      cancelAnimationFrame(raf);
      loader.cancel();
      clearTimeout(maxWait);
      R.dispose();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      gctx.revert();
    };
  }, []);

  return (
    <section className="story" ref={wrap} id="top">
      <canvas className="story-canvas" ref={canvasRef} />
      <div className="leak" ref={leak} />
      <div className="flash" ref={flash} />
      <div className="vignette" />
      <div className="grain" />
      <div className="scrim" />
      <div className="bars" ref={bars}>
        <i />
        <i />
      </div>
      <div className="panels">
        {PANELS.map((pn, i) =>
          pn.hero ? (
            <div className="panel hero" key={i}>
              <div className="eyebrow">
                Architecture · Construction · Interiors
              </div>
              <h1>
                <Words text="From the first dig" />
                <br />
                <Words text="to the" />{" "}
                <em>
                  <Words text="final detail." />
                </em>
              </h1>
              <p>
                We design, engineer and build premium residential and commercial
                spaces end to end. Scroll to walk through a building as it
                rises.
              </p>
              <div className="cta">
                <a href="#contact" className="btn light fill" data-magnetic>
                  Start your project
                </a>
                <a href="#gallery" className="btn light" data-magnetic>
                  View the project
                </a>
              </div>
            </div>
          ) : (
            <div className={"panel" + (pn.right ? " right" : "")} key={i}>
              <div className="eyebrow">{pn.eyebrow}</div>
              <h2>
                <Words text={pn.a} />{" "}
                <em>
                  <Words text={pn.b} />
                </em>
              </h2>
              <p>{pn.body}</p>
              {pn.chips && (
                <div className="chips">
                  {pn.chips.map((c) => (
                    <span className="chip" key={c}>
                      {c}
                    </span>
                  ))}
                </div>
              )}
              {pn.cta && (
                <div className="cta">
                  <a href="#contact" className="btn light fill" data-magnetic>
                    Build with us
                  </a>
                  <a href="#services" className="btn light" data-magnetic>
                    Our services
                  </a>
                </div>
              )}
            </div>
          ),
        )}
      </div>
      <div className="rail" ref={rail}>
        {STAGES.map((s, i) => (
          <div className="st" key={s.n}>
            <span className="lbl">{s.n}</span>
            <b>0{i + 1}</b>
            <span className="dot" />
          </div>
        ))}
      </div>
      <div className="meter">
        <div className="big" ref={pct}>
          0<sup>%</sup>
        </div>
        <div className="meta">
          <div>
            Chapter <b ref={stNum}>01</b> / 06 — <b ref={stName}>Groundwork</b>
          </div>
          <div>
            <span className="rec" /> Frame <b ref={fnum}>0000</b> /{" "}
            {String(LAST).padStart(4, "0")} · <span ref={tc}>00:00:00:00</span>
          </div>
          <div className="track">
            <i ref={trk} />
          </div>
        </div>
      </div>
      <div className="cue" ref={cue}>
        <span>Scroll to build</span>
        <i />
      </div>
    </section>
  );
}
