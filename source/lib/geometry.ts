import type { Molecule, Graph } from './chemistry';
export type Vec3=[number,number,number];
export const WATER_ANGLE=104.4776;
const rad=(degrees:number)=>degrees*Math.PI/180;
const add=(a:Vec3,b:Vec3):Vec3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mul=(a:Vec3,s:number):Vec3=>[a[0]*s,a[1]*s,a[2]*s];
const sub=(a:Vec3,b:Vec3):Vec3=>add(a,mul(b,-1));
const dot=(a:Vec3,b:Vec3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const norm=(a:Vec3):Vec3=>mul(a,1/(Math.hypot(...a)||1));
const cross=(a:Vec3,b:Vec3):Vec3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export function angleBetween(a:Vec3,center:Vec3,b:Vec3){return Math.acos(Math.max(-1,Math.min(1,dot(norm(sub(a,center)),norm(sub(b,center))))))*180/Math.PI;}
export function rotatePoint(p:Vec3,pitch:number,yaw:number):Vec3{const x=p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),z=-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw);return [x,p[1]*Math.cos(pitch)-z*Math.sin(pitch),p[1]*Math.sin(pitch)+z*Math.cos(pitch)];}
export function geometryLabel(m:Molecule):string {
 if(m.id==='water')return '굽은형 · H–O–H 104.48°';
 if(m.id==='carbon-dioxide')return '직선형 · O–C–O 180°';
 if(m.atoms.length===2)return '직선형 · 이원자 분자';
 if(m.id==='ammonia')return '삼각뿔형 · 이상화 모형';
 if(m.id==='methane'||m.id==='carbon-tetrachloride')return '정사면체형 · 이상각 109.47°';
 if(m.id==='benzene'||m.id==='toluene')return '평면 방향족 고리 · 이상각 120°';
 if(m.id==='cyclohexane')return '의자형 고리 · 이상화 모형';
 if(m.id.startsWith('cyclo'))return '고리 구조 · 이상화 모형';
 if(m.edges.some(e=>e[2]===3))return '삼중 결합 중심 · 이상각 180°';
 if(m.edges.some(e=>e[2]===2))return '이중 결합 중심 · 이상각 120°';
 return '입체 결합 구조 · 이상화 모형';
}
export function geometryNote(m:Molecule):string {return m.id==='water'?'기체 상태 평형 구조의 NIST 값 104.4776°를 사용합니다.':m.id==='carbon-dioxide'?'분리된 CO₂ 분자는 직선형이며 O–C–O 각도는 180°입니다.':'결합 구조와 VSEPR을 바탕으로 만든 교육용 3D 모형입니다. 각도·길이는 이상화한 근사값이며 실험 구조나 에너지 최적화 결과가 아닙니다. 단일 결합의 회전으로 다른 형태도 가능합니다.';}
function bondLength(a:string,b:string,order:number){if(a==='H'||b==='H')return a==='O'||b==='O'?.96:a==='N'||b==='N'?1.01:1.09;const radius:Record<string,number>={C:.76,N:.71,O:.66,F:.57,Cl:1.02,Br:1.2,I:1.39,S:1.05,P:1.07};return ((radius[a]||.8)+(radius[b]||.8))*(order===3?.79:order===2?.87:1);}
export function geometryFor(m:Molecule):Vec3[]{
 const count=m.atoms.length;let points:(Vec3|undefined)[]=Array(count);
 const neighbors=(i:number)=>m.edges.filter(e=>e[0]===i||e[1]===i).map(e=>({id:e[0]===i?e[1]:e[0],order:e[2]}));
 if(count===2)return [[-.6,0,0],[.6,0,0]];
 if(m.id==='water'){const half=rad(WATER_ANGLE/2);return [[0,0,0],[-Math.sin(half)*.958,Math.cos(half)*.958,0],[Math.sin(half)*.958,Math.cos(half)*.958,0]];}
 if(m.id==='carbon-dioxide')return [[0,0,0],[-1.16,0,0],[1.16,0,0]];
 const ringSize:Record<string,number>={cyclopropane:3,cyclobutane:4,cyclopentane:5,cyclohexane:6,benzene:6,toluene:6};const nRing=ringSize[m.id];
 if(nRing){const radius=(m.id==='benzene'||m.id==='toluene'?1.4:1.5)/(2*Math.sin(Math.PI/nRing));for(let i=0;i<nRing;i++){const a=2*Math.PI*i/nRing;const z=m.id==='cyclohexane'?(i%2===0?1:-1)*radius/Math.sqrt(32):m.id==='cyclobutane'?(i%2===0?.13:-.13):m.id==='cyclopentane'?(i===0?.3:0):0;points[i]=[Math.cos(a)*radius,Math.sin(a)*radius,z];}}
 else points[0]=[0,0,0];
 for(let pass=0;pass<count;pass++){
  let changed=false;
  for(let i=0;i<count;i++){if(!points[i])continue;const all=neighbors(i),pending=all.filter(n=>!points[n.id]);if(!pending.length)continue;const placed=all.filter(n=>points[n.id]);const p=points[i]!;
   const planarN=m.id==='urea'&&m.atoms[i]==='N';
   const localAngle=all.some(n=>n.order===3)||(m.atoms[i]==='C'&&all.length===2)?180:all.some(n=>n.order===2)||planarN?120:m.atoms[i]==='O'?104.5:m.atoms[i]==='S'?92:m.atoms[i]==='P'?94:m.atoms[i]==='N'?107:109.4712206;
   let best:Vec3[]=[],score=Infinity;
   const rigidPlane=placed.length===1&&(placed[0].order===2||planarN);
   for(let turn=0;turn<(rigidPlane?1:12);turn++){
    const torsion=turn*Math.PI/6;let dirs:Vec3[]=[];
    if(placed.length===0){if(all.length===2){const half=rad(localAngle/2);dirs=[[-Math.sin(half),Math.cos(half),0],[Math.sin(half),Math.cos(half),0]];}else if(all.length===3){const z=localAngle===120?0:Math.sqrt(Math.max(0,(Math.cos(rad(localAngle))+.5)/1.5));dirs=Array.from({length:3},(_,k)=>[Math.cos(k*2*Math.PI/3)*Math.sqrt(1-z*z),Math.sin(k*2*Math.PI/3)*Math.sqrt(1-z*z),z] as Vec3);}else{dirs=[[1,0,0],[-1/3,Math.sqrt(8/9),0],[-1/3,-Math.sqrt(2/9),Math.sqrt(2/3)],[-1/3,-Math.sqrt(2/9),-Math.sqrt(2/3)]];}}
    else if(placed.length===1){const axis=norm(sub(points[placed[0].id]!,p));let e1=norm(cross(axis,Math.abs(axis[2])<.8?[0,0,1]:[0,1,0]));if(rigidPlane){const reference=neighbors(placed[0].id).find(n=>n.id!==i&&points[n.id]);if(reference){const v=sub(points[reference.id]!,points[placed[0].id]!);e1=norm(sub(v,mul(axis,dot(v,axis))));}}const e2=cross(axis,e1);const theta=rad(localAngle);let gap=2*Math.PI/pending.length;if(pending.length===2&&localAngle<120){const c=Math.cos(theta);gap=Math.acos(Math.max(-1,Math.min(1,(c-c*c)/(1-c*c))));}dirs=pending.map((_,k)=>{const phi=torsion+k*gap;return add(mul(axis,Math.cos(theta)),mul(add(mul(e1,Math.cos(phi)),mul(e2,Math.sin(phi))),Math.sin(theta)));});}
    else {const known=placed.map(n=>norm(sub(points[n.id]!,p)));const outward=norm(mul(known.reduce(add,[0,0,0] as Vec3),-1));if(pending.length===1){if(m.atoms[i]==='N'&&!planarN&&known.length===2){const normal=norm(cross(known[0],known[1]));const k=Math.max(-1,Math.min(1,Math.cos(rad(localAngle))/(dot(outward,known[0])||-1)));dirs=[add(mul(outward,k),mul(normal,(turn%2?1:-1)*Math.sqrt(1-k*k)))];}else dirs=[outward];}else{const normal=norm(cross(known[0],known[1]));dirs=[add(mul(outward,Math.sqrt(1/3)),mul(normal,Math.sqrt(2/3))),add(mul(outward,Math.sqrt(1/3)),mul(normal,-Math.sqrt(2/3)))];}}
    const candidates=pending.map((n,k)=>add(p,mul(norm(dirs[k]||[1,0,0]),bondLength(m.atoms[i],m.atoms[n.id],n.order))));let cost=0;for(const q of candidates){for(let j=0;j<count;j++){if(j===i||!points[j])continue;const distance=Math.hypot(...sub(q,points[j]!));cost+=1/Math.max(.01,distance**6);}}if(cost<score){score=cost;best=candidates;}
   }
   pending.forEach((n,k)=>{points[n.id]=best[k];changed=true;});
  }if(!changed)break;
 }
 const result=points.map((p,i)=>p||[i*1.5,0,0] as Vec3);const center=mul(result.reduce(add,[0,0,0] as Vec3),1/count);return result.map(p=>sub(p,center));
}
export function projectedGeometry(m:Molecule):Vec3[]{
 const coords=geometryFor(m);if(m.id==='water'||m.id==='carbon-dioxide'||m.atoms.length===2)return coords;
 const views:[[number,number],...[number,number][]]=[[.45,.6],[.75,.9],[.2,.3],[-.35,1.1],[0,0]];
 let best=coords,bestScore=-Infinity;
 for(const [pitch,yaw] of views){const next=coords.map(p=>rotatePoint(p,pitch,yaw));let nearest=Infinity;for(let i=0;i<next.length;i++)for(let j=0;j<i;j++){const d=Math.hypot(next[i][0]-next[j][0],next[i][1]-next[j][1]);nearest=Math.min(nearest,d);}if(nearest>bestScore){bestScore=nearest;best=next;}}return best;
}
export function arrangeMolecule(g:Graph,m:Molecule,atomIds:string[]):Graph {
 const source=projectedGeometry(m);const xs=source.map(p=>p[0]),ys=source.map(p=>p[1]);const width=Math.max(...xs)-Math.min(...xs),height=Math.max(...ys)-Math.min(...ys);const scale=Math.min(100,640/Math.max(.1,width),330/Math.max(.1,height));const group=g.atoms.filter(a=>atomIds.includes(a.id));const cx=group.reduce((n,a)=>n+a.x,0)/group.length,cy=group.reduce((n,a)=>n+a.y,0)/group.length;
 const centerX=Math.max(45+width*scale/2,Math.min(755-width*scale/2,cx)),centerY=Math.max(85+height*scale/2,Math.min(445-height*scale/2,cy));const mx=(Math.min(...xs)+Math.max(...xs))/2,my=(Math.min(...ys)+Math.max(...ys))/2;
 const lookup=new Map(atomIds.map((id,i)=>[id,{x:centerX+(source[i][0]-mx)*scale,y:centerY+(source[i][1]-my)*scale}]));return {...g,atoms:g.atoms.map(a=>lookup.has(a.id)?{...a,...lookup.get(a.id)!}:a)};
}
