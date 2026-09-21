import { MOLECULES, matchMolecule, type Graph } from "./chemistry.ts";

export type Discovery = { moleculeId: string; discoveredAt: string };
type StoragePort = Pick<Storage, "getItem" | "setItem">;
type Collection = Record<string, Discovery>;
const knownIds = new Set(MOLECULES.map(m => m.id));

// GitHub project sites share an origin, so scope records to the game's directory.
export function collectionKey(pathname: string): string {
  const path = pathname.replace(/\/index\.html$/, "/");
  return `alchemist:collection:v1:${path.endsWith("/") ? path : path + "/"}`;
}

export function readCollection(storage: StoragePort, key: string): Collection {
  let raw: string | null;
  try { raw = storage.getItem(key); }
  catch { throw new Error("브라우저 저장을 사용할 수 없어요. 사이트 데이터 허용 설정을 확인해 주세요."); }
  if (raw === null) return {};
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") throw new Error();
    const data = value as { version?: unknown; discoveries?: unknown };
    if (data.version !== 1 || !Array.isArray(data.discoveries)) throw new Error();
    const entries: Collection = {};
    for (const entry of data.discoveries) {
      if (!entry || typeof entry.moleculeId !== "string" || !knownIds.has(entry.moleculeId)
        || typeof entry.discoveredAt !== "string" || !Number.isFinite(Date.parse(entry.discoveredAt))) throw new Error();
      if (!entries[entry.moleculeId] || entry.discoveredAt < entries[entry.moleculeId].discoveredAt) {
        entries[entry.moleculeId] = { moleculeId: entry.moleculeId, discoveredAt: entry.discoveredAt };
      }
    }
    return entries;
  } catch {
    // Never silently replace unreadable progress with an empty collection.
    throw new Error("저장된 도감을 읽지 못했어요. 기존 기록은 덮어쓰지 않았어요.");
  }
}

export function saveLocalDiscovery(storage: StoragePort, key: string, graph: Graph, now = new Date()): Collection {
  const result = matchMolecule(graph, true);
  if (!result) throw new Error("도감에 등록된 분자 구조를 완성해 주세요.");
  const entries = readCollection(storage, key);
  const id = result.molecule.id;
  if (entries[id]) return entries;
  entries[id] = { moleculeId: id, discoveredAt: now.toISOString() };
  try { storage.setItem(key, JSON.stringify({ version: 1, discoveries: Object.values(entries) })); }
  catch { throw new Error("도감을 저장하지 못했어요. 브라우저 저장 공간과 사이트 데이터 허용 설정을 확인해 주세요."); }
  return entries;
}
