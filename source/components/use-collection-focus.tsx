import { useCallback, useEffect, useState } from 'react';
import { centerCollectionCard } from '@/lib/collection-focus';

export function useCollectionFocus(open: boolean, targetId: string | null, ready = true) {
  const [grid, setGrid] = useState<HTMLDivElement | null>(null);
  const gridRef = useCallback((node: HTMLDivElement | null) => setGrid(node), []);
  useEffect(() => {
    if (!open || !grid || !targetId || !ready) return;
    let frame = 0;
    const focus = () => {
      const card = Array.from(grid.querySelectorAll<HTMLElement>('[data-collection-id]')).find(node => node.dataset.collectionId === targetId);
      if (card) centerCollectionCard(grid, card, !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };
    frame = requestAnimationFrame(() => { frame = requestAnimationFrame(focus); });
    return () => cancelAnimationFrame(frame);
  }, [open, grid, targetId, ready]);
  return gridRef;
}
