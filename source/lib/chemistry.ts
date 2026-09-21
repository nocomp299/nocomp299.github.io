import { EXTRA_MOLECULES } from "./expanded-catalog.ts";
import { ISOMER_MOLECULES } from "./isomer-catalog.ts";
export type Atom = { id: string; symbol: string; x: number; y: number };
export type Bond = { a: string; b: string; order: number };
export type Graph = { atoms: Atom[]; bonds: Bond[] };
export type Molecule = { id: string; name: string; english: string; formula: string; description: string; atoms: string[]; edges: [number, number, number][]; family: string };
export const valences: Record<string, number> = { H:1, C:4, N:3, O:2, F:1, P:3, S:2, Cl:1, Br:1, I:1 };
const m = (id:string,name:string,english:string,formula:string,description:string,atoms:string[],edges:[number,number,number][],family="작은 분자"):Molecule => ({id,name,english,formula,description,atoms,edges,family});
export const MOLECULES: Molecule[] = [
  m("water","물","Water","H₂O","산소 하나에 수소 둘. 생명과 일상을 이루는 가장 친숙한 분자입니다.",["O","H","H"],[[0,1,1],[0,2,1]]),
  m("hydrogen","수소","Hydrogen","H₂","두 수소 원자가 전자 한 쌍을 공유합니다.",["H","H"],[[0,1,1]]),
  m("oxygen","산소","Oxygen","O₂","우리가 숨 쉬는 공기 속 산소 분자. 두 원자는 이중 결합으로 연결됩니다.",["O","O"],[[0,1,2]]),
  m("nitrogen","질소","Nitrogen","N₂","공기의 주성분. 두 질소 사이의 강한 삼중 결합이 특징입니다.",["N","N"],[[0,1,3]]),
  m("carbon-dioxide","이산화 탄소","Carbon dioxide","CO₂","탄소 양쪽에 산소가 이중 결합한 직선형 분자입니다.",["C","O","O"],[[0,1,2],[0,2,2]]),
  m("ammonia","암모니아","Ammonia","NH₃","질소에 수소 세 개가 결합한 분자입니다.",["N","H","H","H"],[[0,1,1],[0,2,1],[0,3,1]]),
  m("methane","메테인","Methane","CH₄","가장 간단한 탄화수소. 탄소 하나가 수소 네 개와 결합합니다.",["C","H","H","H","H"],[[0,1,1],[0,2,1],[0,3,1],[0,4,1]],"탄소 화합물"),
  m("hydrogen-peroxide","과산화 수소","Hydrogen peroxide","H₂O₂","두 산소가 연결되고, 각각에 수소가 하나씩 붙어 있습니다.",["O","O","H","H"],[[0,1,1],[0,2,1],[1,3,1]]),
  m("hydrogen-fluoride","플루오린화 수소","Hydrogen fluoride","HF","수소와 플루오린이 결합한 분자입니다.",["H","F"],[[0,1,1]]),
  m("hydrogen-chloride","염화 수소","Hydrogen chloride","HCl","수소와 염소의 분자. 물에 녹인 수용액을 염산이라고 합니다.",["H","Cl"],[[0,1,1]]),
  m("hydrogen-bromide","브로민화 수소","Hydrogen bromide","HBr","수소와 브로민이 결합한 분자입니다.",["H","Br"],[[0,1,1]]),
  m("hydrogen-iodide","아이오딘화 수소","Hydrogen iodide","HI","수소와 아이오딘이 결합한 분자입니다.",["H","I"],[[0,1,1]]),
  m("hydrogen-sulfide","황화 수소","Hydrogen sulfide","H₂S","황 하나와 수소 둘로 이루어집니다. 독성이 있는 기체입니다.",["S","H","H"],[[0,1,1],[0,2,1]]),
  m("phosphine","포스핀","Phosphine","PH₃","인 하나와 수소 셋으로 이루어진 독성 기체입니다.",["P","H","H","H"],[[0,1,1],[0,2,1],[0,3,1]]),
  m("fluorine","플루오린","Fluorine","F₂","플루오린 원자 두 개로 이루어지는 이원자 분자입니다.",["F","F"],[[0,1,1]]),
  m("chlorine","염소","Chlorine","Cl₂","염소 원자 두 개로 이루어지는 이원자 분자입니다.",["Cl","Cl"],[[0,1,1]]),
  m("bromine","브로민","Bromine","Br₂","브로민 원자 두 개로 이루어지는 이원자 분자입니다.",["Br","Br"],[[0,1,1]]),
  m("iodine","아이오딘","Iodine","I₂","아이오딘 원자 두 개로 이루어지는 이원자 분자입니다.",["I","I"],[[0,1,1]]),
  m("ethane","에테인","Ethane","C₂H₆","탄소 두 개가 단일 결합을 이루고 수소 여섯 개가 붙습니다.",["C","C","H","H","H","H","H","H"],[[0,1,1],[0,2,1],[0,3,1],[0,4,1],[1,5,1],[1,6,1],[1,7,1]],"탄소 화합물"),
  m("ethene","에텐","Ethene","C₂H₄","탄소 사이에 이중 결합을 가진 가장 간단한 알켄입니다.",["C","C","H","H","H","H"],[[0,1,2],[0,2,1],[0,3,1],[1,4,1],[1,5,1]],"탄소 화합물"),
  m("ethyne","에타인","Ethyne","C₂H₂","아세틸렌이라고도 합니다. 탄소 사이에 삼중 결합이 있습니다.",["C","C","H","H"],[[0,1,3],[0,2,1],[1,3,1]],"탄소 화합물"),
  m("methanol","메탄올","Methanol","CH₃OH","탄소 하나를 가진 알코올입니다. 에탄올과 달리 독성이 강합니다.",["C","O","H","H","H","H"],[[0,1,1],[0,2,1],[0,3,1],[0,4,1],[1,5,1]],"탄소 화합물"),
  m("formaldehyde","폼알데하이드","Formaldehyde","CH₂O","탄소와 산소의 이중 결합, 그리고 수소 둘을 가진 분자입니다.",["C","O","H","H"],[[0,1,2],[0,2,1],[0,3,1]],"탄소 화합물"),
  m("ethanol","에탄올","Ethanol","C₂H₅OH","탄소–탄소–산소 순서로 연결된 알코올입니다. 다이메틸 에터와 원자 수가 같아도 구조가 다릅니다.",["C","C","O","H","H","H","H","H","H"],[[0,1,1],[1,2,1],[0,3,1],[0,4,1],[0,5,1],[1,6,1],[1,7,1],[2,8,1]],"탄소 화합물"),
  m("dimethyl-ether","다이메틸 에터","Dimethyl ether","CH₃OCH₃","산소가 탄소 둘 사이를 연결합니다. 에탄올과 분자식이 같은 구조 이성질체입니다.",["C","O","C","H","H","H","H","H","H"],[[0,1,1],[1,2,1],[0,3,1],[0,4,1],[0,5,1],[2,6,1],[2,7,1],[2,8,1]],"탄소 화합물"),
  m("acetic-acid","아세트산","Acetic acid","CH₃COOH","식초의 신맛을 내는 물질. 탄소 두 개와 산소 두 개로 뼈대를 만듭니다.",["C","C","O","O","H","H","H","H"],[[0,1,1],[1,2,2],[1,3,1],[0,4,1],[0,5,1],[0,6,1],[3,7,1]],"탄소 화합물")
, ...EXTRA_MOLECULES, ...ISOMER_MOLECULES];
export function validGraph(g:Graph):boolean {
 if(!g || !Array.isArray(g.atoms) || !Array.isArray(g.bonds) || g.atoms.length>60 || g.bonds.length>100) return false;
 const ids=new Set(g.atoms.map(a=>a.id));
 if(ids.size!==g.atoms.length || g.atoms.some(a=>typeof a.id!=="string" || a.id.length>80 || typeof a.symbol!=="string")) return false;
 const edges=new Set<string>(); const sums:Record<string,number>={};
 for(const b of g.bonds){const k=[b.a,b.b].sort().join("|"); if(!ids.has(b.a)||!ids.has(b.b)||b.a===b.b||edges.has(k)||![1,2,3].includes(b.order)) return false;edges.add(k);sums[b.a]=(sums[b.a]||0)+b.order;sums[b.b]=(sums[b.b]||0)+b.order;}
 return g.atoms.every(a=>(sums[a.id]||0)<=(valences[a.symbol]||0));
}
export function components(g:Graph):Graph[] {
 const visited=new Set<string>(); const result:Graph[]=[];
 for(const atom of g.atoms){if(visited.has(atom.id))continue;const ids=new Set([atom.id]);const queue=[atom.id];visited.add(atom.id);for(let i=0;i<queue.length;i++){for(const b of g.bonds){const other=b.a===queue[i]?b.b:b.b===queue[i]?b.a:null;if(other&&!visited.has(other)){visited.add(other);ids.add(other);queue.push(other);}}}result.push({atoms:g.atoms.filter(a=>ids.has(a.id)),bonds:g.bonds.filter(b=>ids.has(b.a)&&ids.has(b.b))});}return result;
}
/** Exact symbol-labelled graph isomorphism. Connectivity distinguishes isomers. */
export function matchMolecule(g:Graph,strictOrders=false):{molecule:Molecule;bonds:Bond[];atomIds:string[]}|null {
 if(!validGraph(g) || g.atoms.length<2) return null;
 const actual=g.atoms.map(a=>g.bonds.filter(b=>b.a===a.id||b.b===a.id).length);
 for(const molecule of MOLECULES){if(molecule.atoms.length!==g.atoms.length||molecule.edges.length!==g.bonds.length)continue;
  if([...molecule.atoms].sort().join(",")!==g.atoms.map(a=>a.symbol).sort().join(","))continue;
  const degree=molecule.atoms.map((_,i)=>molecule.edges.filter(e=>e[0]===i||e[1]===i).length);
  if(actual.map((d,i)=>g.atoms[i].symbol+":"+d).sort().join(",")!==degree.map((d,i)=>molecule.atoms[i]+":"+d).sort().join(","))continue;
  const order=g.atoms.map((_,i)=>i).sort((a,b)=>actual[b]-actual[a]);const mapping:number[]=Array(g.atoms.length).fill(-1);const used=new Set<number>();
  function search(depth:number):boolean{if(depth===order.length)return true;const i=order[depth];for(let j=0;j<molecule.atoms.length;j++){if(used.has(j)||molecule.atoms[j]!==g.atoms[i].symbol||degree[j]!==actual[i])continue;let ok=true;for(let k=0;k<mapping.length;k++){if(mapping[k]<0)continue;const a=g.bonds.find(b=>(b.a===g.atoms[i].id&&b.b===g.atoms[k].id)||(b.b===g.atoms[i].id&&b.a===g.atoms[k].id));const t=molecule.edges.find(e=>(e[0]===j&&e[1]===mapping[k])||(e[1]===j&&e[0]===mapping[k]));if(!!a!==!!t||(strictOrders&&a&&t&&a.order!==t[2])){ok=false;break;}}if(!ok)continue;mapping[i]=j;used.add(j);if(search(depth+1))return true;used.delete(j);mapping[i]=-1;}return false;}
  if(search(0)){return {molecule,atomIds:molecule.atoms.map((_,i)=>g.atoms[mapping.indexOf(i)].id),bonds:molecule.edges.map(([a,b,order])=>({a:g.atoms[mapping.indexOf(a)].id,b:g.atoms[mapping.indexOf(b)].id,order}))};}
 } return null;
}
export function canConnect(g:Graph,a:string,b:string):boolean {
 if(a===b||g.bonds.some(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a)))return false;
 // Build with single bonds; recognized structures receive their correct bond orders.
 const draft={...g,bonds:[...g.bonds.map(e=>({...e,order:1})),{a,b,order:1}]};return validGraph(draft);
}
export function connect(g:Graph,a:string,b:string):Graph|null {
 if(!canConnect(g,a,b))return null;
 const merged={...g,bonds:[...g.bonds,{a,b,order:1}]};
 const group=components(merged).find(c=>c.atoms.some(v=>v.id===a))!;const ids=new Set(group.atoms.map(v=>v.id));
 const singles={...group,bonds:group.bonds.map(e=>({...e,order:1}))};const matched=matchMolecule(singles);
 return {...g,bonds:[...g.bonds.filter(e=>!ids.has(e.a)),...(matched?.bonds||singles.bonds)]};
}
export function removeAtoms(g:Graph,ids:string[]):Graph {const removing=new Set(ids);return {atoms:g.atoms.filter(a=>!removing.has(a.id)),bonds:g.bonds.filter(b=>!removing.has(b.a)&&!removing.has(b.b))};}
export function templateGraph(m:Molecule):Graph {return {atoms:m.atoms.map((symbol,i)=>({id:String(i),symbol,x:0,y:0})),bonds:m.edges.map(([a,b,order])=>({a:String(a),b:String(b),order}))};}

export function removeComponent(g:Graph,id:string):Graph {const group=components(g).find(c=>c.atoms.some(a=>a.id===id));return group?removeAtoms(g,group.atoms.map(a=>a.id)):g;}
