import type { Molecule } from './chemistry';
type Edge=[number,number,number];
// Define the heavy-atom skeleton; fill only the normal neutral valences with hydrogen.
function saturated(id:string,name:string,english:string,formula:string,description:string,heavy:string[],skeleton:Edge[],family:string):Molecule{
 const atoms=[...heavy],edges:Edge[]=skeleton.map(e=>[...e]);const valence:Record<string,number>={C:4,N:3,O:2,F:1,Cl:1,Br:1,I:1,S:2};
 heavy.forEach((s,i)=>{const used=skeleton.reduce((sum,e)=>sum+((e[0]===i||e[1]===i)?e[2]:0),0);for(let h=used;h<valence[s];h++){edges.push([i,atoms.length,1]);atoms.push('H');}});
 return {id,name,english,formula,description,atoms,edges,family};
}
const chain=(n:number):Edge[]=>Array.from({length:n-1},(_,i)=>[i,i+1,1]);
const ring=(n:number):Edge[]=>[...chain(n),[n-1,0,1]];
const carbon=(n:number)=>Array(n).fill('C') as string[];
const s=saturated;
export const EXTRA_MOLECULES:Molecule[]=[
 s('propane','프로페인','Propane','C₃H₈','탄소 세 개가 이어지는 알케인. 수소 여덟 개가 탄소 사슬을 둘러쌉니다.',carbon(3),chain(3),'탄화수소'),
 s('butane','뷰테인','Butane','C₄H₁₀','탄소 네 개가 한 줄로 연결된 사슬형 알케인입니다.',carbon(4),chain(4),'탄화수소'),
 s('isobutane','아이소뷰테인','Isobutane','C₄H₁₀','중심 탄소에서 가지 세 개가 뻗는 뷰테인의 구조 이성질체입니다.',carbon(4),[[0,1,1],[0,2,1],[0,3,1]],'탄화수소'),
 s('pentane','펜테인','Pentane','C₅H₁₂','탄소 다섯 개가 한 줄로 이어지는 포화 탄화수소입니다.',carbon(5),chain(5),'탄화수소'),
 s('neopentane','네오펜테인','Neopentane','C₅H₁₂','중심 탄소에 네 메틸기가 붙은, 대칭적인 펜테인의 이성질체입니다.',carbon(5),[[0,1,1],[0,2,1],[0,3,1],[0,4,1]],'탄화수소'),
 s('hexane','헥세인','Hexane','C₆H₁₄','탄소 여섯 개가 한 줄로 연결된 알케인입니다.',carbon(6),chain(6),'탄화수소'),
 s('propene','프로펜','Propene','C₃H₆','탄소 사슬에 이중 결합이 하나 있는 알켄입니다.',carbon(3),[[0,1,2],[1,2,1]],'탄화수소'),
 s('propyne','프로파인','Propyne','C₃H₄','탄소 세 개 중 두 개가 삼중 결합으로 연결됩니다.',carbon(3),[[0,1,3],[1,2,1]],'탄화수소'),
 s('1-butene','1-뷰텐','1-Butene','C₄H₈','탄소 네 개 사슬의 끝에 이중 결합이 있습니다.',carbon(4),[[0,1,2],[1,2,1],[2,3,1]],'탄화수소'),
 s('1-butyne','1-뷰타인','1-Butyne','C₄H₆','탄소 네 개 사슬의 끝에 삼중 결합이 있습니다.',carbon(4),[[0,1,3],[1,2,1],[2,3,1]],'탄화수소'),
 s('cyclopropane','사이클로프로페인','Cyclopropane','C₃H₆','탄소 세 개를 삼각형 고리로 연결합니다. 프로펜과는 구조가 다릅니다.',carbon(3),ring(3),'고리 분자'),
 s('cyclobutane','사이클로뷰테인','Cyclobutane','C₄H₈','탄소 네 개가 작은 고리를 만듭니다. 실제 고리는 조금 접혀 있습니다.',carbon(4),ring(4),'고리 분자'),
 s('cyclopentane','사이클로펜테인','Cyclopentane','C₅H₁₀','탄소 다섯 개의 고리. 실제로는 평평하지 않은 형태를 취합니다.',carbon(5),ring(5),'고리 분자'),
 s('cyclohexane','사이클로헥세인','Cyclohexane','C₆H₁₂','탄소 여섯 개의 고리. 대표적인 안정 형태는 의자 모양입니다.',carbon(6),ring(6),'고리 분자'),
 s('benzene','벤젠','Benzene','C₆H₆','탄소 여섯 개의 평면 고리. 이중 결합 표시는 공명 구조 중 하나입니다.',carbon(6),[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1]],'방향족 분자'),
 s('toluene','톨루엔','Toluene','C₇H₈','벤젠 고리에 메틸기 하나가 붙은 방향족 화합물입니다.',carbon(7),[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1],[0,6,1]],'방향족 분자'),
 s('1-propanol','1-프로판올','1-Propanol','C₃H₇OH','탄소 세 개 사슬의 끝에 하이드록시기(–OH)가 붙습니다.',['C','C','C','O'],chain(4),'알코올'),
 s('2-propanol','2-프로판올','2-Propanol','C₃H₇OH','아이소프로필 알코올. 가운데 탄소에 하이드록시기가 붙습니다.',['C','C','C','O'],[[0,1,1],[1,2,1],[1,3,1]],'알코올'),
 s('1-butanol','1-뷰탄올','1-Butanol','C₄H₉OH','탄소 네 개 사슬의 끝에 하이드록시기가 붙은 알코올입니다.',['C','C','C','C','O'],chain(5),'알코올'),
 s('ethylene-glycol','에틸렌 글리콜','Ethylene glycol','C₂H₆O₂','탄소 두 개에 하이드록시기가 하나씩 붙은 다이올입니다.',['O','C','C','O'],chain(4),'알코올'),
 s('glycerol','글리세롤','Glycerol','C₃H₈O₃','탄소 세 개에 하이드록시기가 각각 하나씩 붙은 트라이올입니다.',['C','C','C','O','O','O'],[[0,1,1],[1,2,1],[0,3,1],[1,4,1],[2,5,1]],'알코올'),
 s('acetone','아세톤','Acetone','C₃H₆O','가운데 탄소에 산소가 이중 결합한 가장 간단한 케톤입니다.',['C','C','C','O'],[[0,1,1],[1,2,1],[1,3,2]],'산소 화합물'),
 s('acetaldehyde','아세트알데하이드','Acetaldehyde','C₂H₄O','두 탄소 중 끝 탄소에 산소가 이중 결합한 알데하이드입니다.',['C','C','O'],[[0,1,1],[1,2,2]],'산소 화합물'),
 s('formic-acid','폼산','Formic acid','HCOOH','카복실기(–COOH)를 가진 가장 간단한 카복실산입니다.',['C','O','O'],[[0,1,2],[0,2,1]],'유기산·에스터'),
 s('propionic-acid','프로피온산','Propionic acid','C₃H₆O₂','탄소 세 개 사슬 끝에 카복실기가 붙어 있습니다.',['C','C','C','O','O'],[[0,1,1],[1,2,1],[2,3,2],[2,4,1]],'유기산·에스터'),
 s('methyl-formate','폼산 메틸','Methyl formate','C₂H₄O₂','산소가 카보닐 탄소와 메틸기 사이를 연결하는 에스터입니다.',['C','O','O','C'],[[0,1,2],[0,2,1],[2,3,1]],'유기산·에스터'),
 s('ethyl-acetate','아세트산 에틸','Ethyl acetate','C₄H₈O₂','아세트산과 에탄올에서 유래한 구조를 가진 에스터입니다.',['C','C','O','O','C','C'],[[0,1,1],[1,2,2],[1,3,1],[3,4,1],[4,5,1]],'유기산·에스터'),
 s('urea','요소','Urea','CH₄N₂O','카보닐 탄소 양쪽에 아미노기 두 개가 붙은 분자입니다.',['C','O','N','N'],[[0,1,2],[0,2,1],[0,3,1]],'질소 화합물'),
 s('methylamine','메틸아민','Methylamine','CH₃NH₂','메틸기와 아미노기가 연결된 가장 간단한 일차 아민입니다.',['C','N'],[[0,1,1]],'질소 화합물'),
 s('ethylamine','에틸아민','Ethylamine','C₂H₅NH₂','에틸기와 아미노기가 연결된 일차 아민입니다.',['C','C','N'],chain(3),'질소 화합물'),
 s('acetonitrile','아세토나이트릴','Acetonitrile','CH₃CN','탄소와 질소 사이에 삼중 결합을 가진 나이트릴입니다.',['C','C','N'],[[0,1,1],[1,2,3]],'질소 화합물'),
 s('hydrogen-cyanide','사이안화 수소','Hydrogen cyanide','HCN','수소–탄소–질소가 직선으로 연결된 독성 분자입니다.',['C','N'],[[0,1,3]],'질소 화합물'),
 s('chloroform','클로로폼','Chloroform','CHCl₃','메테인의 수소 세 개가 염소로 바뀐 구조입니다.',['C','Cl','Cl','Cl'],[[0,1,1],[0,2,1],[0,3,1]],'할로젠 화합물'),
 s('carbon-tetrachloride','사염화 탄소','Carbon tetrachloride','CCl₄','중심 탄소에 염소 네 개가 정사면체 형태로 결합합니다.',['C','Cl','Cl','Cl','Cl'],[[0,1,1],[0,2,1],[0,3,1],[0,4,1]],'할로젠 화합물')
];
