import React from 'react';

/* Splits text into masked words so GSAP can slide each one up. */
export function Words({ text }) {
  return text.split(' ').map((w, i) => (
    <React.Fragment key={i}>
      <span className="wl"><span className="w">{w}</span></span>{' '}
    </React.Fragment>
  ));
}

export function Heading({ a, b, tag = 'h3', className }) {
  const Tag = tag;
  return (
    <Tag className={className} data-split>
      <Words text={a} /> {b ? <em><Words text={b} /></em> : null}
    </Tag>
  );
}
