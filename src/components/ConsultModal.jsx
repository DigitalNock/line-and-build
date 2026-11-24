import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./consult.css";

/* Book-a-consultation popup. All classes use the unique "lbq-" prefix.
   Call openConsult() from any button to open it. */
export const openConsult = () => window.dispatchEvent(new CustomEvent("lb:consult"));

const tel = (n) => "tel:" + n.replace(/\s/g, "");

export function ConsultModal({ lenisRef, company }) {
  const [open, setOpen] = useState(false);
  const [errs, setErrs] = useState({});
  const [ok, setOk] = useState("");
  const root = useRef(null), panel = useRef(null), first = useRef(null), lastFocus = useRef(null);

  /* open when any button calls openConsult() */
  useEffect(() => {
    const onOpen = () => { lastFocus.current = document.activeElement; setOk(""); setErrs({}); setOpen(true); };
    window.addEventListener("lb:consult", onOpen);
    return () => window.removeEventListener("lb:consult", onOpen);
  }, []);

  /* animate + lock page scroll while open */
  useEffect(() => {
    const el = root.current, lenis = lenisRef && lenisRef.current;
    if (open) {
      lenis && lenis.stop();
      document.documentElement.classList.add("lbq-lock");
      gsap.set(el, { display: "flex" });
      gsap.timeline()
        .fromTo(el.querySelector(".lbq-overlay"), { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" })
        .fromTo(panel.current, { y: 60, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }, "-=.25")
        .fromTo(panel.current.querySelectorAll(".lbq-anim"), { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.45, ease: "power2.out" }, "-=.35");
      const t = setTimeout(() => first.current && first.current.focus(), 350);
      const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
      window.addEventListener("keydown", onKey);
      return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
    } else if (el.style.display === "flex") {
      gsap.timeline({
        onComplete: () => {
          gsap.set(el, { display: "none" });
          lenis && lenis.start();
          document.documentElement.classList.remove("lbq-lock");
          lastFocus.current && lastFocus.current.focus && lastFocus.current.focus();
        },
      })
        .to(panel.current, { y: 40, opacity: 0, duration: 0.35, ease: "power2.in" })
        .to(el.querySelector(".lbq-overlay"), { opacity: 0, duration: 0.3 }, "-=.15");
    }
  }, [open]);

  const submit = (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const name = f.cname.value.trim(), phone = f.cphone.value.replace(/\D/g, "");
    const er = { cname: !name, cphone: phone.length < 10 };
    setErrs(er);
    if (er.cname || er.cphone) { setOk(""); return; }
    // TODO: send to your backend / CRM, e.g. fetch('/api/consultation', { method: 'POST', body: new FormData(f) })
    setOk(`Thank you, ${name}. Your consultation request is ready. Connect this form to your backend to receive it.`);
    f.reset();
  };

  return (
    <div className="lbq" ref={root} role="dialog" aria-modal="true" aria-labelledby="lbq-title" style={{ display: "none" }}>
      <div className="lbq-overlay" onClick={() => setOpen(false)} />
      <div className="lbq-panel" ref={panel} data-lenis-prevent>
        <button className="lbq-close" aria-label="Close" onClick={() => setOpen(false)}>
          <svg viewBox="0 0 16 16"><path d="M3 3l10 10M13 3L3 13" /></svg>
        </button>

        <aside className="lbq-side">
          {company && company.logoLight && <img className="lbq-logo lbq-anim" src={company.logoLight} alt={company.name} />}
          <h3 className="lbq-anim">Book a <em>consultation</em></h3>
          <p className="lbq-anim">Share a few details and our architects will call you back to plan your project.</p>
          {company && (
            <div className="lbq-contact lbq-anim">
              <small>Prefer to call?</small>
              <a href={tel(company.phone)}>{company.phone}</a>
              {company.architects && company.architects.map((a) => (
                <span key={a.name}>{a.name} · <a href={tel(a.phone)}>{a.phone}</a></span>
              ))}
            </div>
          )}
        </aside>

        <form className="lbq-form" onSubmit={submit} noValidate>
          <h4 id="lbq-title" className="lbq-anim">Your details</h4>
          <div className={"lbq-f lbq-anim" + (errs.cname ? " err" : "")}>
            <label htmlFor="cname">Full name *</label>
            <input ref={first} id="cname" name="cname" autoComplete="name" />
          </div>
          <div className={"lbq-f lbq-anim" + (errs.cphone ? " err" : "")}>
            <label htmlFor="cphone">Phone *</label>
            <input id="cphone" name="cphone" inputMode="tel" autoComplete="tel" />
          </div>
          <div className="lbq-f lbq-anim">
            <label htmlFor="cemail">Email</label>
            <input id="cemail" name="cemail" type="email" autoComplete="email" />
          </div>
          <div className="lbq-f lbq-anim">
            <label htmlFor="cservice">Service</label>
            <select id="cservice" name="cservice">
              <option>Architecture</option>
              <option>Construction</option>
              <option>Interiors</option>
              <option>Complete project</option>
            </select>
          </div>
          <div className="lbq-f lbq-anim">
            <label htmlFor="cspace">Space type</label>
            <select id="cspace" name="cspace">
              <option>Residential</option>
              <option>Commercial</option>
              <option>Corporate</option>
            </select>
          </div>
          <div className="lbq-f lbq-anim">
            <label htmlFor="cdate">Preferred date</label>
            <input id="cdate" name="cdate" type="date" />
          </div>
          <div className="lbq-f full lbq-anim">
            <label htmlFor="cmsg">Tell us about the project</label>
            <textarea id="cmsg" name="cmsg" />
          </div>
          {ok && <div className="lbq-ok full">{ok}</div>}
          <div className="lbq-actions full lbq-anim">
            <button type="submit" className="lbq-btn">
              Request call back
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor"><path d="M1 7h12M8 2l5 5-5 5" /></svg>
            </button>
            <span className="lbq-note">Form is not yet connected to a backend.</span>
          </div>
        </form>
      </div>
    </div>
  );
}
