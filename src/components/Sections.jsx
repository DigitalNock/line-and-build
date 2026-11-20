import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heading } from "./Words.jsx";
import { frameUrl } from "./SequenceStory.jsx";

const STILLS = [
  { f: 378, title: "The finished building", tag: "Exterior" },
  { f: 186, title: "The frame tops out", tag: "Structure" },
  { f: 240, title: "Glass & ACP cladding", tag: "Façade" },
  { f: 282, title: "Living room", tag: "Interior" },
  { f: 336, title: "Modular kitchen", tag: "Interior" },
  { f: 96, title: "Pillars at golden hour", tag: "Construction" },
];

const Logo = ({ size = 30 }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="#9a7442"
    strokeWidth="1.3"
    style={{ width: size, height: size }}
  >
    <path d="M4 28 L16 4 L28 28 Z" />
    <path d="M9.5 28 V18 H22.5 V28" />
    <path d="M16 4 V28" />
  </svg>
);

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
    let raf;
    let finished = false;
    const tick = () => {
      o.v += (target.current - o.v) * 0.08;
      if (Math.abs(target.current - o.v) < 0.3) o.v = target.current;
      if (count.current) count.current.textContent = Math.round(o.v);
      if (bar.current) bar.current.style.transform = `scaleX(${o.v / 100})`;
      if (o.v >= 100 && !finished) {
        finished = true;
        gsap
          .timeline({ onComplete: onDone })
          .to(root.current.querySelectorAll(".mid, .top, .bot"), {
            y: -40,
            autoAlpha: 0,
            stagger: 0.06,
            duration: 0.6,
            ease: "power3.in",
            delay: 0.2,
          })
          .to(
            root.current,
            { yPercent: -100, duration: 1.1, ease: "power4.inOut" },
            "-=.2",
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
    <div className="loader" ref={root}>
      <div className="top">
        <span>Archéa Build Studio</span>
        <span>Loading the site film</span>
      </div>
      <div className="mid">ARCHÉA</div>
      <div className="bot">
        <div className="count" ref={count}>
          0
        </div>
        <div className="bar">
          <i ref={bar} />
        </div>
        <span
          style={{
            fontSize: 11,
            letterSpacing: ".3em",
            textTransform: "uppercase",
            color: "#a79f92",
            paddingBottom: 18,
          }}
        >
          Est. 2008
        </span>
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
        e.target.closest("a,button,[data-magnetic],.g-card,.svc");
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
        const m = document.querySelector(".marquee");
        const past = m ? m.getBoundingClientRect().top < 90 : y > 60;
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
      <a href="#top" className="logo" onClick={go}>
        <Logo />
        <div>
          <b>ARCHÉA</b>
          <span>Build · Design · Interiors</span>
        </div>
      </a>
      <nav className={"nav" + (open ? " open" : "")}>
        {[
          ["#top", "The Build"],
          ["#sectors", "Residential & Commercial"],
          ["#services", "Services"],
          ["#gallery", "The Project"],
          ["#process", "Process"],
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

/* ---------- marquee ---------- */
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
    "Luxury <em>Villas</em>",
    "Corporate <em>Offices</em>",
    "Turnkey <em>Interiors</em>",
    "Boutique <em>Hospitality</em>",
    "Premium <em>Residences</em>",
    "Retail <em>Flagships</em>",
  ];
  const row = items.map((t, i) => (
    <span key={i} dangerouslySetInnerHTML={{ __html: t }} />
  ));
  return (
    <div className="marquee">
      <div className="track" ref={track}>
        {row}
        {row.map((r, i) => React.cloneElement(r, { key: "b" + i }))}
      </div>
    </div>
  );
}

/* ---------- stats ---------- */
export function Stats() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ref.current.querySelectorAll("[data-count]").forEach((el) => {
        const end = parseFloat(el.dataset.count),
          dec = (el.dataset.count.split(".")[1] || "").length,
          o = { v: 0 };
        gsap.to(o, {
          v: end,
          duration: 2.2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
          onUpdate: () => {
            el.firstChild.nodeValue = o.v.toFixed(dec);
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section
      className="pad"
      style={{ paddingTop: 0, paddingBottom: 0 }}
      ref={ref}
    >
      <div className="stats" data-reveal>
        <div>
          <b data-count="18">
            0<sup>+</sup>
          </b>
          <span>Years of building</span>
        </div>
        <div>
          <b data-count="240">
            0<sup>+</sup>
          </b>
          <span>Projects delivered</span>
        </div>
        <div>
          <b data-count="3.2">
            0<sup>M</sup>
          </b>
          <span>Sq. ft. constructed</span>
        </div>
        <div>
          <b data-count="100">
            0<sup>%</sup>
          </b>
          <span>In-house design & build</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- residential / commercial ---------- */
export function Sectors() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".sector").forEach((s, i) => {
        gsap.fromTo(
          s,
          { clipPath: "inset(18% 12% 18% 12%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: s,
              start: "top 90%",
              end: "top 30%",
              scrub: 1,
            },
          },
        );
        gsap.fromTo(
          s.querySelector(".img"),
          { yPercent: -6, scale: 1.15 },
          {
            yPercent: 6,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: s,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  const img = (f) => ({ backgroundImage: `url(${frameUrl(f)})` });
  return (
    <section id="sectors" className="pad" ref={ref}>
      <div className="sec-head">
        <div className="eyebrow">What we build</div>
        <Heading a="Two worlds," b="one standard." />
        <p data-reveal>
          Whether it's the home your family will grow up in or the headquarters
          your brand will be known by, architecture, structure and interiors
          stay under one roof.
        </p>
      </div>
      <div className="sectors">
        <div className="sector">
          <div className="img" style={img(282)} />
          <small>Residential</small>
          <h4>Villas & Residences</h4>
          <p>
            Luxury villas, independent homes, duplexes and boutique apartments,
            designed around how you live and built to last generations.
          </p>
          <ul>
            <li>Luxury villas</li>
            <li>Independent homes</li>
            <li>Penthouses</li>
            <li>Turnkey interiors</li>
          </ul>
        </div>
        <div className="sector">
          <div className="img" style={img(234)} />
          <small>Commercial</small>
          <h4>Offices & Hospitality</h4>
          <p>
            Corporate offices, retail flagships, restaurants and mixed-use
            buildings, delivered on schedule with workplace and brand experience
            designed in.
          </p>
          <ul>
            <li>Corporate offices</li>
            <li>Retail & showrooms</li>
            <li>Hospitality</li>
            <li>Mixed-use</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- services ---------- */
const SVCS = [
  [
    "Architecture & Planning",
    "Concept design, approvals, structural and MEP coordination, and photoreal 3D walkthroughs before we break ground.",
    "M4 38h34M8 38V14l13-9 13 9v24M15 38V24h12v14",
  ],
  [
    "Turnkey Construction",
    "Excavation to finishing with our own site teams, fixed-price contracts and weekly progress reports.",
    "M6 38h30M10 38V8h6v30M26 38V16h6v22M10 14h6M10 22h6M10 30h6M26 22h6M26 30h6",
  ],
  [
    "Interior Design",
    "Space planning, bespoke furniture, lighting design and material curation for homes and workplaces.",
    "M6 30h30v6H6zM9 30v-8a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v8M21 4v6M15 10h12l-2 4H17z",
  ],
  [
    "Commercial Fit-outs",
    "Offices, retail and hospitality spaces fitted out fast, with minimal downtime and full compliance.",
    "M6 36h30M10 36V12h22v24M16 18h4v4h-4zM22 18h4v4h-4zM16 26h4v4h-4zM22 26h4v4h-4zM6 12l15-8 15 8",
  ],
  [
    "3D Visualisation",
    "See every room, finish and view in photoreal renders and virtual tours before money is spent on site.",
    "M21 4l15 8v18l-15 8-15-8V12zM21 4v34M6 12l15 8 15-8",
  ],
  [
    "Renovation & Restoration",
    "Structural upgrades, façade makeovers and complete interior transformations of existing buildings.",
    "M8 34l10-10M14 20l8 8M22 6a8 8 0 0 0-2 12l8 8a8 8 0 0 0 12-2l-5-1-3-3-1-5z",
  ],
];
export function Services() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".svc", {
        y: 80,
        autoAlpha: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: { each: 0.1, grid: [2, 3] },
        scrollTrigger: { trigger: ".services", start: "top 80%" },
      });
      gsap.fromTo(
        ".svc svg path",
        { strokeDasharray: 220, strokeDashoffset: 220 },
        {
          strokeDashoffset: 0,
          duration: 1.8,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ".services", start: "top 75%" },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section id="services" className="pad" ref={ref} style={{ paddingTop: 40 }}>
      <div className="sec-head">
        <div className="eyebrow">Services</div>
        <Heading a="Everything," b="end to end." />
        <p data-reveal>
          One accountable team from concept to keys: no hand-offs between
          architect, contractor and decorator, and no gaps in quality.
        </p>
      </div>
      <div className="services">
        {SVCS.map(([t, d, p], i) => (
          <div className="svc" key={t}>
            <span className="n">0{i + 1}</span>
            <svg viewBox="0 0 42 42">
              <path d={p} />
            </svg>
            <h5>{t}</h5>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- horizontal gallery of renders ---------- */
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
    <section id="gallery" className="gallery" ref={ref}>
      <div className="sec-head">
        <div className="eyebrow" style={{ color: "#c9a66b" }}>
          The project
        </div>
        <Heading a="The project," b="frame by frame." />
        <p data-reveal>
          Moments from the build you just walked through, from the first pillars
          to the finished living spaces.
        </p>
      </div>
      <div className="g-track" ref={track}>
        {/* <div className="g-intro"><b>06</b><p>Stills from the project. Keep scrolling →</p></div> */}
        {STILLS.map((s) => (
          <div className="g-card" key={s.title}>
            <div className="frame">
              <div style={{ backgroundImage: `url(${frameUrl(s.f)})` }} />
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

/* ---------- materials ---------- */
const MATS = [
  ["marble", "Italian Marble", "Mirror-polished flooring"],
  ["wood", "Fluted Wood Panelling", "Feature walls & TV units"],
  ["stone", "Textured Stone Finish", "Hand-applied wall texture"],
  ["concrete", "Design-mix Concrete", "M30–M40, cube-tested"],
  ["cladding", "ACP Façade Cladding", "Weatherproof, colour-fast"],
  ["glass", "Aluminium Glazing", "Slim frames, clear views"],
];
export function Materials() {
  const ref = useRef(null);
  const urls = MATS.map((m) => `materials/${m[0]}.webp`);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".mat", {
        y: 120,
        rotate: (i) => (i % 2 ? 4 : -4),
        autoAlpha: 0,
        duration: 1.3,
        ease: "power4.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ".materials", start: "top 82%" },
      });
      gsap.utils.toArray(".mat .sw").forEach((s, i) =>
        gsap.to(s, {
          y: i % 2 ? -40 : 30,
          ease: "none",
          scrollTrigger: {
            trigger: ".materials",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }),
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section id="materials" className="pad" ref={ref}>
      <div className="sec-head">
        <div className="eyebrow">Materials</div>
        <Heading a="Only premium" b="goes in." />
        <p data-reveal>
          Every swatch here is taken from the project itself. We specify, source
          and inspect each material ourselves.
        </p>
      </div>
      <div className="materials">
        {MATS.map((m, i) => (
          <div className="mat" key={m[0]}>
            <div
              className="sw"
              style={{ backgroundImage: `url(${urls[i]})` }}
            />
            <h6>{m[1]}</h6>
            <p>{m[2]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- process ---------- */
const STEPS = [
  ["Consult", "We understand your brief, site and budget."],
  ["Design", "Concepts, 3D views and detailed drawings."],
  ["Approve", "Fixed quote, BOQ and statutory approvals."],
  ["Build", "Excavation to structure with weekly reports."],
  ["Finish", "Façade, interiors, landscape and lighting."],
  ["Handover", "Snag audit, keys and warranty."],
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
    <section id="process" className="pad" ref={ref}>
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
            stroke="rgba(27,25,22,.12)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          <line
            ref={path}
            x1="0"
            y1="1"
            x2="0"
            y2="1"
            stroke="#9a7442"
            strokeWidth="2"
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
  const [type, setType] = useState("Residential");
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
    // TODO: POST to your backend / CRM here (fetch('/api/enquiry', …)).
    setOk(
      `Thank you, ${name}. Your ${type.toLowerCase()} enquiry is ready to send. Connect this form to your backend to receive it.`,
    );
  };
  return (
    <section id="contact" className="contact pad">
      <div>
        <div className="eyebrow">Start a project</div>
        <Heading a="Let's build" b="something lasting." />
        <p data-reveal style={{ color: "var(--muted)", maxWidth: 440 }}>
          Tell us about your plot or space. A senior architect will review it
          and set up a consultation.
        </p>
        <div className="info" data-reveal>
          <div>
            <small>Studio</small>Your studio address, Bengaluru
          </div>
          <div>
            <small>Call</small>+91 00000 00000
          </div>
          <div>
            <small>Write</small>hello@yourstudio.in
          </div>
        </div>
      </div>
      <form onSubmit={submit} noValidate data-reveal>
        <div className="f full">
          <label>Project type</label>
          <div className="seg">
            {["Residential", "Commercial", "Interiors only", "Renovation"].map(
              (t) => (
                <button
                  type="button"
                  key={t}
                  className={t === type ? "on" : ""}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ),
            )}
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
          <label htmlFor="sz">Built-up area</label>
          <select id="sz" name="sz">
            <option>Under 2,000 sq ft</option>
            <option>2,000 – 5,000 sq ft</option>
            <option>5,000 – 15,000 sq ft</option>
            <option>15,000+ sq ft</option>
          </select>
        </div>
        <div className="f">
          <label htmlFor="bd">Budget</label>
          <select id="bd" name="bd">
            <option>₹50L – 1 Cr</option>
            <option>₹1 – 3 Cr</option>
            <option>₹3 – 10 Cr</option>
            <option>₹10 Cr+</option>
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

export function Footer({ onNav }) {
  const go = (e) => {
    e.preventDefault();
    onNav(e.currentTarget.getAttribute("href"));
  };
  return (
    <footer>
      <div className="big">ARCHÉA</div>
      <div className="row">
        <span>© 2026 Archéa Build Studio. All rights reserved.</span>
        <nav>
          {[
            ["#services", "Services"],
            ["#gallery", "Residence"],
            ["#process", "Process"],
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
