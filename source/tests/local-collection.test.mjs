import test from 'node:test';
import assert from 'node:assert/strict';
import { MOLECULES, templateGraph } from '../lib/chemistry.ts';
import { collectionKey, readCollection, saveLocalDiscovery } from '../lib/local-collection.ts';

function memoryStorage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
const graph = id => templateGraph(MOLECULES.find(m => m.id === id));
const key = collectionKey('/alchemist/');

test('a fresh reader retains discoveries and repeated discoveries keep the original date', () => {
  const storage = memoryStorage();
  const first = new Date('2026-01-01T00:00:00Z');
  saveLocalDiscovery(storage, key, graph('water'), first);
  saveLocalDiscovery(storage, key, graph('water'), new Date('2026-02-01T00:00:00Z'));
  saveLocalDiscovery(storage, key, graph('propane'));
  const loaded = readCollection(storage, key);
  assert.deepEqual(Object.keys(loaded).sort(), ['propane', 'water']);
  assert.equal(loaded.water.discoveredAt, first.toISOString());
});

test('GitHub project paths have independent collections; index.html shares the directory key', () => {
  assert.equal(collectionKey('/alchemist/'), collectionKey('/alchemist/index.html'));
  assert.equal(collectionKey('/alchemist'), collectionKey('/alchemist/'));
  assert.equal(collectionKey('/'), collectionKey('/index.html'));
  const storage = memoryStorage();
  saveLocalDiscovery(storage, key, graph('water'));
  assert.deepEqual(readCollection(storage, collectionKey('/another-game/')), {});
});

test('invalid molecule structures are rejected without creating progress', () => {
  const storage = memoryStorage();
  assert.throws(() => saveLocalDiscovery(storage, key, { atoms: [], bonds: [] }));
  assert.equal(storage.getItem(key), null);
});

test('quota and blocked storage failures surface and preserve earlier progress', () => {
  const storage = memoryStorage();
  saveLocalDiscovery(storage, key, graph('water'));
  const previous = storage.getItem(key);
  const blockedWrite = { ...storage, setItem: () => { throw new Error('QuotaExceededError'); } };
  assert.throws(() => saveLocalDiscovery(blockedWrite, key, graph('propane')), /저장하지 못했어요/);
  assert.equal(storage.getItem(key), previous);
  assert.throws(() => readCollection({ getItem: () => { throw new Error('SecurityError'); } }, key), /사용할 수 없어요/);
});

test('corrupt or incompatible stored records are never silently overwritten', () => {
  const storage = memoryStorage();
  for (const raw of ['{broken', JSON.stringify({ version: 2, discoveries: [] }), JSON.stringify({ version: 1, discoveries: [{ moleculeId: 'water', discoveredAt: 'invalid' }] })]) {
    storage.setItem(key, raw);
    assert.throws(() => saveLocalDiscovery(storage, key, graph('water')), /덮어쓰지 않았어요/);
    assert.equal(storage.getItem(key), raw);
  }
});
