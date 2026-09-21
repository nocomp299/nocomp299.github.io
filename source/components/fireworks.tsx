import type { CSSProperties } from 'react';

export function Fireworks() {
  return <div className="fireworks" aria-hidden="true">{Array.from({ length: 54 }, (_, i) => <i key={i} style={{ '--dx': `${Math.cos(i * 2.399) * (110 + (i % 5) * 40)}px`, '--dy': `${Math.sin(i * 2.399) * (110 + (i % 5) * 40)}px`, '--delay': `${(i % 4) * .08}s`, background: ['#a086e8', '#e7bc6c', '#82b8a6', '#e3979e', '#91b6e7'][i % 5] } as CSSProperties} />)}</div>;
}
