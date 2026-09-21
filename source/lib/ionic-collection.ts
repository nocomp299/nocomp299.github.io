import type { Graph } from './chemistry.ts';
import { IONIC_COMPOUNDS, matchIonicCompound } from './ionic.ts';
import { collectionKey, type Discovery } from './local-collection.ts';

type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
export type IonicCollection = Record<string, Discovery>;
export const ionicCollectionKey = (pathname: string) => `${collectionKey(pathname)}:ionic`;
const ids = new Set(IONIC_COMPOUNDS.map(entry => entry.id));

export function readIonicCollection(storage: StoragePort, key: string): IonicCollection {
  let raw: string | null;
  try { raw = storage.getItem(key); }
  catch { throw new Error('이온 도감 저장 공간에 접근할 수 없어요. 사이트 데이터 설정을 확인해 주세요.'); }
  if (raw === null) return {};
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !Array.isArray(value.discoveries)) throw new Error();
    const result: IonicCollection = {};
    for (const entry of value.discoveries) {
      if (!entry || !ids.has(entry.moleculeId) || typeof entry.discoveredAt !== 'string' || !Number.isFinite(Date.parse(entry.discoveredAt))) throw new Error();
      if (!result[entry.moleculeId] || entry.discoveredAt < result[entry.moleculeId].discoveredAt) result[entry.moleculeId] = { moleculeId: entry.moleculeId, discoveredAt: entry.discoveredAt };
    }
    return result;
  } catch { throw new Error('이온 도감을 읽지 못했어요. 기존 기록은 덮어쓰지 않았어요.'); }
}
export function saveIonicDiscovery(storage: StoragePort, key: string, graph: Graph, now = new Date()): IonicCollection {
  const match = matchIonicCompound(graph);
  if (!match) throw new Error('연결된 이온의 종류와 전하 비율을 확인해 주세요.');
  const values = readIonicCollection(storage, key);
  if (values[match.compound.id]) return values;
  values[match.compound.id] = { moleculeId: match.compound.id, discoveredAt: now.toISOString() };
  try { storage.setItem(key, JSON.stringify({ version: 1, discoveries: Object.values(values) })); }
  catch { throw new Error('이온 도감을 저장하지 못했어요. 저장 공간과 사이트 데이터 설정을 확인해 주세요.'); }
  return values;
}
