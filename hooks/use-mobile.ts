import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

// The server cannot know the viewport. Render the desktop sidebar and let
// hydration correct it, rather than guessing mobile and reflowing.
function getServerSnapshot() {
  return false;
}

/**
 * Reads the viewport as an external store.
 *
 * The version shadcn ships sets state inside an effect, which Next 16's
 * React Compiler lint rejects. `useSyncExternalStore` is the primitive
 * built for subscribing to a browser API, and it is SSR-safe.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
