import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heading } from "./Words.jsx";
import { frameUrl } from "./SequenceStory.jsx";
import "./sections-brand.css";

/* =====================================================================
   LINE AND BUILD — company details (edit here, used across the site)
   ===================================================================== */
export const COMPANY = {
  name: "Line And Build",
  tagline: "From Foundation to Finishing Touches",
  logo: "brand/logo.png", // dark logo for light backgrounds
  logoLight: "brand/logo-light.png", // light logo for dark backgrounds
  architects: [
    { name: "Ar. Mohammed Inayath", phone: "+91 74119 31018" },
    { name: "Ar. Sunil Kumar Rathor", phone: "+91 74111 83117" },
  ],
  address:
    "#37, 1st Stage, NTI Layout RMV Extension, Bhoopasandra, Sanjayanagara, Bangalore – 560094",
  phone: "+91 74117 50986",
  email: "design@linenbuild.com", // as printed on the card — check spelling
  web: "www.lineandbuild.com",
};
const tel = (n) => "tel:" + n.replace(/\s/g, "");

/* Client's services */
/* Client's services: images live in public/services/ */
const svcImg = (name) => `services/${encodeURIComponent(name)}`;

export const SERVICES = [
  {
    key: "architecture",
    title: "Architecture",
    lead: "All sorts of design",
    text: "From the first concept sketch to complete working drawings, we design spaces that are practical to build and a pleasure to live and work in.",
    items: [
      "Residential design",
      "Commercial design",
      "Planning & layouts",
      "Elevations & façades",
    ],
    img: svcImg("architecture.jpg"),
  },
  {
    key: "construction",
    title: "Construction",
    lead: "Residential & commercial",
    text: "Our own site teams build homes and commercial spaces from foundation to finish, with quality checks at every stage.",
    items: [
      "Residential construction",
      "Commercial construction",
      "Foundation to finish",
      "Quality supervision",
    ],
    img: svcImg("construction.jpg"),
  },
  {
    key: "interiors",
    title: "Interiors",
    lead: "Residential · commercial · corporate",
    text: "Interiors planned, designed and executed in-house, so the finished space matches the drawing, down to the last detail.",
    items: [
      "Residential interiors",
      "Commercial interiors",
      "Corporate interiors",
      "Turnkey execution",
    ],
    img: svcImg("interiors.jpg"),
  },
];
/* gallery images live in public/gallery/ (file name = title + .png) */
const STILLS = [
  {
    img: "the-finished-building.png",
    title: "The finished building",
    tag: "Exterior",
  },
  {
    img: "the-frame-tops-out.png",
    title: "The frame tops out",
    tag: "Structure",
  },
  {
    img: "glass-cladding.png",
    title: "Glass & ACP cladding",
    tag: "Façade",
  },
  { img: "living-room.png", title: "Living room", tag: "Interior" },
  { img: "modular-kitchen.png", title: "Modular kitchen", tag: "Interior" },
  {
    img: "pillars-at-golden-hour.png",
    title: "Pillars at golden hour",
    tag: "Construction",
  },
];
const galleryUrl = (name) => `gallery/${encodeURIComponent(name)}`;
/* ---------- loader (shows real frame-loading progress) ---------- */
export function Loader({ progress, ready, onDone }) {
  const root = useRef(null),
    count = useRef(null),
    bar = useRef(null),
    shown = useRef({ v: 0 }),
    target = useRef(0);
  target.current = ready ? 100 : Math.round((progress || 0) * 96);
  useEffect(() => {
    const o = shown.current;
    let raf,
      finished = false;
    const tick = () => {
      o.v += (target.current - o.v) * 0.2; // counter speed (higher = faster)
      if (Math.abs(target.current - o.v) < 0.3) o.v = target.current;
      if (count.current) count.current.textContent = Math.round(o.v);
      if (bar.current) bar.current.style.transform = `scaleX(${o.v / 100})`;
      if (o.v >= 100 && !finished) {
        finished = true;
        gsap
          .timeline({ onComplete: onDone })
          .to(root.current.querySelectorAll(".mid, .top, .bot"), {
            y: -30,
            autoAlpha: 0,
            stagger: 0.04,
            duration: 0.35,
            ease: "power3.in",
          })
          .to(
            root.current,
            { yPercent: -100, duration: 0.7, ease: "power4.inOut" },
            "-=.15",
          )
          .set(root.current, { display: "none" });
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="loader lb-loader" ref={root}>
      <div className="top">
        <span>{COMPANY.name}</span>
        <span>{COMPANY.tagline}</span>
      </div>
      <div className="mid">
        <img src={COMPANY.logoLight} alt={COMPANY.name} />
      </div>
      <div className="bot">
        <div className="count" ref={count}>
          0
        </div>
        <div className="bar">
          <i ref={bar} />
        </div>
        <span className="lb-loader-city">Bengaluru</span>
      </div>
    </div>
  );
}

/* ---------- custom cursor + magnetic buttons ---------- */
export function Cursor() {
  const dot = useRef(null),
    ring = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(hover:none)").matches) return;
    const xd = gsap.quickTo(dot.current, "x", { duration: 0.12 }),
      yd = gsap.quickTo(dot.current, "y", { duration: 0.12 });
    const xr = gsap.quickTo(ring.current, "x", {
        duration: 0.45,
        ease: "power3",
      }),
      yr = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });
    const move = (e) => {
      xd(e.clientX);
      yd(e.clientY);
      xr(e.clientX);
      yr(e.clientY);
      const t =
        e.target.closest &&
        e.target.closest("a,button,[data-magnetic],.g-card,.lb-svc");
      ring.current.classList.toggle("big", !!t);
    };
    const mag = (e) => {
      const b = e.target.closest && e.target.closest("[data-magnetic]");
      document.querySelectorAll("[data-magnetic]").forEach((el) => {
        if (el !== b)
          gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,.4)" });
      });
      if (!b) return;
      const r = b.getBoundingClientRect();
      gsap.to(b, {
        x: (e.clientX - r.left - r.width / 2) * 0.28,
        y: (e.clientY - r.top - r.height / 2) * 0.35,
        duration: 0.4,
        ease: "power3",
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointermove", mag);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointermove", mag);
    };
  }, []);
  return (
    <>
      <div className="cursor" ref={dot} />
      <div className="cursor-ring" ref={ring} />
    </>
  );
}

/* ---------- header ---------- */
export function Header({ onNav }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        const story = document.querySelector(".story");
        const past = story ? story.getBoundingClientRect().bottom < 90 : y > 60;
        ref.current.classList.toggle("solid", past);
        ref.current.classList.toggle("over-film", !past);
        ref.current.classList.toggle("hide", self.direction === 1 && y > 300);
      },
    });
    return () => st.kill();
  }, []);
  const go = (e) => {
    const h = e.currentTarget.getAttribute("href");
    if (h && h[0] === "#") {
      e.preventDefault();
      setOpen(false);
      onNav(h);
    }
  };
  return (
    <header className="hdr over-film" ref={ref}>
      <a
        href="#top"
        className="logo lb-logo"
        onClick={go}
        aria-label={COMPANY.name}
      >
        <img className="l-light" src={COMPANY.logoLight} alt={COMPANY.name} />
        <img className="l-dark" src={COMPANY.logo} alt="" aria-hidden="true" />
      </a>
      <nav className={"nav" + (open ? " open" : "")}>
        {[
          ["#about", "About"],
          ["#services", "Services"],
          ["#sectors", "Residential & Commercial"],
          ["#gallery", "Projects"],
          ["#contact", "Contact"],
        ].map(([h, l]) => (
          <a key={h} href={h} onClick={go}>
            {l}
          </a>
        ))}
      </nav>
      <a href="#contact" className="btn hdr-cta" onClick={go} data-magnetic>
        Book a consultation
      </a>
      <button
        className="menu-btn"
        aria-label="Menu"
        onClick={() => setOpen(!open)}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          stroke="currentColor"
          strokeWidth="1.4"
        >
          <path d="M3 9h20M3 17h20" />
        </svg>
      </button>
    </header>
  );
}

/* ---------- marquee (client's services) ---------- */
export function Marquee() {
  const track = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tw = gsap.to(track.current, {
        xPercent: -50,
        ease: "none",
        duration: 34,
        repeat: -1,
      });
      ScrollTrigger.create({
        trigger: track.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = Math.min(6, 1 + Math.abs(self.getVelocity()) / 400);
          gsap.to(tw, {
            timeScale: self.direction === -1 ? -v : v,
            duration: 0.3,
            overwrite: true,
          });
          gsap.to(tw, {
            timeScale: self.direction === -1 ? -1 : 1,
            duration: 1.2,
            delay: 0.3,
          });
        },
      });
    });
    return () => ctx.revert();
  }, []);
  const items = [
    "Architecture <em>& Design</em>",
    "Residential <em>Construction</em>",
    "Commercial <em>Construction</em>",
    "Residential <em>Interiors</em>",
    "Commercial <em>Interiors</em>",
    "Corporate <em>Interiors</em>",
  ];
  const row = items.map((t, i) => (
    <span key={i} dangerouslySetInnerHTML={{ __html: t }} />
  ));
  return (
    <div className="marquee lb-marquee">
      <div className="track" ref={track}>
        {row}
        {row.map((r, i) => React.cloneElement(r, { key: "b" + i }))}
      </div>
    </div>
  );
}
/* ---------- key facts (true facts only — edit when you have real numbers) ---------- */
const FACTS = [
  {
    n: 4,
    k: "Core services",
    t: "Architecture, construction and interiors under one roof",
  },
  {
    n: 3,
    k: "Principal architects",
    t: "Personally leading every project we take on",
  },
  { n: 2, k: "Sectors", t: "Residential homes and commercial spaces" },
  { n: 1, k: "Team", t: "From the first dig to the finishing touches" },
];

export function Stats() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
      tl.from(".lbf-head > *", {
        y: 30,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: "power3.out",
      })
        .from(
          ".lbf-item",
          {
            y: 40,
            autoAlpha: 0,
            stagger: 0.12,
            duration: 0.9,
            ease: "power3.out",
          },
          "-=.5",
        )
        .from(
          ".lbf-dim",
          {
            scaleX: 0,
            transformOrigin: "left center",
            stagger: 0.12,
            duration: 1,
            ease: "power2.inOut",
          },
          "-=.9",
        );

      ref.current.querySelectorAll("[data-count]").forEach((el, i) => {
        const end = parseFloat(el.dataset.count),
          o = { v: 0 };
        el.textContent = "00";
        tl.to(
          o,
          {
            v: end,
            duration: 1.6,
            ease: "power3.out",
            onUpdate: () => {
              el.textContent = String(Math.round(o.v)).padStart(2, "0");
            },
          },
          0.4 + i * 0.12,
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="lbf" ref={ref}>
      <div className="lbf-grid" aria-hidden="true" />
      <div className="lbf-wrap">
        <header className="lbf-head">
          <div>
            <span className="lbf-eyebrow">At a glance</span>
            <h2 className="lbf-title">
              A small studio, <em>hands-on</em> from start to finish.
            </h2>
          </div>
          <p className="lbf-intro">
            No hand-offs between firms. The people who draw your project are the
            people who build it.
          </p>
        </header>

        <div className="lbf-row">
          {FACTS.map((f, i) => (
            <article className="lbf-item" key={f.k}>
              <b className="lbf-num" data-count={f.n}>
                {String(f.n).padStart(2, "0")}
              </b>
              <i className="lbf-dim" aria-hidden="true" />
              <h3 className="lbf-key">{f.k}</h3>
              <p className="lbf-text">{f.t}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
/* ---------- residential / commercial: drag-to-compare ---------- */
/* images live in public/sectors/ (16:9, e.g. 1920×1080) */
const sectorImg = (name) => `sectors/${encodeURIComponent(name)}`;

const SECTORS = [
  {
    side: "res",
    img: sectorImg("residential.jpg"),
    tag: "Residential",
    title: "Homes & Residences",
    text: "Independent houses, villas and apartments, designed, built and finished around the way your family lives.",
    list: ["Architecture", "Construction", "Residential interiors"],
  },
  {
    side: "com",
    img: sectorImg("commercial.jpg"),
    tag: "Commercial",
    title: "Commercial & Corporate",
    text: "Commercial buildings, offices and corporate interiors, planned for the way your business works and built to schedule.",
    list: [
      "Commercial design",
      "Commercial construction",
      "Corporate interiors",
    ],
  },
];

export function Sectors() {
  const ref = useRef(null),
    frame = useRef(null),
    split = useRef({ v: 50 });

  const setSplit = (v) => {
    split.current.v = Math.min(92, Math.max(8, v));
    frame.current.style.setProperty("--s", split.current.v);
  };
  const goTo = (v) =>
    gsap.to(split.current, {
      v,
      duration: 0.9,
      ease: "power3.inOut",
      onUpdate: () => setSplit(split.current.v),
    });

  useLayoutEffect(() => {
    const el = frame.current;
    const ctx = gsap.context(() => {
      // frame opens up as it scrolls in, then the divider sweeps once as a hint
      gsap.fromTo(
        el,
        { clipPath: "inset(10% 8% 10% 8%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "top 35%",
            scrub: 1,
          },
        },
      );
      gsap
        .timeline({
          scrollTrigger: { trigger: el, start: "top 45%", once: true },
        })
        .to(split.current, {
          v: 66,
          duration: 0.9,
          ease: "power2.inOut",
          onUpdate: () => setSplit(split.current.v),
        })
        .to(split.current, {
          v: 34,
          duration: 1.1,
          ease: "power2.inOut",
          onUpdate: () => setSplit(split.current.v),
        })
        .to(split.current, {
          v: 50,
          duration: 0.8,
          ease: "power2.out",
          onUpdate: () => setSplit(split.current.v),
        });
      // gentle settle-in zoom (no vertical drift, so the 16:9 image is never cut off)
      gsap.fromTo(
        el.querySelectorAll(".lbs-img"),
        { scale: 1.05 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "center center",
            scrub: true,
          },
        },
      );
    }, ref);

    // drag
    let dragging = false;
    const move = (e) => {
      if (!dragging) return;
      const r = el.getBoundingClientRect();
      setSplit(((e.clientX - r.left) / r.width) * 100);
    };
    const down = (e) => {
      dragging = true;
      gsap.killTweensOf(split.current);
      el.classList.add("is-drag");
      move(e);
    };
    const up = () => {
      dragging = false;
      el.classList.remove("is-drag");
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      ctx.revert();
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <section id="sectors" className="lbs" ref={ref}>
      <div className="lbs-wrap">
        <div className="lbs-head">
          <div>
            <div className="eyebrow">What we build</div>
            <Heading a="Homes and" b="workplaces." />
          </div>
          <p data-reveal>
            Whether it's a family home or a corporate office, architecture,
            construction and interiors stay with one team, under one roof.
          </p>
        </div>

        <div className="lbs-frame" ref={frame} style={{ "--s": 50 }}>
          <i className="lbs-crop tl" />
          <i className="lbs-crop tr" />
          <i className="lbs-crop bl" />
          <i className="lbs-crop br" />

          {SECTORS.map((s) => (
            <div className={`lbs-pane ${s.side}`} key={s.side}>
              <div
                className="lbs-img"
                style={{ backgroundImage: `url("${s.img}")` }}
              />
              <div className="lbs-copy">
                <small>{s.tag}</small>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
                <ul>
                  {s.list.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          <div className="lbs-divider" aria-hidden="true">
            <span className="lbs-handle">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M9 6l-6 6 6 6M15 6l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </span>
          </div>
          <span className="lbs-hint">Drag to compare</span>
        </div>

        <div className="lbs-switch">
          <button onClick={() => goTo(82)}>
            <b>01</b> Residential
          </button>
          <button onClick={() => goTo(50)} className="mid">
            Both
          </button>
          <button onClick={() => goTo(18)}>
            Commercial <b>02</b>
          </button>
        </div>
      </div>
    </section>
  );
}
/* ---------- services: three expanding panels ---------- */
export function Services() {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".lb-svc", {
        y: 90,
        autoAlpha: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".lb-svcs", start: "top 80%" },
      });
      gsap.fromTo(
        ".lb-svc-icon path",
        { strokeDasharray: 220, strokeDashoffset: 220 },
        {
          strokeDashoffset: 0,
          duration: 1.8,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".lb-svcs", start: "top 75%" },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  const ICONS = {
    architecture: "M4 38h34M8 38V14l13-9 13 9v24M15 38V24h12v14M28 8l6 6",
    construction:
      "M6 38h30M10 38V8h6v30M26 38V16h6v22M10 14h6M10 22h6M10 30h6M26 22h6M26 30h6",
    interiors:
      "M6 30h30v6H6zM9 30v-8a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v8M21 4v6M15 10h12l-2 4H17z",
  };
  return (
    <section id="services" className="pad lb-services" ref={ref}>
      <div className="sec-head">
        <div className="eyebrow">Services</div>
        <Heading a="Architecture, construction" b="& interiors." />
        <p data-reveal>
          Three services, one accountable team. Hire us for one, or let us take
          your project from the first line on paper to the last finishing touch.
        </p>
      </div>
      <div className="lb-svcs">
        {SERVICES.map((s, i) => (
          <article
            key={s.key}
            className={"lb-svc" + (i === active ? " on" : "")}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            onFocus={() => setActive(i)}
            tabIndex={0}
          >
            <div
              className={"lb-svc-img " + (s.imgClass || "")}
              style={{ backgroundImage: `url(${s.img})` }}
            />
            <div className="lb-svc-shade" />
            <div className="lb-svc-top">
              <span className="lb-svc-n">0{i + 1}</span>
              <svg className="lb-svc-icon" viewBox="0 0 42 42">
                <path d={ICONS[s.key]} />
              </svg>
            </div>
            <div className="lb-svc-body">
              <small>{s.lead}</small>
              <h3>{s.title}</h3>
              <div className="lb-svc-more">
                <div>
                  <p>{s.text}</p>
                  <ul>
                    {s.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                  <a href="#contact" className="lb-svc-cta">
                    Enquire about {s.title.toLowerCase()} →
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- horizontal gallery ---------- */
export function Gallery() {
  const ref = useRef(null),
    track = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const dist = () =>
        Math.max(0, track.current.scrollWidth - window.innerWidth);
      const tw = gsap.to(track.current, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: () => "+=" + dist(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      gsap.utils.toArray(".g-card .frame div").forEach((img) =>
        gsap.fromTo(
          img,
          { xPercent: -4 },
          {
            xPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger: img.parentNode,
              containerAnimation: tw,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          },
        ),
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section id="gallery" className="gallery lb-gallery" ref={ref}>
      <div className="sec-head">
        <div className="eyebrow">Projects</div>
        <Heading a="The project," b="frame by frame." />
        <p data-reveal>
          Moments from the build you just walked through, from the first pillars
          to the finished living spaces.
        </p>
      </div>
      <div className="g-track" ref={track}>
        {STILLS.map((s) => (
          <div className="g-card" key={s.title}>
            <div className="frame">
              <div style={{ backgroundImage: `url("${galleryUrl(s.img)}")` }} />
            </div>
            <div className="cap">
              <h6>{s.title}</h6>
              <span>{s.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
/* ---------- materials: library viewer ---------- */
const MATS = [
  {
    id: "marble",
    name: "Italian Marble",
    note: "Mirror-polished flooring",
    svc: "Interiors",
  },
  {
    id: "wood",
    name: "Fluted Wood Panelling",
    note: "Feature walls & TV units",
    svc: "Interiors",
  },
  {
    id: "stone",
    name: "Textured Stone Finish",
    note: "Hand-applied wall texture",
    svc: "Interiors",
  },
  {
    id: "concrete",
    name: "Design-mix Concrete",
    note: "Cube-tested quality",
    svc: "Construction",
  },
  {
    id: "cladding",
    name: "ACP Façade Cladding",
    note: "Weatherproof, colour-fast",
    svc: "Construction",
  },
  {
    id: "glass",
    name: "Aluminium Glazing",
    note: "Slim frames, clear views",
    svc: "Construction",
  },
];
const MAT_SVCS = ["All", "Construction", "Interiors"];
const matUrl = (id) => `materials/${id}.webp`;
const pad2 = (n) => String(n).padStart(2, "0");

export function Materials() {
  const ref = useRef(null),
    stage = useRef(null),
    lens = useRef(null);
  const [cur, setCur] = useState({ a: 0, p: 0 }); // active + previous (for the wipe)
  const [svc, setSvc] = useState("All");
  const [auto, setAuto] = useState(true);
  const active = MATS[cur.a];

  const show = (i) => setCur((c) => (c.a === i ? c : { a: i, p: c.a }));
  const pick = (i) => {
    setAuto(false);
    show(i);
  };
  const pickSvc = (s) => {
    setAuto(false);
    setSvc(s);
    const first = MATS.findIndex((m) => s === "All" || m.svc === s);
    if (first > -1 && !(s === "All" || MATS[cur.a].svc === s)) show(first);
  };

  // autoplay until the visitor interacts
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(
      () => setCur((c) => ({ a: (c.a + 1) % MATS.length, p: c.a })),
      3800,
    );
    return () => clearInterval(t);
  }, [auto]);

  // entrance
  // entrance (elements stay visible if the trigger never fires)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const opts = {
        immediateRender: false,
        clearProps: "transform,opacity,visibility",
      };
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ".lbm-body", start: "top 85%", once: true },
      });
      tl.from(".lbm-chips button", {
        y: 20,
        autoAlpha: 0,
        stagger: 0.06,
        duration: 0.6,
        ease: "power3.out",
        ...opts,
      })
        .from(
          ".lbm-row",
          {
            x: -30,
            autoAlpha: 0,
            stagger: 0.07,
            duration: 0.7,
            ease: "power3.out",
            ...opts,
          },
          "-=.3",
        )
        .from(
          ".lbm-cap",
          { y: 30, autoAlpha: 0, duration: 0.8, ease: "power3.out", ...opts },
          0.3,
        );
    }, ref);
    const t = setTimeout(() => ScrollTrigger.refresh(), 600); // re-measure after pinned sections above are set up
    return () => {
      ctx.revert();
      clearTimeout(t);
    };
  }, []);

  // magnifier lens
  const ZOOM = 2.4,
    L = 180;
  const onMove = (e) => {
    const r = stage.current.getBoundingClientRect(),
      el = lens.current;
    const x = e.clientX - r.left,
      y = e.clientY - r.top;
    el.style.transform = `translate(${x - L / 2}px, ${y - L / 2}px)`;
    el.style.backgroundSize = `${r.width * ZOOM}px ${r.height * ZOOM}px`;
    el.style.backgroundPosition = `${-(x * ZOOM - L / 2)}px ${-(y * ZOOM - L / 2)}px`;
  };

  return (
    <section
      id="materials"
      className={`lbm${auto ? " is-auto" : ""}`}
      ref={ref}
    >
      <div className="lbm-wrap">
        <div className="lbm-head">
          <div>
            <div className="eyebrow">Materials</div>
            <Heading a="Finishes that" b="last." />
          </div>
          <p data-reveal>
            Every swatch here is taken from a real project. We specify, source
            and inspect each material ourselves.
          </p>
        </div>

        <div className="lbm-body">
          {/* left: spec list */}
          <div className="lbm-side">
            <div className="lbm-chips">
              {MAT_SVCS.map((s) => (
                <button
                  key={s}
                  className={svc === s ? "on" : ""}
                  onClick={() => pickSvc(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <ol className="lbm-list">
              {MATS.map((m, i) => {
                const dim = svc !== "All" && m.svc !== svc;
                return (
                  <li key={m.id}>
                    <button
                      className={`lbm-row${i === cur.a ? " on" : ""}${dim ? " dim" : ""}`}
                      onClick={() => pick(i)}
                      onMouseEnter={() => !dim && !auto && show(i)}
                      disabled={dim}
                    >
                      <span className="n">{pad2(i + 1)}</span>
                      <span className="t">{m.name}</span>
                      <span className={`s ${m.svc.toLowerCase()}`}>
                        {m.svc}
                      </span>
                      {i === cur.a && (
                        <i key={cur.a + String(auto)} className="bar" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* right: sample stage */}
          <div className="lbm-view">
            <div className="lbm-stage" ref={stage} onPointerMove={onMove}>
              {MATS.map((m, i) => (
                <div
                  key={m.id}
                  className={`lbm-sw${i === cur.a ? " on" : i === cur.p ? " prev" : ""}`}
                  style={{ backgroundImage: `url(${matUrl(m.id)})` }}
                />
              ))}
              <div
                className="lbm-lens"
                ref={lens}
                style={{ backgroundImage: `url(${matUrl(active.id)})` }}
              />
              <span className="lbm-count">
                {pad2(cur.a + 1)} <em>/ {pad2(MATS.length)}</em>
              </span>
              <span className="lbm-zoom">Hover to inspect</span>
            </div>
            <div className="lbm-cap" key={cur.a}>
              <div>
                <span className={`lbm-svc ${active.svc.toLowerCase()}`}>
                  {active.svc}
                </span>
                <h4>{active.name}</h4>
              </div>
              <p>{active.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
/* ---------- process ---------- */
const STEPS = [
  ["Consult", "We understand your brief, site and budget."],
  ["Design", "Concepts, plans, elevations and 3D views."],
  ["Approve", "Final drawings, estimate and approvals."],
  ["Build", "Foundation to structure, supervised on site."],
  ["Finish", "Interiors, façade and finishing touches."],
  ["Handover", "Final checks and keys in your hand."],
];
export function Process() {
  const ref = useRef(null),
    path = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray(".step");
      gsap.fromTo(
        path.current,
        { attr: { x2: 0 } },
        {
          attr: { x2: 100 },
          ease: "none",
          scrollTrigger: {
            trigger: ".process",
            start: "top 75%",
            end: "bottom 45%",
            scrub: 1,
            onUpdate: (self) =>
              steps.forEach((s, i) =>
                s.classList.toggle(
                  "on",
                  self.progress >= i / steps.length + 0.02,
                ),
              ),
          },
        },
      );
      gsap.from(steps, {
        y: 50,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".process", start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section id="process" className="pad lb-process" ref={ref}>
      <div className="sec-head">
        <div className="eyebrow">Process</div>
        <Heading a="A calm," b="clear process." />
        <p data-reveal>
          Six stages, one point of contact and complete transparency on cost and
          timelines from day one.
        </p>
      </div>
      <div className="process">
        <svg className="line" viewBox="0 0 100 2" preserveAspectRatio="none">
          <line
            x1="0"
            y1="1"
            x2="100"
            y2="1"
            stroke="rgba(88,88,86,.18)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          <line
            ref={path}
            x1="0"
            y1="1"
            x2="0"
            y2="1"
            stroke="#EFCC18"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {STEPS.map(([t, d], i) => (
          <div className="step" key={t}>
            <div className="d">
              <b>0{i + 1}</b>
            </div>
            <h6>{t}</h6>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- contact ---------- */
export function Contact() {
  const [type, setType] = useState("Architecture");
  const [errs, setErrs] = useState({});
  const [ok, setOk] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const name = f.nm.value.trim(),
      phone = f.ph.value.replace(/\D/g, "");
    const er = { nm: !name, ph: phone.length < 10 };
    setErrs(er);
    if (er.nm || er.ph) {
      setOk("");
      return;
    }
    // TODO: send to your backend / CRM here, e.g. fetch('/api/enquiry', { method: 'POST', body: new FormData(f) })
    setOk(
      `Thank you, ${name}. Your ${type.toLowerCase()} enquiry is ready. Connect this form to your backend to receive it.`,
    );
  };
  return (
    <section id="contact" className="contact pad lb-contact">
      <div>
        <div className="eyebrow">Start a project</div>
        <Heading a="Let's build" b="something lasting." />
        <p data-reveal className="lb-contact-lead">
          Tell us about your plot or space. Our architects will review it and
          set up a consultation.
        </p>
        <div className="info" data-reveal>
          <div>
            <small>Studio</small>
            {COMPANY.address}
          </div>
          <div>
            <small>Call</small>
            <a href={tel(COMPANY.phone)}>{COMPANY.phone}</a>
          </div>
          <div>
            <small>Write</small>
            <a href={"mailto:" + COMPANY.email}>{COMPANY.email}</a>
          </div>
          <div className="lb-arch">
            {COMPANY.architects.map((a) => (
              <span key={a.name}>
                <small>Principal Architect</small>
                <b>{a.name}</b>
                <a href={tel(a.phone)}>{a.phone}</a>
              </span>
            ))}
          </div>
        </div>
      </div>
      <form onSubmit={submit} noValidate data-reveal>
        <div className="f full">
          <label>I'm interested in</label>
          <div className="seg">
            {[
              "Architecture",
              "Construction",
              "Interiors",
              "Complete project",
            ].map((t) => (
              <button
                type="button"
                key={t}
                className={t === type ? "on" : ""}
                onClick={() => setType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className={"f" + (errs.nm ? " err" : "")}>
          <label htmlFor="nm">Full name *</label>
          <input id="nm" name="nm" autoComplete="name" />
        </div>
        <div className={"f" + (errs.ph ? " err" : "")}>
          <label htmlFor="ph">Phone *</label>
          <input id="ph" name="ph" inputMode="tel" autoComplete="tel" />
        </div>
        <div className="f">
          <label htmlFor="em">Email</label>
          <input id="em" name="em" type="email" autoComplete="email" />
        </div>
        <div className="f">
          <label htmlFor="loc">Site location</label>
          <input id="loc" name="loc" />
        </div>
        <div className="f">
          <label htmlFor="sp">Space type</label>
          <select id="sp" name="sp">
            <option>Residential</option>
            <option>Commercial</option>
            <option>Corporate</option>
          </select>
        </div>
        <div className="f">
          <label htmlFor="sz">Built-up area</label>
          <select id="sz" name="sz">
            <option>Under 2,000 sq ft</option>
            <option>2,000 – 5,000 sq ft</option>
            <option>5,000 – 15,000 sq ft</option>
            <option>15,000+ sq ft</option>
          </select>
        </div>
        <div className="f full">
          <label htmlFor="msg">Tell us about the project</label>
          <textarea id="msg" name="msg" />
        </div>
        {ok && <div className="form-ok">{ok}</div>}
        <div
          style={{
            gridColumn: "1/-1",
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <button className="btn fill" type="submit" data-magnetic>
            Request consultation{" "}
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor">
              <path d="M1 7h12M8 2l5 5-5 5" />
            </svg>
          </button>
          <span className="form-note">
            Form is not yet connected to a backend.
          </span>
        </div>
      </form>
    </section>
  );
}

/* ---------- footer ---------- */
export function Footer({ onNav }) {
  const go = (e) => {
    e.preventDefault();
    onNav(e.currentTarget.getAttribute("href"));
  };
  return (
    <footer className="lb-footer">
      <div className="lb-foot-grid">
        <div className="lb-foot-brand">
          <img src={COMPANY.logoLight} alt={COMPANY.name} />
          <p>
            Architecture · Construction · Interiors
            <br />
            Residential, commercial & corporate projects in Bengaluru.
          </p>
        </div>
        <div>
          <small>Studio</small>
          <p>{COMPANY.address}</p>
        </div>
        <div>
          <small>Contact</small>
          <p>
            <a href={tel(COMPANY.phone)}>{COMPANY.phone}</a>
            <br />
            <a href={"mailto:" + COMPANY.email}>{COMPANY.email}</a>
            <br />
            <a href={"https://" + COMPANY.web} target="_blank" rel="noreferrer">
              {COMPANY.web}
            </a>
          </p>
        </div>
        <div>
          <small>Architects</small>
          <p>
            {COMPANY.architects.map((a) => (
              <React.Fragment key={a.name}>
                {a.name}
                <br />
                <a href={tel(a.phone)}>{a.phone}</a>
                <br />
              </React.Fragment>
            ))}
          </p>
        </div>
      </div>
      <div className="big">LINE AND BUILD</div>
      <div className="row">
        <span>
          © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
        </span>
        <nav>
          {[
            ["#about", "About"],
            ["#services", "Services"],
            ["#gallery", "Projects"],
            ["#contact", "Contact"],
          ].map(([h, l]) => (
            <a key={h} href={h} onClick={go}>
              {l}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
