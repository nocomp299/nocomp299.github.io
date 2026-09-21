import test from 'node:test';
import assert from 'node:assert/strict';
import { MOLECULES, templateGraph, connect, matchMolecule } from '../lib/chemistry.ts';
import { ISOMER_MOLECULES } from '../lib/isomer-catalog.ts';
import { molecularFormula, isomerFamily } from '../lib/isomers.ts';
import { claimFirstDiscovery } from '../lib/discovery-feedback.ts';
import { collectionKey, saveLocalDiscovery, readCollection } from '../lib/local-collection.ts';
import { IONIC_COMPOUNDS, ionicTemplate, matchIonicCompound } from '../lib/ionic.ts';
import { ionicCollectionKey, saveIonicDiscovery, readIonicCollection } from '../lib/ionic-collection.ts';
import { centerCollectionCard, centeredScrollOffset } from '../lib/collection-focus.ts';

const molecule = id => MOLECULES.find(m => m.id === id);
function storage() { const map = new Map(); return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) }; }
function freshIds(g, prefix) { return { atoms: g.atoms.map(a => ({ ...a, id: prefix + a.id })), bonds: g.bonds.map(b => ({ ...b, a: prefix + b.a, b: prefix + b.b })) }; }

test('all 15 new isomers can be built bond-by-bond and distinguished without atom numbering', () => {
  assert.equal(ISOMER_MOLECULES.length, 15);
  for (const m of ISOMER_MOLECULES) {
    const source = templateGraph(m); let graph = { atoms: source.atoms, bonds: [] };
    for (const bond of source.bonds) { graph = connect(graph, bond.a, bond.b); assert.ok(graph, m.id); }
    assert.equal(matchMolecule(freshIds(graph, 'rebuilt-'), true)?.molecule.id, m.id);
    assert.equal(molecularFormula(m), m.formula, m.id);
    assert.ok(isomerFamily(m).length >= 2);
  }
});
test('complete alkane and C4H10O families use actual atom counts, including condensed formulas', () => {
  for (const [id, formula, count] of [['pentane','C₅H₁₂',3],['hexane','C₆H₁₄',5],['1-butanol','C₄H₁₀O',7],['1-propanol','C₃H₈O',3]]) {
    const family = isomerFamily(molecule(id));
    assert.equal(family.length, count, id);
    assert.ok(family.every(m => molecularFormula(m) === formula));
    assert.equal(new Set(family.map(m => matchMolecule(templateGraph(m), true).molecule.id)).size, count);
  }
  assert.deepEqual(isomerFamily(molecule('water')).map(m => m.id), ['water']);
});
test('old collection dates survive adding new isomers and separate structures save separately', () => {
  const db = storage(), key = collectionKey('/'), date = '2026-01-01T00:00:00.000Z';
  db.setItem(key, JSON.stringify({ version: 1, discoveries: [{ moleculeId: 'water', discoveredAt: date }] }));
  for (const m of isomerFamily(molecule('hexane'))) saveLocalDiscovery(db, key, templateGraph(m));
  const restored = readCollection(db, key);
  assert.equal(Object.keys(restored).length, 6);
  assert.equal(restored.water.discoveredAt, date);
});
test('molecule reassembly with new atoms and a fresh session never replays discovery feedback', () => {
  const db = storage(), key = collectionKey('/'), announced = new Set();
  const water = templateGraph(molecule('water'));
  assert.equal(claimFirstDiscovery('water', {}, {}, announced), true);
  const saved = saveLocalDiscovery(db, key, water);
  const rebuilt = freshIds(water, 'other-');
  assert.equal(matchMolecule(rebuilt, true).molecule.id, 'water');
  assert.equal(claimFirstDiscovery('water', saved, {}, announced), false);
  assert.equal(claimFirstDiscovery('water', readCollection(db, key), {}, new Set()), false);
  assert.equal(claimFirstDiscovery('ethanol', saved, {}, announced), true);
});
test('ionic rediscovery remains silent across new groups and reloads', () => {
  const db = storage(), key = ionicCollectionKey('/'), entry = IONIC_COMPOUNDS[0], announced = new Set();
  const group = ionicTemplate(entry);
  assert.equal(claimFirstDiscovery(entry.id, {}, {}, announced), true);
  saveIonicDiscovery(db, key, group);
  const rebuilt = freshIds(group, 'new-');
  assert.equal(matchIonicCompound(rebuilt).compound.id, entry.id);
  assert.equal(claimFirstDiscovery(entry.id, readIonicCollection(db, key), {}, new Set()), false);
});
test('several groups and failed writes cannot queue repeated popups for one substance', () => {
  const announced = new Set();
  assert.equal(claimFirstDiscovery('water', {}, {}, announced), true);
  assert.equal(claimFirstDiscovery('water', {}, {}, announced), false);
  assert.equal(claimFirstDiscovery('water', {}, { water: templateGraph(molecule('water')) }, new Set()), false);
  assert.equal(claimFirstDiscovery('ethanol', {}, {}, announced), true);
});
test('centering handles a scrolled collection and clamps unreachable offsets', () => {
  assert.equal(centeredScrollOffset(600, 180, 500, 680, 180, 4000), 940);
  assert.equal(centeredScrollOffset(0, 180, 500, 180, 180, 4000), 0);
  assert.equal(centeredScrollOffset(100, 180, 500, 600, 180, 650), 150);
});
test('first and last collection cards are centered inside their viewport with reduced motion respected', () => {
  for (const index of [0, 19, 37]) for (const smooth of [true, false]) {
    let padding = 0, scroll = null, focused = false;
    const height = 500, cardHeight = 180, top = 230, gap = 13, rows = 38;
    const grid = { clientHeight: height, clientTop: 0, scrollTop: 0,
      classList: { add: () => {} },
      style: { setProperty: (_, value) => { padding = parseFloat(value); } },
      get scrollHeight() { return padding * 2 + rows * cardHeight + (rows - 1) * gap; },
      getBoundingClientRect: () => ({ top }), scrollTo: options => { scroll = options; } };
    const card = { offsetHeight: cardHeight, focus: options => { assert.equal(options.preventScroll, true); focused = true; },
      getBoundingClientRect: () => ({ top: top + padding + index * (cardHeight + gap), height: cardHeight }) };
    centerCollectionCard(grid, card, smooth);
    assert.equal(top + padding + index * (cardHeight + gap) - scroll.top + cardHeight / 2, top + height / 2);
    assert.equal(scroll.behavior, smooth ? 'smooth' : 'auto'); assert.equal(focused, true);
  }
});
