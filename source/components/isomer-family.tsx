import { Check, LockKeyhole } from 'lucide-react';
import { isomerFamily, molecularFormula } from '@/lib/isomers';
import type { Molecule } from '@/lib/chemistry';

export function IsomerFamily({ molecule, known, onSelect }: { molecule: Molecule; known: (id: string) => boolean; onSelect: (molecule: Molecule) => void }) {
  const family = isomerFamily(molecule);
  if (family.length < 2) return null;
  return <section className="isomer-family"><div className="isomer-family-title"><h3>같은 분자식, 다른 연결 구조</h3><span>{molecularFormula(molecule)} · {family.length}종</span></div><p>원소별 개수는 같아도 결합 순서나 작용기가 달라요. 아래에서 발견한 이성질체를 비교하고, 미발견 구조의 힌트를 열어 보세요.</p><div className="isomer-siblings">{family.map((entry, index) => <button key={entry.id} className={entry.id === molecule.id ? 'current' : ''} aria-current={entry.id === molecule.id ? 'true' : undefined} onClick={() => onSelect(entry)}>{known(entry.id) ? <Check size={13} /> : <LockKeyhole size={13} />}<span>{known(entry.id) ? entry.name : `미발견 이성질체 ${index + 1}`}</span></button>)}</div><small>구조 이성질체를 비교합니다. R/S·시스/트랜스 입체 이성질체는 아직 따로 판별하지 않아요.</small></section>;
}
