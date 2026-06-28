'use client';

import { RefObject, useEffect, useRef } from 'react';

const DRAG_THRESHOLD = 6;

type MouseDragScrollOptions = {
  ignoreInteractiveElements?: boolean;
};

export default function useMouseDragScroll<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: MouseDragScrollOptions = {},
) {
  const { ignoreInteractiveElements = true } = options;
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    suppressClick: false,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const resetDragging = () => {
      dragState.current.isDragging = false;
      el.style.cursor = '';
      el.style.userSelect = '';
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;

      const target = event.target as HTMLElement | null;
      if (ignoreInteractiveElements && target?.closest('a, button, input, textarea, select, label')) {
        return;
      }

      dragState.current.isDragging = true;
      dragState.current.startX = event.clientX;
      dragState.current.scrollLeft = el.scrollLeft;
      dragState.current.suppressClick = false;
      el.style.cursor = 'grabbing';
      el.style.userSelect = 'none';
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!dragState.current.isDragging) return;

      const deltaX = event.clientX - dragState.current.startX;
      if (Math.abs(deltaX) > DRAG_THRESHOLD) {
        dragState.current.suppressClick = true;
      }

      el.scrollLeft = dragState.current.scrollLeft - deltaX;
    };

    const handleMouseUp = () => {
      if (!dragState.current.isDragging) return;

      resetDragging();

      if (dragState.current.suppressClick) {
        window.setTimeout(() => {
          dragState.current.suppressClick = false;
        }, 0);
      }
    };

    const handleClickCapture = (event: MouseEvent) => {
      if (!dragState.current.suppressClick) return;

      event.preventDefault();
      event.stopPropagation();
      dragState.current.suppressClick = false;
    };

    const handleDragStart = (event: DragEvent) => {
      if (dragState.current.isDragging) {
        event.preventDefault();
      }
    };

    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('click', handleClickCapture, true);
    el.addEventListener('dragstart', handleDragStart);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      resetDragging();
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('click', handleClickCapture, true);
      el.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [ignoreInteractiveElements, ref]);
}
