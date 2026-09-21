import { saturated as s } from './expanded-catalog.ts';
import type { Molecule } from './chemistry';

const chain = (count: number): [number, number, number][] => Array.from({ length: count - 1 }, (_, i) => [i, i + 1, 1]);
const carbons = (count: number) => Array<string>(count).fill('C');

// Constitutional isomers only: connectivity changes, not a rotation or stereochemical assignment.
export const ISOMER_MOLECULES: Molecule[] = [
  s('isopentane', '아이소펜테인', '2-Methylbutane', 'C₅H₁₂', '탄소 네 개 사슬의 두 번째 탄소에 메틸 가지가 붙습니다. 펜테인·네오펜테인과 같은 분자식입니다.', carbons(5), [[0,1,1],[1,2,1],[2,3,1],[1,4,1]], '구조 이성질체 · 알케인'),
  s('2-methylpentane', '2-메틸펜테인', '2-Methylpentane', 'C₆H₁₄', '펜테인 사슬의 두 번째 탄소에 메틸기가 붙은 헥세인의 구조 이성질체입니다.', carbons(6), [...chain(5),[1,5,1]], '구조 이성질체 · 알케인'),
  s('3-methylpentane', '3-메틸펜테인', '3-Methylpentane', 'C₆H₁₄', '펜테인 사슬의 세 번째 탄소에서 가지가 뻗습니다. 2-메틸펜테인과 가지 위치가 다릅니다.', carbons(6), [...chain(5),[2,5,1]], '구조 이성질체 · 알케인'),
  s('2,2-dimethylbutane', '2,2-다이메틸뷰테인', '2,2-Dimethylbutane', 'C₆H₁₄', '뷰테인 사슬의 같은 탄소에 메틸기 두 개가 붙습니다.', carbons(6), [...chain(4),[1,4,1],[1,5,1]], '구조 이성질체 · 알케인'),
  s('2,3-dimethylbutane', '2,3-다이메틸뷰테인', '2,3-Dimethylbutane', 'C₆H₁₄', '뷰테인 사슬의 이웃한 두 탄소에 메틸기가 하나씩 붙습니다.', carbons(6), [...chain(4),[1,4,1],[2,5,1]], '구조 이성질체 · 알케인'),
  s('2-butanol', '2-뷰탄올', '2-Butanol', 'C₄H₁₀O', '뷰테인 사슬의 두 번째 탄소에 –OH가 붙습니다. 이 게임에서는 R/S 거울상 이성질체를 따로 구분하지 않습니다.', ['C','C','C','C','O'], [...chain(4),[1,4,1]], '구조 이성질체 · 알코올'),
  s('isobutanol', '아이소뷰탄올', '2-Methyl-1-propanol', 'C₄H₁₀O', '가지 달린 탄소 골격의 끝에 –OH가 붙은 일차 알코올입니다.', ['C','C','C','C','O'], [[0,1,1],[1,2,1],[1,3,1],[0,4,1]], '구조 이성질체 · 알코올'),
  s('tert-butanol', '터트-뷰탄올', 'tert-Butanol', 'C₄H₁₀O', '세 탄소에 연결된 중심 탄소에 –OH가 붙는 삼차 알코올입니다.', ['C','C','C','C','O'], [[0,1,1],[0,2,1],[0,3,1],[0,4,1]], '구조 이성질체 · 알코올'),
  s('diethyl-ether', '다이에틸 에터', 'Diethyl ether', 'C₄H₁₀O', '산소 양쪽에 에틸기가 하나씩 붙습니다. 뷰탄올류와 원자 수는 같지만 작용기가 다릅니다.', ['C','C','O','C','C'], chain(5), '구조 이성질체 · 에터'),
  s('1-methoxypropane', '1-메톡시프로페인', '1-Methoxypropane', 'C₄H₁₀O', '산소가 메틸기와 곧은 프로필기를 연결합니다.', ['C','O','C','C','C'], chain(5), '구조 이성질체 · 에터'),
  s('2-methoxypropane', '2-메톡시프로페인', '2-Methoxypropane', 'C₄H₁₀O', '산소가 메틸기와 아이소프로필기를 연결하는 에터입니다.', ['C','O','C','C','C'], [[0,1,1],[1,2,1],[2,3,1],[2,4,1]], '구조 이성질체 · 에터'),
  s('propanal', '프로판알', 'Propanal', 'C₃H₆O', '세 탄소 사슬의 끝에 알데하이드기가 있습니다. 아세톤과 분자식이 같습니다.', ['C','C','C','O'], [[0,1,1],[1,2,1],[2,3,2]], '구조 이성질체 · 알데하이드'),
  s('methoxyethane', '메톡시에테인', 'Methoxyethane', 'C₃H₈O', '산소가 메틸기와 에틸기를 연결합니다. 두 프로판올과 같은 분자식의 에터입니다.', ['C','O','C','C'], chain(4), '구조 이성질체 · 에터'),
  s('methyl-acetate', '아세트산 메틸', 'Methyl acetate', 'C₃H₆O₂', '카보닐 탄소에 메틸기가 붙고, 단일 결합 산소에도 메틸기가 붙는 에스터입니다.', ['C','C','O','O','C'], [[0,1,1],[1,2,2],[1,3,1],[3,4,1]], '구조 이성질체 · 에스터'),
  s('ethyl-formate', '폼산 에틸', 'Ethyl formate', 'C₃H₆O₂', '폼산 쪽 탄소와 에틸기가 산소를 사이에 두고 이어집니다. 아세트산 메틸과 연결이 다릅니다.', ['C','O','O','C','C'], [[0,1,2],[0,2,1],[2,3,1],[3,4,1]], '구조 이성질체 · 에스터'),
];
