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
  logo: "brand/logo.png",            // dark logo for light backgrounds
  logoLight: "brand/logo-light.png", // light logo for dark backgrounds
  architects: [
    { name: "Ar. Mohammed Inayath", phone: "+91 74119 31018" },
    { name: "Ar. Sunil Kumar Rathor", phone: "+91 74111 83117" },
  ],
  address: "#37, 1st Stage, NTI Layout RMV Extension, Bhoopasandra, Sanjayanagara, Bangalore – 560094",
  phone: "+91 74117 50986",
  email: "design@linenbuild.com", // as printed on the card — check spelling
  web: "www.lineandbuild.com",
};
const tel = (n) => "tel:" + n.replace(/\s/g, "");

/* Client's services */
export const SERVICES = [
  {
    key: "architecture",
    title: "Architecture",
    lead: "All sorts of design",
    text: "From the first concept sketch to complete working drawings, we design spaces that are practical to build and a pleasure to live and work in.",
    items: ["Residential design", "Commercial design", "Planning & layouts", "Elevations & façades"],
    img: "about/finishing-sketch.webp",
    imgClass: "sketch",
  },
  {
    key: "construction",
    title: "Construction",
    lead: "Residential & commercial",
    text: "Our own site teams build homes and commercial spaces from foundation to finish, with quality checks at every stage.",
    items: ["Residential construction", "Commercial construction", "Foundation to finish", "Quality supervision"],
    img: frameUrl(186),
  },
  {
    key: "interiors",
    title: "Interiors",
    lead: "Residential · commercial · corporate",
    text: "Interiors planned, designed and executed in-house, so the finished space matches the drawing, down to the last detail.",
    items: ["Residential interiors", "Commercial interiors", "Corporate interiors", "Turnkey execution"],
    img: frameUrl(282),
  },
];

const STILLS = [
  { f: 378, title: "The finished building", tag: "Exterior" },
  { f: 186, title: "The frame tops out", tag: "Structure" },
  { f: 240, title: "Glass & ACP cladding", tag: "Façade" },
  { f: 282, title: "Living room", tag: "Interior" },
  { f: 336, title: "Modular kitchen", tag: "Interior" },
  { f: 96, title: "Pillars at golden hour", tag: "Construction" },
];

/* ---------- loader (shows real frame-loading progress) ---------- */
export function Loader({ progress, ready, onDone }) {
  const root = useRef(null), count = useRef(null), bar = useRef(null), shown = useRef({ v: 0 }), target = useRef(0);
  target.current = ready ? 100 : Math.round((progress || 0) * 96);
  useEffect(() => {
    const o = shown.current;
    let raf, finished = false;
    const tick = () => {
      o.v += (target.current - o.v) * 0.08;
      if (Math.abs(target.current - o.v) < 0.3) o.v = target.current;
      if (count.current) count.current.textContent = Math.round(o.v);
      if (bar.current) bar.current.style.transform = `scaleX(${o.v / 100})`;
      if (o.v >= 100 && !finished) {
        finished = true;
        gsap.timeline({ onComplete: onDone })
          .to(root.current.querySelectorAll(".mid, .top, .bot"), { y: -40, autoAlpha: 0, stagger: 0.06, duration: 0.6, ease: "power3.in", delay: 0.2 })
          .to(root.current, { yPercent: -100, duration: 1.1, ease: "power4.inOut" }, "-=.2")
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
      <div className="top"><span>{COMPANY.name}</span><span>{COMPANY.tagline}</span></div>
      <div className="mid"><img src={COMPANY.logoLight} alt={COMPANY.name} /></div>
      <div className="bot">
        <div className="count" ref={count}>0</div>
        <div className="bar"><i ref={bar} /></div>
        <span className="lb-loader-city">Bengaluru</span>
      </div>
    </div>
  );
}

/* ---------- custom cursor + magnetic buttons ---------- */
export function Cursor() {
  const dot = useRef(null), ring = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(hover:none)").matches) return;
    const xd = gsap.quickTo(dot.current, "x", { duration: 0.12 }), yd = gsap.quickTo(dot.current, "y", { duration: 0.12 });
    const xr = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" }), yr = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });
    const move = (e) => {
      xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY);
      const t = e.target.closest && e.target.closest("a,button,[data-magnetic],.g-card,.lb-svc");
      ring.current.classList.toggle("big", !!t);
    };
    const mag = (e) => {
      const b = e.target.closest && e.target.closest("[data-magnetic]");
      document.querySelectorAll("[data-magnetic]").forEach((el) => { if (el !== b) gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,.4)" }); });
      if (!b) return;
      const r = b.getBoundingClientRect();
      gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: "power3" });
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointermove", mag);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointermove", mag); };
  }, []);
  return (<><div className="cursor" ref={dot} /><div className="cursor-ring" ref={ring} /></>);
}

/* ---------- header ---------- */
export function Header({ onNav }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0, end: "max",
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
  const go = (e) => { const h = e.currentTarget.getAttribute("href"); if (h && h[0] === "#") { e.preventDefault(); setOpen(false); onNav(h); } };
  return (
    <header className="hdr over-film" ref={ref}>
      <a href="#top" className="logo lb-logo" onClick={go} aria-label={COMPANY.name}>
        <img className="l-light" src={COMPANY.logoLight} alt={COMPANY.name} />
        <img className="l-dark" src={COMPANY.logo} alt="" aria-hidden="true" />
      </a>
      <nav className={"nav" + (open ? " open" : "")}>
        {[["#about", "About"], ["#services", "Services"], ["#sectors", "Residential & Commercial"], ["#gallery", "Projects"], ["#contact", "Contact"]].map(([h, l]) => (
          <a key={h} href={h} onClick={go}>{l}</a>
        ))}
      </nav>
      <a href="#contact" className="btn hdr-cta" onClick={go} data-magnetic>Book a consultation</a>
      <button className="menu-btn" aria-label="Menu" onClick={() => setOpen(!open)}>
        <svg width="26" height="26" viewBox="0 0 26 26" stroke="currentColor" strokeWidth="1.4"><path d="M3 9h20M3 17h20" /></svg>
      </button>
    </header>
  );
}

/* ---------- marquee (client's services) ---------- */
export function Marquee() {
  const track = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tw = gsap.to(track.current, { xPercent: -50, ease: "none", duration: 34, repeat: -1 });
      ScrollTrigger.create({
        trigger: track.current, start: "top bottom", end: "bottom top",
        onUpdate: (self) => {
          const v = Math.min(6, 1 + Math.abs(self.getVelocity()) / 400);
          gsap.to(tw, { timeScale: self.direction === -1 ? -v : v, duration: 0.3, overwrite: true });
          gsap.to(tw, { timeScale: self.direction === -1 ? -1 : 1, duration: 1.2, delay: 0.3 });
        },
      });
    });
    return () => ctx.revert();
  }, []);
  const items = ["Architecture <em>& Design</em>", "Residential <em>Construction</em>", "Commercial <em>Construction</em>", "Residential <em>Interiors</em>", "Commercial <em>Interiors</em>", "Corporate <em>Interiors</em>"];
  const row = items.map((t, i) => <span key={i} dangerouslySetInnerHTML={{ __html: t }} />);
  return (
    <div className="marquee lb-marquee">
      <div className="track" ref={track}>{row}{row.map((r, i) => React.cloneElement(r, { key: "b" + i }))}</div>
    </div>
  );
}

/* ---------- key facts (true facts only — edit when you have real numbers) ---------- */
export function Stats() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ref.current.querySelectorAll("[data-count]").forEach((el) => {
        const end = parseFloat(el.dataset.count), o = { v: 0 };
        el.firstChild.nodeValue = "0";
        gsap.to(o, { v: end, duration: 1.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" }, onUpdate: () => { el.firstChild.nodeValue = Math.round(o.v); } });
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section className="pad lb-stats-sec" style={{ paddingTop: 0, paddingBottom: 0 }} ref={ref}>
      <div className="stats lb-stats" data-reveal>
        <div><b data-count="3">3</b><span>Core services — architecture, construction, interiors</span></div>
        <div><b data-count="2">2</b><span>Principal architects lead every project</span></div>
        <div><b data-count="2">2</b><span>Sectors — residential & commercial</span></div>
        <div><b data-count="1">1</b><span>Team, from foundation to finishing touches</span></div>
      </div>
    </section>
  );
}

/* ---------- residential / commercial ---------- */
export function Sectors() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".sector").forEach((s) => {
        gsap.fromTo(s, { clipPath: "inset(18% 12% 18% 12%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: s, start: "top 90%", end: "top 30%", scrub: 1 } });
        gsap.fromTo(s.querySelector(".img"), { yPercent: -6, scale: 1.15 }, { yPercent: 6, scale: 1, ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "bottom top", scrub: true } });
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  const img = (f) => ({ backgroundImage: `url(${frameUrl(f)})` });
  return (
    <section id="sectors" className="pad lb-sectors" ref={ref}>
      <div className="sec-head">
        <div className="eyebrow">What we build</div>
        <Heading a="Homes and" b="workplaces." />
        <p data-reveal>Whether it's a family home or a corporate office, architecture, construction and interiors stay with one team, under one roof.</p>
      </div>
      <div className="sectors">
        <div className="sector">
          <div className="img" style={img(282)} />
          <small>Residential</small>
          <h4>Homes & Residences</h4>
          <p>Independent houses, villas and apartments, designed, built and finished around the way your family lives.</p>
          <ul><li>Architecture</li><li>Construction</li><li>Residential interiors</li></ul>
        </div>
        <div className="sector">
          <div className="img" style={img(234)} />
          <small>Commercial</small>
          <h4>Commercial & Corporate</h4>
          <p>Commercial buildings, offices and corporate interiors, planned for the way your business works and built to schedule.</p>
          <ul><li>Commercial design</li><li>Commercial construction</li><li>Corporate interiors</li></ul>
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
      gsap.from(".lb-svc", { y: 90, autoAlpha: 0, duration: 1.1, ease: "power3.out", stagger: 0.12, scrollTrigger: { trigger: ".lb-svcs", start: "top 80%" } });
      gsap.fromTo(".lb-svc-icon path", { strokeDasharray: 220, strokeDashoffset: 220 }, { strokeDashoffset: 0, duration: 1.8, ease: "power2.out", stagger: 0.1, scrollTrigger: { trigger: ".lb-svcs", start: "top 75%" } });
    }, ref);
    return () => ctx.revert();
  }, []);
  const ICONS = {
    architecture: "M4 38h34M8 38V14l13-9 13 9v24M15 38V24h12v14M28 8l6 6",
    construction: "M6 38h30M10 38V8h6v30M26 38V16h6v22M10 14h6M10 22h6M10 30h6M26 22h6M26 30h6",
    interiors: "M6 30h30v6H6zM9 30v-8a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v8M21 4v6M15 10h12l-2 4H17z",
  };
  return (
    <section id="services" className="pad lb-services" ref={ref}>
      <div className="sec-head">
        <div className="eyebrow">Services</div>
        <Heading a="Architecture, construction" b="& interiors." />
        <p data-reveal>Three services, one accountable team. Hire us for one, or let us take your project from the first line on paper to the last finishing touch.</p>
      </div>
      <div className="lb-svcs">
        {SERVICES.map((s, i) => (
          <article key={s.key} className={"lb-svc" + (i === active ? " on" : "")} onMouseEnter={() => setActive(i)} onClick={() => setActive(i)} onFocus={() => setActive(i)} tabIndex={0}>
            <div className={"lb-svc-img " + (s.imgClass || "")} style={{ backgroundImage: `url(${s.img})` }} />
            <div className="lb-svc-shade" />
            <div className="lb-svc-top">
              <span className="lb-svc-n">0{i + 1}</span>
              <svg className="lb-svc-icon" viewBox="0 0 42 42"><path d={ICONS[s.key]} /></svg>
            </div>
            <div className="lb-svc-body">
              <small>{s.lead}</small>
              <h3>{s.title}</h3>
              <div className="lb-svc-more">
                <div>
                  <p>{s.text}</p>
                  <ul>{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
                  <a href="#contact" className="lb-svc-cta">Enquire about {s.title.toLowerCase()} →</a>
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
  const ref = useRef(null), track = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const dist = () => Math.max(0, track.current.scrollWidth - window.innerWidth);
      const tw = gsap.to(track.current, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
      gsap.utils.toArray(".g-card .frame div").forEach((img) =>
        gsap.fromTo(img, { xPercent: -4 }, { xPercent: 4, ease: "none", scrollTrigger: { trigger: img.parentNode, containerAnimation: tw, start: "left right", end: "right left", scrub: true } })
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section id="gallery" className="gallery lb-gallery" ref={ref}>
      <div className="sec-head">
        <div className="eyebrow">Projects</div>
        <Heading a="The project," b="frame by frame." />
        <p data-reveal>Moments from the build you just walked through, from the first pillars to the finished living spaces.</p>
      </div>
      <div className="g-track" ref={track}>
        {STILLS.map((s) => (
          <div className="g-card" key={s.title}>
            <div className="frame"><div style={{ backgroundImage: `url(${frameUrl(s.f)})` }} /></div>
            <div className="cap"><h6>{s.title}</h6><span>{s.tag}</span></div>
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
  ["concrete", "Design-mix Concrete", "Cube-tested quality"],
  ["cladding", "ACP Façade Cladding", "Weatherproof, colour-fast"],
  ["glass", "Aluminium Glazing", "Slim frames, clear views"],
];
export function Materials() {
  const ref = useRef(null);
  const urls = MATS.map((m) => `materials/${m[0]}.webp`);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".mat", { y: 120, rotate: (i) => (i % 2 ? 4 : -4), autoAlpha: 0, duration: 1.3, ease: "power4.out", stagger: 0.08, scrollTrigger: { trigger: ".materials", start: "top 82%" } });
      gsap.utils.toArray(".mat .sw").forEach((s, i) => gsap.to(s, { y: i % 2 ? -40 : 30, ease: "none", scrollTrigger: { trigger: ".materials", start: "top bottom", end: "bottom top", scrub: true } }));
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section id="materials" className="pad lb-materials" ref={ref}>
      <div className="sec-head">
        <div className="eyebrow">Materials</div>
        <Heading a="Finishes that" b="last." />
        <p data-reveal>Every swatch here is taken from a real project. We specify, source and inspect each material ourselves.</p>
      </div>
      <div className="materials">
        {MATS.map((m, i) => (
          <div className="mat" key={m[0]}><div className="sw" style={{ backgroundImage: `url(${urls[i]})` }} /><h6>{m[1]}</h6><p>{m[2]}</p></div>
        ))}
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
  const ref = useRef(null), path = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray(".step");
      gsap.fromTo(path.current, { attr: { x2: 0 } }, { attr: { x2: 100 }, ease: "none", scrollTrigger: { trigger: ".process", start: "top 75%", end: "bottom 45%", scrub: 1, onUpdate: (self) => steps.forEach((s, i) => s.classList.toggle("on", self.progress >= i / steps.length + 0.02)) } });
      gsap.from(steps, { y: 50, autoAlpha: 0, stagger: 0.1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".process", start: "top 80%" } });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section id="process" className="pad lb-process" ref={ref}>
      <div className="sec-head">
        <div className="eyebrow">Process</div>
        <Heading a="A calm," b="clear process." />
        <p data-reveal>Six stages, one point of contact and complete transparency on cost and timelines from day one.</p>
      </div>
      <div className="process">
        <svg className="line" viewBox="0 0 100 2" preserveAspectRatio="none">
          <line x1="0" y1="1" x2="100" y2="1" stroke="rgba(88,88,86,.18)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <line ref={path} x1="0" y1="1" x2="0" y2="1" stroke="#EFCC18" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </svg>
        {STEPS.map(([t, d], i) => (
          <div className="step" key={t}><div className="d"><b>0{i + 1}</b></div><h6>{t}</h6><p>{d}</p></div>
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
    const name = f.nm.value.trim(), phone = f.ph.value.replace(/\D/g, "");
    const er = { nm: !name, ph: phone.length < 10 };
    setErrs(er);
    if (er.nm || er.ph) { setOk(""); return; }
    // TODO: send to your backend / CRM here, e.g. fetch('/api/enquiry', { method: 'POST', body: new FormData(f) })
    setOk(`Thank you, ${name}. Your ${type.toLowerCase()} enquiry is ready. Connect this form to your backend to receive it.`);
  };
  return (
    <section id="contact" className="contact pad lb-contact">
      <div>
        <div className="eyebrow">Start a project</div>
        <Heading a="Let's build" b="something lasting." />
        <p data-reveal className="lb-contact-lead">Tell us about your plot or space. Our architects will review it and set up a consultation.</p>
        <div className="info" data-reveal>
          <div><small>Studio</small>{COMPANY.address}</div>
          <div><small>Call</small><a href={tel(COMPANY.phone)}>{COMPANY.phone}</a></div>
          <div><small>Write</small><a href={"mailto:" + COMPANY.email}>{COMPANY.email}</a></div>
          <div className="lb-arch">
            {COMPANY.architects.map((a) => (
              <span key={a.name}><small>Principal Architect</small><b>{a.name}</b><a href={tel(a.phone)}>{a.phone}</a></span>
            ))}
          </div>
        </div>
      </div>
      <form onSubmit={submit} noValidate data-reveal>
        <div className="f full">
          <label>I'm interested in</label>
          <div className="seg">
            {["Architecture", "Construction", "Interiors", "Complete project"].map((t) => (
              <button type="button" key={t} className={t === type ? "on" : ""} onClick={() => setType(t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className={"f" + (errs.nm ? " err" : "")}><label htmlFor="nm">Full name *</label><input id="nm" name="nm" autoComplete="name" /></div>
        <div className={"f" + (errs.ph ? " err" : "")}><label htmlFor="ph">Phone *</label><input id="ph" name="ph" inputMode="tel" autoComplete="tel" /></div>
        <div className="f"><label htmlFor="em">Email</label><input id="em" name="em" type="email" autoComplete="email" /></div>
        <div className="f"><label htmlFor="loc">Site location</label><input id="loc" name="loc" /></div>
        <div className="f"><label htmlFor="sp">Space type</label><select id="sp" name="sp"><option>Residential</option><option>Commercial</option><option>Corporate</option></select></div>
        <div className="f"><label htmlFor="sz">Built-up area</label><select id="sz" name="sz"><option>Under 2,000 sq ft</option><option>2,000 – 5,000 sq ft</option><option>5,000 – 15,000 sq ft</option><option>15,000+ sq ft</option></select></div>
        <div className="f full"><label htmlFor="msg">Tell us about the project</label><textarea id="msg" name="msg" /></div>
        {ok && <div className="form-ok">{ok}</div>}
        <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <button className="btn fill" type="submit" data-magnetic>
            Request consultation <svg viewBox="0 0 14 14" fill="none" stroke="currentColor"><path d="M1 7h12M8 2l5 5-5 5" /></svg>
          </button>
          <span className="form-note">Form is not yet connected to a backend.</span>
        </div>
      </form>
    </section>
  );
}

/* ---------- footer ---------- */
export function Footer({ onNav }) {
  const go = (e) => { e.preventDefault(); onNav(e.currentTarget.getAttribute("href")); };
  return (
    <footer className="lb-footer">
      <div className="lb-foot-grid">
        <div className="lb-foot-brand">
          <img src={COMPANY.logoLight} alt={COMPANY.name} />
          <p>Architecture · Construction · Interiors<br />Residential, commercial & corporate projects in Bengaluru.</p>
        </div>
        <div><small>Studio</small><p>{COMPANY.address}</p></div>
        <div>
          <small>Contact</small>
          <p><a href={tel(COMPANY.phone)}>{COMPANY.phone}</a><br /><a href={"mailto:" + COMPANY.email}>{COMPANY.email}</a><br /><a href={"https://" + COMPANY.web} target="_blank" rel="noreferrer">{COMPANY.web}</a></p>
        </div>
        <div>
          <small>Architects</small>
          <p>{COMPANY.architects.map((a) => <React.Fragment key={a.name}>{a.name}<br /><a href={tel(a.phone)}>{a.phone}</a><br /></React.Fragment>)}</p>
        </div>
      </div>
      <div className="big">LINE AND BUILD</div>
      <div className="row">
        <span>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</span>
        <nav>{[["#about", "About"], ["#services", "Services"], ["#gallery", "Projects"], ["#contact", "Contact"]].map(([h, l]) => <a key={h} href={h} onClick={go}>{l}</a>)}</nav>
      </div>
    </footer>
  );
}
