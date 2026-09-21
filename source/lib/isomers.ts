import { MOLECULES, type Molecule } from './chemistry.ts';

export function atomInventory(molecule: Molecule): [string, number][] {
  const counts = new Map<string, number>();
  for (const symbol of molecule.atoms) counts.set(symbol, (counts.get(symbol) || 0) + 1);
  const symbols = [...counts.keys()].sort((a, b) => {
    if (!counts.has('C')) return a.localeCompare(b);
    const rank = (symbol: string) => symbol === 'C' ? 0 : symbol === 'H' ? 1 : 2;
    return rank(a) - rank(b) || a.localeCompare(b);
  });
  return symbols.map(symbol => [symbol, counts.get(symbol)!]);
}
export function molecularFormula(molecule: Molecule): string {
  return atomInventory(molecule).map(([symbol, count]) => symbol + (count === 1 ? '' : String(count).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]))).join('');
}
export function isomerFamily(molecule: Molecule): Molecule[] {
  const signature = JSON.stringify(atomInventory(molecule));
  return MOLECULES.filter(candidate => JSON.stringify(atomInventory(candidate)) === signature);
}
