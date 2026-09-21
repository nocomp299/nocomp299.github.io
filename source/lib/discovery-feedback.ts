/** Claim before saving: saves can complete synchronously and several groups can match in one frame. */
export function claimFirstDiscovery(id: string, saved: Record<string, unknown>, pending: Record<string, unknown>, announced: Set<string>): boolean {
  if (saved[id] || pending[id] || announced.has(id)) return false;
  announced.add(id);
  return true;
}
