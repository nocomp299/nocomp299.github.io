import { useMemo, useRef, useState } from 'react';
import { Minus, Plus, Rotate3D, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ionicModel, ionLabel, ION_CHARGES, type IonicCompound } from '@/lib/ionic';
import { rotatePoint } from '@/lib/geometry';

export function IonicViewer({ compound }: { compound: IonicCompound }) {
  const model = useMemo(() => ionicModel(compound), [compound]);
  const [rotation, setRotation] = useState({ pitch: -.35, yaw: .55 });
  const [zoom, setZoom] = useState(1);
  const drag = useRef<{ x: number; y: number; pitch: number; yaw: number } | null>(null);
  const radius = Math.max(...model.map(p => Math.hypot(...p.position)), 1);
  const points = model.map(p => ({ symbol: p.symbol, xyz: rotatePoint(p.position, rotation.pitch, rotation.yaw) })).sort((a, b) => a.xyz[2] - b.xyz[2]);
  const scale = 105 / radius * zoom;
  const lattice = compound.lattice === 'rocksalt';
  return <section className="molecule-viewer ionic-viewer" aria-label={`${compound.name} ${lattice ? '결정 격자' : '조성'} 모형`}>
    <div className="viewer-heading"><span><Rotate3D size={16} />{lattice ? '3D 결정 격자 · NaCl형' : '3D 이온 비율 모형'}</span><Button variant="ghost" size="sm" onClick={() => { setRotation({ pitch: -.35, yaw: .55 }); setZoom(1); }}><RotateCcw size={14} />초기화</Button></div>
    <svg viewBox="0 0 500 300" className="viewer-canvas" role="img" tabIndex={0} aria-label="드래그 또는 방향키로 회전. 더하기와 빼기로 확대 축소."
      onPointerDown={e => { if (e.button !== 0) return; e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, ...rotation }; }}
      onPointerMove={e => { const d = drag.current; if (d) setRotation({ pitch: d.pitch - (e.clientY - d.y) * .01, yaw: d.yaw + (e.clientX - d.x) * .01 }); }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
      onKeyDown={e => { if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-'].includes(e.key)) return; e.preventDefault(); if (e.key === '+' || e.key === '=') setZoom(v => Math.min(1.6, v + .1)); else if (e.key === '-') setZoom(v => Math.max(.7, v - .1)); else setRotation(v => ({ yaw: v.yaw + (e.key === 'ArrowLeft' ? -.15 : e.key === 'ArrowRight' ? .15 : 0), pitch: v.pitch + (e.key === 'ArrowUp' ? -.15 : e.key === 'ArrowDown' ? .15 : 0) })); }}>
      {points.map((point, i) => { const positive = ION_CHARGES[point.symbol] > 0; const x = 250 + point.xyz[0] * scale, y = 148 + point.xyz[1] * scale; const r = lattice ? (positive ? 13 : 16) * zoom : 24 * zoom; return <g key={i}><circle cx={x} cy={y} r={r} fill={positive ? '#e7dcff' : '#d8eee9'} stroke={positive ? '#9c7bdd' : '#6dab9a'} /><circle cx={x - r * .3} cy={y - r * .35} r={r * .22} fill="white" opacity=".6" /><text x={x} y={y} dominantBaseline="central" textAnchor="middle" fill={positive ? '#633bad' : '#266d59'} fontSize={(lattice ? 11 : 15) * zoom} fontWeight="600">{ionLabel(point.symbol)}</text></g>; })}
    </svg>
    <div className="viewer-controls"><Button size="icon-sm" variant="ghost" aria-label="이온 모형 축소" onClick={() => setZoom(v => Math.max(.7, v - .15))}><Minus size={15} /></Button><span>{Math.round(zoom * 100)}%</span><Button size="icon-sm" variant="ghost" aria-label="이온 모형 확대" onClick={() => setZoom(v => Math.min(1.6, v + .15))}><Plus size={15} /></Button><span className="ionic-rotate-caption">드래그 · 방향키로 회전</span></div>
    <p className="geometry-note">{lattice ? 'Na⁺ 32개와 Cl⁻ 32개를 표시한 격자의 일부입니다. 내부 이온은 반대 전하의 이웃 6개에 둘러싸여 있어요. 잘린 가장자리는 이웃이 덜 보입니다. 하나의 분자나 단위 세포가 아니며, 이온 반지름과 거리는 축척이 아닙니다.' : `화학식 단위 3개 분량의 이온 수를 보여줍니다. ${compound.formula}의 조성을 이해하기 위한 모형이며 실제 결정 격자·결합 각도·독립된 분자를 나타내지 않습니다.`}</p>
  </section>;
}
