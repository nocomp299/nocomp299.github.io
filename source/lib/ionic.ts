import { components, type Graph } from './chemistry.ts';

export const ION_CHARGES: Record<string, number> = { Li: 1, Na: 1, K: 1, Mg: 2, Ca: 2, Al: 3, F: -1, Cl: -1, O: -2 };
export const IONIC_SOURCES = [
  { label: 'OpenStax · 이온과 화학식', url: 'https://openstax.org/books/chemistry-2e/pages/2-6-ionic-and-molecular-compounds' },
  { label: 'OpenStax · 결정 구조', url: 'https://openstax.org/books/chemistry-2e/pages/10-6-lattice-structures-in-crystalline-solids' },
];
export type IonicCompound = {
  id: string; name: string; english: string; formula: string;
  cation: string; anion: string; positiveCount: number; negativeCount: number;
  lattice: 'rocksalt' | 'composition'; description: string;
};
const compound = (id: string, name: string, english: string, formula: string, cation: string, anion: string, positiveCount: number, negativeCount: number, description: string, lattice: IonicCompound['lattice'] = 'composition'): IonicCompound =>
  ({ id, name, english, formula, cation, anion, positiveCount, negativeCount, description, lattice });
export const IONIC_COMPOUNDS: IonicCompound[] = [
  compound('ionic-nacl', '염화 나트륨', 'Sodium chloride', 'NaCl', 'Na', 'Cl', 1, 1, '소금의 주성분. Na⁺와 Cl⁻가 1:1로 반복되는 이온성 고체입니다.', 'rocksalt'),
  compound('ionic-kcl', '염화 칼륨', 'Potassium chloride', 'KCl', 'K', 'Cl', 1, 1, 'K⁺ 하나의 양전하와 Cl⁻ 하나의 음전하가 균형을 이룹니다.'),
  compound('ionic-lif', '플루오린화 리튬', 'Lithium fluoride', 'LiF', 'Li', 'F', 1, 1, 'Li⁺와 F⁻가 1:1 비율로 이루는 이온성 화합물입니다.'),
  compound('ionic-mgo', '산화 마그네슘', 'Magnesium oxide', 'MgO', 'Mg', 'O', 1, 1, 'Mg²⁺와 O²⁻는 전하의 크기가 같아 1:1 비율이 됩니다.'),
  compound('ionic-cao', '산화 칼슘', 'Calcium oxide', 'CaO', 'Ca', 'O', 1, 1, 'Ca²⁺ 하나와 O²⁻ 하나의 총전하는 0입니다.'),
  compound('ionic-na2o', '산화 나트륨', 'Sodium oxide', 'Na₂O', 'Na', 'O', 2, 1, 'O²⁻ 하나의 음전하를 맞추려면 Na⁺가 두 개 필요합니다.'),
  compound('ionic-mgcl2', '염화 마그네슘', 'Magnesium chloride', 'MgCl₂', 'Mg', 'Cl', 1, 2, 'Mg²⁺ 하나에 Cl⁻가 두 개 있어야 전하가 맞습니다.'),
  compound('ionic-cacl2', '염화 칼슘', 'Calcium chloride', 'CaCl₂', 'Ca', 'Cl', 1, 2, 'Ca²⁺와 Cl⁻의 가장 간단한 정수비는 1:2입니다.'),
  compound('ionic-caf2', '플루오린화 칼슘', 'Calcium fluoride', 'CaF₂', 'Ca', 'F', 1, 2, 'Ca²⁺ 하나의 +2 전하를 F⁻ 두 개의 −2 전하가 맞춥니다.'),
  compound('ionic-al2o3', '산화 알루미늄', 'Aluminium oxide', 'Al₂O₃', 'Al', 'O', 2, 3, 'Al³⁺ 두 개와 O²⁻ 세 개가 각각 +6과 −6의 전하를 이룹니다.'),
];

export function chargeLabel(charge: number): string {
  return charge === 0 ? '0' : `${Math.abs(charge) === 1 ? '' : Math.abs(charge)}${charge > 0 ? '+' : '−'}`;
}
export function ionLabel(symbol: string): string {
  const superscripts: Record<string, string> = { '1': '¹', '2': '²', '3': '³', '+': '⁺', '−': '⁻' };
  return symbol + [...chargeLabel(ION_CHARGES[symbol] || 0)].map(c => superscripts[c] || c).join('');
}
export function netCharge(graph: Graph): number {
  return graph.atoms.reduce((sum, atom) => sum + (ION_CHARGES[atom.symbol] || 0), 0);
}
/** Links are workbench grouping aids, never covalent bond orders or coordination numbers. */
export function validIonicGraph(graph: Graph): boolean {
  if (!graph || !Array.isArray(graph.atoms) || !Array.isArray(graph.bonds) || graph.atoms.length > 40 || graph.bonds.length > 60) return false;
  const ids = new Set<string>();
  for (const atom of graph.atoms) {
    if (!atom || typeof atom.id !== 'string' || !atom.id || ids.has(atom.id) || !ION_CHARGES[atom.symbol] || !Number.isFinite(atom.x) || !Number.isFinite(atom.y)) return false;
    ids.add(atom.id);
  }
  const links = new Set<string>();
  for (const link of graph.bonds) {
    if (!link || link.order !== 1 || link.a === link.b || !ids.has(link.a) || !ids.has(link.b)) return false;
    const key = [link.a, link.b].sort().join('|');
    if (links.has(key)) return false;
    links.add(key);
    const a = graph.atoms.find(atom => atom.id === link.a)!;
    const b = graph.atoms.find(atom => atom.id === link.b)!;
    if (ION_CHARGES[a.symbol] * ION_CHARGES[b.symbol] >= 0) return false;
  }
  return true;
}
export function canJoinIons(graph: Graph, a: string, b: string): boolean {
  if (!validIonicGraph(graph) || a === b) return false;
  const left = graph.atoms.find(atom => atom.id === a), right = graph.atoms.find(atom => atom.id === b);
  if (!left || !right || ION_CHARGES[left.symbol] * ION_CHARGES[right.symbol] >= 0) return false;
  return !components(graph).find(group => group.atoms.some(atom => atom.id === a))?.atoms.some(atom => atom.id === b);
}
export function joinIons(graph: Graph, a: string, b: string): Graph | null {
  return canJoinIons(graph, a, b) ? { ...graph, bonds: [...graph.bonds, { a, b, order: 1 }] } : null;
}
export function matchIonicCompound(graph: Graph): { compound: IonicCompound; units: number } | null {
  if (!validIonicGraph(graph) || graph.atoms.length < 2 || components(graph).length !== 1 || netCharge(graph) !== 0) return null;
  const counts = new Map<string, number>();
  for (const atom of graph.atoms) counts.set(atom.symbol, (counts.get(atom.symbol) || 0) + 1);
  if (counts.size !== 2) return null;
  for (const entry of IONIC_COMPOUNDS) {
    const units = (counts.get(entry.cation) || 0) / entry.positiveCount;
    if (units >= 1 && Number.isInteger(units) && counts.get(entry.anion) === entry.negativeCount * units) return { compound: entry, units };
  }
  return null;
}
export function ionicTemplate(entry: IonicCompound): Graph {
  const atoms = [ ...Array(entry.positiveCount).fill(entry.cation), ...Array(entry.negativeCount).fill(entry.anion) ].map((symbol, i) => ({ id: String(i), symbol: symbol as string, x: 200 + i * 65, y: 200 }));
  const bonds = atoms.slice(1).map((atom, i) => ({ a: atom.id, b: String(i + 1 < entry.positiveCount ? entry.positiveCount : 0), order: 1 }));
  return { atoms, bonds };
}
export function ionicHint(entry: IonicCompound, level: number): string {
  if (level < 1) return '전하가 0이 되는 이온의 비율을 찾아보세요.';
  if (level === 1) return `가장 작은 화학식 단위에는 이온이 ${entry.positiveCount + entry.negativeCount}개 필요해요.`;
  if (level === 2) return `필요한 원소는 ${entry.cation} · ${entry.anion}예요.`;
  if (level === 3) return `전하는 ${ionLabel(entry.cation)} · ${ionLabel(entry.anion)}예요.`;
  return `${ionLabel(entry.cation)} ${entry.positiveCount}개 + ${ionLabel(entry.anion)} ${entry.negativeCount}개 → 총전하 0`;
}
export function ionFormation(symbol: string): string {
  const charge = ION_CHARGES[symbol];
  const electrons = `${Math.abs(charge) === 1 ? '' : Math.abs(charge)}e⁻`;
  return charge > 0 ? `${symbol} → ${ionLabel(symbol)} + ${electrons}` : `${symbol} + ${electrons} → ${ionLabel(symbol)}`;
}
export type IonPoint = { symbol: string; position: [number, number, number] };
export function ionicModel(entry: IonicCompound): IonPoint[] {
  const points: IonPoint[] = [];
  if (entry.lattice === 'rocksalt') {
    // A finite 4×4×4 slice of the NaCl lattice, NOT a unit cell or a molecule.
    for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) for (let z = 0; z < 4; z++) {
      points.push({ symbol: (x + y + z) % 2 ? entry.anion : entry.cation, position: [x - 1.5, y - 1.5, z - 1.5] });
    }
  } else {
    // Display only the ion ratio. No claim about crystallographic sites is made.
    const symbols = ionicTemplate(entry).atoms.map(a => a.symbol);
    for (let repeat = 0; repeat < 3; repeat++) symbols.forEach((symbol, i) => {
      const angle = i * Math.PI * 2 / symbols.length;
      points.push({ symbol, position: [Math.cos(angle), Math.sin(angle), (repeat - 1) * 1.25] });
    });
  }
  return points;
}
