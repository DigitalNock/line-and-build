import React, { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./brand-partners.css";

/* =====================================================================
   Brands We Work With
   1. Put each logo in  public/brands/  (PNG/SVG/WebP, transparent or
      white background works best), e.g. public/brands/kajaria.png
   2. List them below: name = label under the tile, logo = file name.
   If a logo file is missing, the tile shows the brand name instead,
   so nothing looks broken while you collect the files.
   IMPORTANT: only list brands Line And Build actually uses.
   ===================================================================== */
const BRANDS = [
  { name: "Dr. Fixit", logo: "dr-fixit.png" },
  { name: "Tata Pravesh", logo: "tata-pravesh.png" },
  { name: "Aditya Birla", logo: "aditya-birla.png" },
  { name: "Häfele", logo: "hafele.png" },
  { name: "ACC", logo: "acc.png" },
  { name: "Finolex Pipes", logo: "finolex.png" },
  { name: "Saint-Gobain", logo: "saint-gobain.png" },
  { name: "Hettich", logo: "hettich.png" },
  { name: "Kamdhenu", logo: "kamdhenu.png" },
  { name: "Kajaria", logo: "kajaria.png" },
  { name: "GM", logo: "gm.png" },
  { name: "Asian Paints", logo: "asian-paints.png" },
  { name: "Anchor", logo: "anchor.png" },
  { name: "Legrand", logo: "legrand.png" },
];

function BrandTile({ b }) {
  const [failed, setFailed] = useState(false);
  return (
    <li className="lbb-item">
      <div className="lbb-tile">
        {failed ? (
          <span className="lbb-fallback">{b.name}</span>
        ) : (
          <img src={`brands/${b.logo}`} alt={b.name} loading="lazy" onError={() => setFailed(true)} />
        )}
      </div>
      <span className="lbb-name">{b.name}</span>
    </li>
  );
}

export function BrandPartners() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const opts = { immediateRender: false, clearProps: "transform,opacity,visibility" };
      gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 75%", once: true } })
        .from(".lbb-head > *", { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: "power3.out", ...opts })
        .from(".lbb-item", { y: 40, autoAlpha: 0, stagger: { each: 0.04, from: "start" }, duration: 0.7, ease: "power3.out", ...opts }, "-=.4");
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="partners" className="lbb" ref={ref}>
      <div className="lbb-wrap">
        <header className="lbb-head">
          <span className="lbb-pill">Trusted partners</span>
          <h2 className="lbb-title">Brands We <span>Work With</span></h2>
          <p className="lbb-sub">
            We build with materials and fittings from industry-leading brands, so
            every home and workplace is made to last.
          </p>
        </header>

        <ul className="lbb-grid">
          {BRANDS.map((b) => <BrandTile b={b} key={b.name} />)}
        </ul>
      </div>
    </section>
  );
}
