import { useRef, useState } from "react";

/*
  ─── useReorderableThumbnails ───────────────────────────────
  Shared drag-to-reorder logic for image thumbnails, used by
  both the Garment and Fabric wizards' image steps.

  Why this exists: native HTML5 drag-and-drop (`draggable`,
  `onDragStart`, `onDrop`) only fires for mouse pointers —
  touchscreens never trigger those events at all, which is why
  reordering worked on desktop but silently did nothing on
  mobile. This hook adds a parallel touch-event implementation
  (long-press to pick up, drag finger to reorder, lift to drop)
  so the same thumbnail grid works with either input method,
  without pulling in a drag-and-drop library.

  Usage: spread `getItemProps(index)` onto each thumbnail's
  container div. It returns both the mouse `draggable`/`onDrag*`
  props and the touch `onTouchStart`/`onTouchMove`/`onTouchEnd`
  handlers, so no per-file duplication is needed.
--------------------------------------------------------------*/
export default function useReorderableThumbnails(items, onReorder) {
  const [dragIndex, setDragIndex] = useState(null);
  const [touchOverIndex, setTouchOverIndex] = useState(null);
  const touchStartPos = useRef(null);
  const longPressTimer = useRef(null);
  const isDraggingTouch = useRef(false);

  const reorder = (fromIndex, toIndex) => {
    if (fromIndex === null || fromIndex === toIndex) return;
    const newItems = [...items];
    const [moved] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, moved);
    onReorder(newItems);
  };

  // ── Mouse (desktop) ─────────────────────────────────────
  const handleDragStart = (index) => setDragIndex(index);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    reorder(dragIndex, dropIndex);
    setDragIndex(null);
  };

  // ── Touch (mobile) ──────────────────────────────────────
  // A short delay before "picking up" a thumbnail means a quick
  // tap still scrolls the page normally — only a deliberate
  // press-and-hold starts a reorder, same expectation mobile
  // users already have from apps like Google Photos.
  const handleTouchStart = (index, e) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };

    longPressTimer.current = setTimeout(() => {
      isDraggingTouch.current = true;
      setDragIndex(index);
      if (navigator.vibrate) navigator.vibrate(15);
    }, 250);
  };

  const handleTouchMove = (e) => {
    if (!isDraggingTouch.current) {
      // Cancel the long-press if the finger moves before it fires —
      // that means the seller is scrolling, not trying to reorder.
      const touch = e.touches[0];
      const start = touchStartPos.current;
      if (start) {
        const dx = Math.abs(touch.clientX - start.x);
        const dy = Math.abs(touch.clientY - start.y);
        if (dx > 10 || dy > 10) {
          clearTimeout(longPressTimer.current);
        }
      }
      return;
    }

    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const thumbnail = el?.closest("[data-thumb-index]");
    if (thumbnail) {
      const index = parseInt(thumbnail.getAttribute("data-thumb-index"), 10);
      setTouchOverIndex(index);
    }
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer.current);
    if (isDraggingTouch.current && touchOverIndex !== null) {
      reorder(dragIndex, touchOverIndex);
    }
    isDraggingTouch.current = false;
    setDragIndex(null);
    setTouchOverIndex(null);
    touchStartPos.current = null;
  };

  const getItemProps = (index) => ({
    "data-thumb-index": index,
    draggable: true,
    onDragStart: () => handleDragStart(index),
    onDragOver: handleDragOver,
    onDrop: (e) => handleDrop(e, index),
    onTouchStart: (e) => handleTouchStart(index, e),
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    style: { touchAction: dragIndex !== null ? "none" : "pan-y" },
  });

  const isActive = (index) =>
    dragIndex === index || (isDraggingTouch.current && touchOverIndex === index);

  return { getItemProps, isActive, dragIndex };
}
