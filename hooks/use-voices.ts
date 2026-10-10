import * as React from "react";

/**
 * The speech voices the browser has.
 *
 * Chrome loads them asynchronously: `getVoices()` returns an empty list on
 * first call and fills in later, which is why a naive player speaks its
 * first recording in the wrong voice. This subscribes to `voiceschanged`
 * and caches the result, so the snapshot stays referentially stable —
 * `getVoices()` returns a fresh array every call and would loop forever.
 */
const EMPTY: SpeechSynthesisVoice[] = [];
let cached: SpeechSynthesisVoice[] = EMPTY;

function subscribe(onStoreChange: () => void) {
  const synth = window.speechSynthesis;

  const update = () => {
    cached = synth.getVoices();
    onStoreChange();
  };

  synth.addEventListener("voiceschanged", update);

  // Some browsers have the list ready already and never fire the event.
  const ready = synth.getVoices();
  if (ready.length > 0) cached = ready;

  return () => synth.removeEventListener("voiceschanged", update);
}

function getSnapshot() {
  return cached;
}

function getServerSnapshot() {
  return EMPTY;
}

export function useVoices(): SpeechSynthesisVoice[] {
  return React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
}
