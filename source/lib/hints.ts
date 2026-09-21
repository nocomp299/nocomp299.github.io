import type { Molecule } from './chemistry';
export const HINT_TITLES=['전체 원자 수','원소의 종류','종류별 개수','연결 지도'];
export function hintText(m:Molecule,level:number):string{
 const counts=m.atoms.reduce<Record<string,number>>((all,s)=>({...all,[s]:(all[s]||0)+1}),{});
 if(level<=0)return '필요할 때만 한 단계씩 열어 보세요.';
 if(level===1)return `원자는 모두 ${m.atoms.length}개가 필요해요.`;
 if(level===2)return `${Object.keys(counts).join(' · ')} — ${Object.keys(counts).length}종류의 원소를 사용해요.`;
 if(level===3)return Object.entries(counts).map(([s,n])=>`${s} ${n}개`).join(' + ');
 return m.edges.map(([a,b,o])=>`${m.atoms[a]}${a+1}${o===1?'—':o===2?'=':'≡'}${m.atoms[b]}${b+1}`).join('  ·  ');
}
