'use client';
import { useId, useMemo, useRef, useState } from 'react';
import { RotateCcw, Rotate3D, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { geometryFor, geometryLabel, geometryNote, rotatePoint, type Vec3 } from '@/lib/geometry';
import type { Molecule } from '@/lib/chemistry';
import { atomColors } from '@/lib/elements';
export function MoleculeViewer({molecule,compact=false}:{molecule:Molecule;compact?:boolean}){
 const coords=useMemo(()=>geometryFor(molecule),[molecule]);
 const [rotation,setRotation]=useState({pitch:0,yaw:0});const [zoom,setZoom]=useState(1);
 const drag=useRef<{x:number;y:number;pitch:number;yaw:number}|null>(null);const uid=useId().replaceAll(':','');
 const center=coords.reduce((a,p)=>[a[0]+p[0]/coords.length,a[1]+p[1]/coords.length,a[2]+p[2]/coords.length] as Vec3,[0,0,0] as Vec3);
 const radius=Math.max(...coords.map(p=>Math.hypot(p[0]-center[0],p[1]-center[1],p[2]-center[2])),1.4);
 const scale=104/radius*zoom;const rotated=coords.map(p=>rotatePoint([p[0]-center[0],p[1]-center[1],p[2]-center[2]],rotation.pitch,rotation.yaw));
 const points=rotated.map(p=>({x:250+p[0]*scale,y:150+p[1]*scale,z:p[2],radius:Math.max(11,Math.min(24,scale*.24))}));
 type Item={z:number;node:React.ReactNode};const scene:Item[]=[];
 for(const [index,[a,b,order]] of molecule.edges.entries()){
  const p=points[a],q=points[b];const distance=Math.hypot(q.x-p.x,q.y-p.y)||1;
  for(let line=0;line<order;line++){const offset=(line-(order-1)/2)*5;for(let piece=0;piece<12;piece++){const t=piece/12,u=(piece+1)/12;scene.push({z:p.z+(q.z-p.z)*(t+u)/2,node:<line key={`bond-${index}-${line}-${piece}`} x1={p.x+(q.x-p.x)*t-(q.y-p.y)/distance*offset} y1={p.y+(q.y-p.y)*t+(q.x-p.x)/distance*offset} x2={p.x+(q.x-p.x)*u-(q.y-p.y)/distance*offset} y2={p.y+(q.y-p.y)*u+(q.x-p.x)/distance*offset} stroke={order>1?'#9f91ba':'#c2b7d5'} strokeWidth={order>1?3:6} strokeLinecap="round"/>});}}
 }
 points.forEach((p,i)=>{const color=atomColors(molecule.atoms[i]);scene.push({z:p.z,node:<g key={`atom-${i}`}><circle cx={p.x+1} cy={p.y+3} r={p.radius} fill="#5a4079" opacity=".08"/><circle cx={p.x} cy={p.y} r={p.radius} fill={`url(#${uid}-${i})`} stroke={color.stroke}/><text x={p.x} y={p.y} dominantBaseline="central" textAnchor="middle" fill={color.ink} fontWeight="600" fontSize={Math.max(13,p.radius*.8)}>{molecule.atoms[i]}</text></g>});});
 scene.sort((a,b)=>a.z-b.z);
 return <section className={`molecule-viewer ${compact?'compact':''}`} aria-label={`${molecule.name} 3D 모형`}><div className="viewer-heading"><span><Rotate3D size={16}/> 3D 분자 모형</span><Button variant="ghost" size="sm" aria-label="3D 보기 초기화" onClick={()=>{setRotation({pitch:0,yaw:0});setZoom(1);}}><RotateCcw size={14}/>초기화</Button></div><svg viewBox="0 0 500 300" className="viewer-canvas" role="img" aria-label={`${molecule.name}. 드래그하거나 방향키로 회전, 더하기와 빼기 키로 확대 축소.`} tabIndex={0} onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY,...rotation};}} onPointerMove={e=>{const d=drag.current;if(d)setRotation({yaw:d.yaw+(e.clientX-d.x)*.012,pitch:d.pitch-(e.clientY-d.y)*.012});}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key)){e.preventDefault();if(e.key==='+'||e.key==='=')setZoom(z=>Math.min(2,z+.1));else if(e.key==='-')setZoom(z=>Math.max(.65,z-.1));else setRotation(r=>({yaw:r.yaw+(e.key==='ArrowLeft'?-.12:e.key==='ArrowRight'?.12:0),pitch:r.pitch+(e.key==='ArrowUp'?-.12:e.key==='ArrowDown'?.12:0)}));}}}><defs>{molecule.atoms.map((s,i)=>{const c=atomColors(s);return <radialGradient key={i} id={`${uid}-${i}`} cx="30%" cy="25%" r="80%"><stop offset="0%" stopColor="#ffffff"/><stop offset="45%" stopColor={c.background}/><stop offset="100%" stopColor={c.stroke}/></radialGradient>;})}</defs>{scene.map(s=>s.node)}<text x="250" y="285" textAnchor="middle" fill="#a291b1" fontSize="12">드래그해서 회전 · 방향키로도 회전 가능</text></svg><div className="viewer-controls"><Button variant="ghost" size="icon-sm" aria-label="3D 축소" onClick={()=>setZoom(z=>Math.max(.65,z-.15))}><Minus size={15}/></Button><Slider aria-label="3D 확대 배율" min={.65} max={2} step={.05} value={[zoom]} onValueChange={v=>setZoom(v[0])}/><Button variant="ghost" size="icon-sm" aria-label="3D 확대" onClick={()=>setZoom(z=>Math.min(2,z+.15))}><Plus size={15}/></Button><span>{Math.round(zoom*100)}%</span></div><strong className="geometry-label">{geometryLabel(molecule)}</strong><p className="geometry-note">{geometryNote(molecule)}</p>{molecule.id==='water'&&<a className="geometry-source" href="https://cccbdb.nist.gov/expgeom2.asp?casno=7732185&charge=0" target="_blank" rel="noreferrer">NIST 평형 구조 자료 ↗</a>}</section>;
}
