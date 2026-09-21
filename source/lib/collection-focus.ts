export function centeredScrollOffset(scrollTop: number, viewportTop: number, viewportHeight: number, cardTop: number, cardHeight: number, scrollHeight: number): number {
  const target = scrollTop + cardTop - viewportTop - (viewportHeight - cardHeight) / 2;
  return Math.max(0, Math.min(Math.max(0, scrollHeight - viewportHeight), target));
}

/** Only scroll the collection viewport. Edge padding lets even the first/last row be centered. */
export function centerCollectionCard(grid: HTMLElement, card: HTMLElement, smooth: boolean): void {
  grid.classList.add('collection-has-target');
  grid.style.setProperty('--collection-edge-space', `${Math.max(16, (grid.clientHeight - card.offsetHeight) / 2)}px`);
  card.focus({ preventScroll: true });
  const viewport = grid.getBoundingClientRect(), item = card.getBoundingClientRect();
  grid.scrollTo({ top: centeredScrollOffset(grid.scrollTop, viewport.top + grid.clientTop, grid.clientHeight, item.top, item.height, grid.scrollHeight), behavior: smooth ? 'smooth' : 'auto' });
}
