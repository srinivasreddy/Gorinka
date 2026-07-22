"use client";

import { useRef } from "react";
import type { TouchEvent } from "react";

const MIN_SWIPE_DISTANCE = 50;

interface SwipeGestureOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export function useSwipeGesture({ onSwipeLeft, onSwipeRight }: SwipeGestureOptions) {
  const start = useRef<{ x: number; y: number } | null>(null);

  function onTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    start.current = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchEnd(event: TouchEvent) {
    if (!start.current) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.current.x;
    const deltaY = touch.clientY - start.current.y;
    start.current = null;

    // Ignore mostly-vertical drags so page scrolling isn't hijacked as a swipe.
    if (Math.abs(deltaX) < MIN_SWIPE_DISTANCE || Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX > 0) onSwipeRight();
    else onSwipeLeft();
  }

  return { onTouchStart, onTouchEnd };
}
