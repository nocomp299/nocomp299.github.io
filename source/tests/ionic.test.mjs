import test from 'node:test';
import assert from 'node:assert/strict';
import { components, MOLECULES, removeAtoms, removeComponent, templateGraph } from '../lib/chemistry.ts';
import { IONIC_COMPOUNDS, ION_CHARGES, ionLabel, ionFormation, ionicTemplate, ionicHint, ionicModel, validIonicGraph, netCharge, joinIons, matchIonicCompound } from '../lib/ionic.ts';
import { ionicCollectionKey, readIonicCollection, saveIonicDiscovery } from '../lib/ionic-collection.ts';
import { collectionKey, readCollection, saveLocalDiscovery } from '../lib/local-collection.ts';

const byFormula = formula => IONIC_COMPOUNDS.find(entry => entry.formula === formula);
const make = (symbols, prefix = '') => ({ atoms: symbols.map((symbol, i) => ({ id: prefix + i, symbol, x: 100 + i * 40, y: 200 })), bonds: [] });
function memory() { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; }

test('Na+ and Cl− form NaCl, with no covalent valence checks applied', () => {
  const graph = joinIons(make(['Na', 'Cl']), '0', '1');
  assert.ok(graph);
  assert.equal(netCharge(graph), 0);
  assert.equal(matchIonicCompound(graph)?.compound.formula, 'NaCl');
  assert.equal(ionLabel('Mg'), 'Mg²⁺');
  assert.equal(ionFormation('O'), 'O + 2e⁻ → O²⁻');
});

test('CaCl is charged; the second chloride is required for CaCl2', () => {
  let graph = joinIons(make(['Ca', 'Cl', 'Cl']), '0', '1');
  const charged = components(graph).find(group => group.atoms.length === 2);
  assert.equal(netCharge(charged), 1);
  assert.equal(matchIonicCompound(charged), null);
  graph = joinIons(graph, '0', '2');
  assert.equal(matchIonicCompound(graph)?.compound.formula, 'CaCl₂');
});

test('all ten entries use minimal, neutral stoichiometry and build by opposite-charge joins', () => {
  for (const entry of IONIC_COMPOUNDS) {
    const template = ionicTemplate(entry);
    assert.ok(validIonicGraph(template), entry.formula);
    assert.equal(netCharge(template), 0, entry.formula);
    let graph = { atoms: template.atoms, bonds: [] };
    for (const edge of template.bonds) { graph = joinIons(graph, edge.a, edge.b); assert.ok(graph, entry.formula); }
    assert.deepEqual(matchIonicCompound(graph), { compound: entry, units: 1 });
    for (let divisor = 2; divisor <= Math.min(entry.positiveCount, entry.negativeCount); divisor++) assert.ok(entry.positiveCount % divisor || entry.negativeCount % divisor);
  }
});

test('same-sign ions, duplicate joins, unsupported species and disconnected neutral ions cannot unlock', () => {
  assert.equal(joinIons(make(['Na', 'K']), '0', '1'), null);
  assert.equal(joinIons(make(['Cl', 'F']), '0', '1'), null);
  assert.equal(joinIons(make(['Na', 'C']), '0', '1'), null);
  assert.equal(matchIonicCompound(make(['Na', 'Cl'])), null);
  const joined = joinIons(make(['Na', 'Cl']), '0', '1');
  assert.equal(joinIons(joined, '1', '0'), null);
  assert.equal(validIonicGraph({ ...joined, bonds: [{ a: '0', b: '1', order: 2 }] }), false);
  assert.equal(validIonicGraph({ ...joined, atoms: [joined.atoms[0], { ...joined.atoms[1], id: '0' }] }), false);
});

test('a neutral but unlisted pair and a multi-species mixture are not classified as a known salt', () => {
  const unknown = joinIons(make(['K', 'F']), '0', '1');
  assert.equal(netCharge(unknown), 0); assert.equal(matchIonicCompound(unknown), null);
  let mixed = make(['Na', 'K', 'Cl', 'Cl']);
  for (const [a, b] of [['0', '2'], ['1', '2'], ['1', '3']]) mixed = joinIons(mixed, a, b);
  assert.equal(netCharge(mixed), 0); assert.equal(matchIonicCompound(mixed), null);
});

test('a multiple of the formula ratio is recognized as several units, not a new molecule', () => {
  let graph = make(['Na', 'Na', 'Cl', 'Cl']);
  for (const [a, b] of [['0', '2'], ['1', '2'], ['1', '3']]) graph = joinIons(graph, a, b);
  const match = matchIonicCompound(graph);
  assert.equal(match.compound.formula, 'NaCl'); assert.equal(match.units, 2);
  assert.equal(matchIonicCompound(components(removeAtoms(graph, ['3']))[0]), null);
});

test('deleting an ionic group preserves a separate group and single-ion deletion changes charge', () => {
  const a = ionicTemplate(byFormula('NaCl'));
  const b = ionicTemplate(byFormula('CaCl₂'));
  b.atoms = b.atoms.map(atom => ({ ...atom, id: 'b' + atom.id }));
  b.bonds = b.bonds.map(edge => ({ ...edge, a: 'b' + edge.a, b: 'b' + edge.b }));
  const combined = { atoms: [...a.atoms, ...b.atoms], bonds: [...a.bonds, ...b.bonds] };
  assert.deepEqual(removeComponent(combined, '0'), b);
  assert.equal(netCharge(removeAtoms(a, ['1'])), 1);
});

test('staged ionic hints reveal count, symbols, charges and finally the ratio', () => {
  const entry = byFormula('Al₂O₃');
  assert.match(ionicHint(entry, 1), /5개/); assert.doesNotMatch(ionicHint(entry, 1), /Al|O|알루미늄/);
  assert.match(ionicHint(entry, 2), /Al · O/); assert.doesNotMatch(ionicHint(entry, 2), /³|²|2개|3개/);
  assert.match(ionicHint(entry, 3), /Al³⁺ · O²⁻/);
  assert.match(ionicHint(entry, 4), /Al³⁺ 2개 \+ O²⁻ 3개/);
});

test('NaCl lattice has 1:1 charge balance and six opposite-sign neighbors at an interior site', () => {
  const points = ionicModel(byFormula('NaCl'));
  assert.equal(points.length, 64);
  assert.equal(points.filter(p => p.symbol === 'Na').length, 32);
  const center = points.find(p => p.position.every(value => value === -.5));
  const neighbors = points.filter(p => Math.abs(Math.hypot(...p.position.map((value, i) => value - center.position[i])) - 1) < 1e-9);
  assert.equal(neighbors.length, 6);
  assert.ok(neighbors.every(p => ION_CHARGES[p.symbol] * ION_CHARGES[center.symbol] < 0));
  for (const entry of IONIC_COMPOUNDS.filter(entry => entry.lattice === 'composition')) {
    const model = ionicModel(entry);
    assert.equal(model.filter(p => p.symbol === entry.cation).length, entry.positiveCount * 3);
    assert.equal(model.filter(p => p.symbol === entry.anion).length, entry.negativeCount * 3);
    assert.equal(new Set(model.map(p => p.position.join(','))).size, model.length);
  }
});

test('ionic discoveries persist across reads without changing existing molecular progress', () => {
  const storage = memory(), molecularKey = collectionKey('/'), ionicKey = ionicCollectionKey('/');
  saveLocalDiscovery(storage, molecularKey, templateGraph(MOLECULES.find(m => m.id === 'water')));
  const previous = storage.getItem(molecularKey);
  const firstDate = new Date('2026-09-21T00:00:00Z');
  const graph = ionicTemplate(byFormula('NaCl'));
  saveIonicDiscovery(storage, ionicKey, graph, firstDate);
  saveIonicDiscovery(storage, ionicKey, graph, new Date('2026-09-22T00:00:00Z'));
  assert.equal(readIonicCollection(storage, ionicKey)['ionic-nacl'].discoveredAt, firstDate.toISOString());
  assert.equal(Object.keys(readIonicCollection(storage, ionicKey)).length, 1);
  assert.equal(storage.getItem(molecularKey), previous);
  assert.ok(readCollection(storage, molecularKey).water);
  assert.deepEqual(readIonicCollection(storage, ionicCollectionKey('/other/')), {});
});

test('ionic save errors do not erase progress; retry succeeds after storage recovers', () => {
  const storage = memory(), key = ionicCollectionKey('/');
  saveIonicDiscovery(storage, key, ionicTemplate(byFormula('NaCl')));
  const previous = storage.getItem(key);
  const broken = { ...storage, setItem: () => { throw new Error('quota'); } };
  assert.throws(() => saveIonicDiscovery(broken, key, ionicTemplate(byFormula('MgO'))), /저장하지 못했어요/);
  assert.equal(storage.getItem(key), previous);
  saveIonicDiscovery(storage, key, ionicTemplate(byFormula('MgO')));
  assert.equal(Object.keys(readIonicCollection(storage, key)).length, 2);
  storage.setItem(key, 'broken JSON');
  assert.throws(() => saveIonicDiscovery(storage, key, ionicTemplate(byFormula('CaCl₂'))), /덮어쓰지/);
  assert.equal(storage.getItem(key), 'broken JSON');
});
