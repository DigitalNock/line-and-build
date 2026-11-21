import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { SequenceStory } from './components/SequenceStory.jsx';
import { About } from './components/About.jsx';
import { Loader, Cursor, Header, Marquee, Stats, Sectors, Services, Gallery, Materials, Contact, Footer } from './components/Sections.jsx';
import { Process } from './components/Process.jsx';

export default function App() {
  const [loadP, setLoadP] = useState(0);
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const lenisRef = useRef(null);
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width:980px)').matches;

  /* smooth scrolling (Lenis) synced with GSAP ScrollTrigger */
  useEffect(() => {
    if (typeof Lenis !== 'function') return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = t => lenis.raf(t * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);

  useEffect(() => { if (lenisRef.current) entered ? lenisRef.current.start() : lenisRef.current.stop(); document.body.style.overflow = entered ? '' : 'hidden'; }, [entered]);

  /* generic reveals: split headings + fade-up blocks */
  useLayoutEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-split]').forEach(h => gsap.from(h.querySelectorAll('.w'), { yPercent: 115, duration: 1.2, ease: 'power4.out', stagger: .05, scrollTrigger: { trigger: h, start: 'top 86%' } }));
      gsap.utils.toArray('[data-reveal]').forEach(el => gsap.from(el, { y: 50, autoAlpha: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
      gsap.utils.toArray('.eyebrow').forEach(el => { if (el.closest('.story')) return; gsap.from(el, { x: -30, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } }); });
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, [ready]);

  /* hero entrance once the loader lifts */
  useEffect(() => {
    if (!entered) return;
    gsap.fromTo('.panel.hero .w', { yPercent: 115 }, { yPercent: 0, duration: 1.4, ease: 'power4.out', stagger: .06 });
    gsap.fromTo('.panel.hero .eyebrow, .panel.hero p, .panel.hero .cta, .meter', { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, ease: 'power3.out', stagger: .08, delay: .3 });
    gsap.fromTo('.rail, .hdr', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, delay: .6 });
  }, [entered]);

  const onNav = hash => {
    const el = document.querySelector(hash); if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(hash === '#top' ? 0 : el, { duration: 1.6 }); else el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const h = e => { const a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a || a.closest('.hdr') || a.closest('footer')) return; e.preventDefault(); onNav(a.getAttribute('href')); };
    document.addEventListener('click', h); return () => document.removeEventListener('click', h);
  }, []);

  return (
    <>
      <Cursor />
      <Loader progress={loadP} ready={ready} onDone={() => setEntered(true)} />
      <Header onNav={onNav} />
      <SequenceStory mobile={mobile} onProgress={setLoadP} onReady={() => setReady(true)} />
      <About />
      <Marquee />
      <Stats />
      <Sectors />
      <Services />
      <Gallery />
      <Materials />
      <Process />
      <Contact />
      <Footer onNav={onNav} />
    </>
  );
}
