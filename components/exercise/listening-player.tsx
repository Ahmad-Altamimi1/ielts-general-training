"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Headphones, Play, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useIsHydrated } from "@/hooks/use-hydrated";
import { useVoices } from "@/hooks/use-voices";
import type { BlockOf } from "@/lib/content/schema";

type Phase = "idle" | "speaking" | "done";

/** A voice that actually sounds like the test. Falls back to whatever the
 *  browser has rather than refusing to speak. */
function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const pool = english.length > 0 ? english : voices;
  return (
    pool.find((v) => v.lang.toLowerCase().startsWith("en-gb")) ??
    pool.find((v) => v.lang.toLowerCase().startsWith("en-au")) ??
    pool[0]
  );
}

/**
 * Plays a listening script aloud.
 *
 * The book's rule is the design: read once, at normal speed, with no
 * repetition, because getting used to hearing something once is half the
 * skill. So there is no scrub bar and no rewind — only Play, and Stop if
 * something has gone wrong. Playing again is possible but is labelled as
 * leaving exam conditions, so the student knows what they have given up.
 *
 * The script itself stays hidden behind a control: a student who reads it
 * first has not practised listening at all.
 */
export function ListeningPlayer({
  script,
}: {
  script: BlockOf<"script">;
}) {
  const hydrated = useIsHydrated();
  const voices = useVoices();
  const [phase, setPhase] = useState<Phase>("idle");
  const [plays, setPlays] = useState(0);
  const [showScript, setShowScript] = useState(false);
  const [supported, setSupported] = useState(true);
  const utterances = useRef<SpeechSynthesisUtterance[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cancel any speech if the student navigates away mid-recording.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const play = useCallback(() => {
    // A real recording, where there is one: a voice someone actually used
    // is worth more than a synthesised one.
    const element = audioRef.current;
    if (element) {
      element.currentTime = 0;
      setPhase("speaking");
      setPlays((n) => n + 1);
      void element.play().catch(() => setPhase("done"));
      return;
    }

    if (!("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    // The hook's list, not synth.getVoices(): Chrome's is empty on the
    // first call and the recording would play in the wrong voice.
    const voice = pickVoice(voices.length > 0 ? voices : synth.getVoices());
    utterances.current = script.lines.map((line, i) => {
      // The speaker's name is a stage direction, not something the
      // recording says, so it is not spoken.
      const utterance = new SpeechSynthesisUtterance(line.text);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang ?? "en-GB";
      utterance.rate = 1; // normal speed: the book is explicit about this
      if (i === script.lines.length - 1) {
        utterance.onend = () => setPhase("done");
      }
      return utterance;
    });

    setPhase("speaking");
    setPlays((n) => n + 1);
    for (const utterance of utterances.current) synth.speak(utterance);
  }, [script.lines, voices]);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setPhase("done");
  }, []);

  const label =
    script.recording ?? script.title ?? "Recording";

  return (
    <section
      aria-label={`${label}: listening`}
      className="print-hidden mt-6 overflow-hidden rounded-xl border border-layer-border bg-layer-strip"
    >
      {script.audio ? (
        // Deliberately without `controls`: a scrub bar is a rewind button,
        // and the whole point is that a recording plays once.
        <audio
          ref={audioRef}
          src={script.audio}
          preload="none"
          onEnded={() => setPhase("done")}
          onError={() => setSupported(false)}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3.5 sm:px-5">
        <Headphones aria-hidden="true" className="size-5 shrink-0 text-tone" />

        <p className="min-w-0 flex-1">
          <span className="font-heading block text-[0.6875rem] font-bold tracking-wider text-tone uppercase">
            {label}
          </span>
          <span className="block text-sm text-ink-muted">
            {phase === "speaking"
              ? "Playing. It will not repeat."
              : plays === 0
                ? script.audio
                  ? "A real recording. It plays once, as in the test."
                  : "Read aloud by this browser, once, at normal speed."
                : `Played ${plays} time${plays === 1 ? "" : "s"}.`}
          </span>
        </p>

        {phase === "speaking" ? (
          <Button type="button" variant="outline" size="sm" onClick={stop}>
            <Square aria-hidden="true" className="size-3.5 fill-current" />
            Stop
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={play}
            disabled={!hydrated}
            className="bg-tone text-brand-ink hover:bg-tone hover:opacity-90"
          >
            <Play aria-hidden="true" className="size-3.5 fill-current" />
            {plays === 0 ? "Play once" : "Play again"}
          </Button>
        )}
      </div>

      {plays > 1 ? (
        <p className="border-t border-layer-border px-4 py-2.5 text-xs text-ink-muted sm:px-5">
          You are no longer working under exam conditions — the real test
          plays each recording once.
        </p>
      ) : null}

      {!supported ? (
        <p className="border-t border-layer-border px-4 py-3 text-sm sm:px-5">
          {script.audio
            ? "The recording could not be played. Show the script below and read it to a partner instead."
            : "This browser cannot read the script aloud. Ask your teacher to read it, or show the script below and read it to a partner."}
        </p>
      ) : null}

      {script.credit ? (
        <p className="border-t border-layer-border px-4 py-2 text-xs text-ink-muted sm:px-5">
          Recording and transcript:{" "}
          {script.creditUrl ? (
            <a
              href={script.creditUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-ink"
            >
              {script.credit}
            </a>
          ) : (
            script.credit
          )}
        </p>
      ) : null}

      <div className="border-t border-layer-border px-4 py-2.5 sm:px-5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowScript((shown) => !shown)}
          aria-expanded={showScript}
        >
          {showScript ? (
            <EyeOff aria-hidden="true" className="size-3.5" />
          ) : (
            <Eye aria-hidden="true" className="size-3.5" />
          )}
          {showScript ? "Hide the script" : "Show the script"}
        </Button>

        {showScript ? (
          <div className="measure mt-3 border-l-2 border-rule pl-4">
            <p className="text-xs text-ink-muted">
              Reading this before you listen is not listening practice. It is
              here for checking afterwards, and for whoever reads it aloud.
            </p>
            <ol className="mt-3 space-y-2.5">
              {script.lines.map((line, i) => (
                <li key={i} className="passage-type text-base">
                  {line.speaker ? (
                    <span className="font-heading mr-2 text-sm font-semibold text-tone">
                      {line.speaker}:
                    </span>
                  ) : null}
                  {line.text}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </section>
  );
}
