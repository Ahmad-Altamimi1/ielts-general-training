import * as React from "react";

function subscribe() {
  // Hydration happens once; there is nothing to subscribe to afterwards.
  return () => {};
}

/**
 * False during server render and the hydration pass, true afterwards.
 *
 * Used where the correct output genuinely depends on the browser — the
 * resolved theme, a value read from localStorage — so that the server
 * markup and the first client render agree, then update together.
 */
export function useIsHydrated() {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
