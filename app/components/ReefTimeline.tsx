"use client";

import {
  type ComponentType,
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  Sparkles,
  Sprout,
  SunMedium,
  ThermometerSun,
  TriangleAlert,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { ReefPhase } from "./ReefScene";

type Stage = {
  phase: ReefPhase;
  label: string;
  title: string;
  caption: string;
  signal: string;
  narration: string;
  color: string;
  icon: ComponentType<{ "aria-hidden"?: boolean }>;
};

const stages: Stage[] = [
  {
    phase: "healthy",
    label: "Stable season",
    title: "A partnership builds a city.",
    caption:
      "Coral polyps shelter algae; sunlight becomes energy, and limestone becomes habitat.",
    signal: "COLOR + GROWTH",
    narration:
      "On a healthy reef, coral polyps share a home with microscopic algae. Sunlight becomes energy, and generations of skeleton become shelter.",
    color: "#68f0d0",
    icon: SunMedium,
  },
  {
    phase: "heat",
    label: "Heat builds",
    title: "Heat breaks the bargain.",
    caption:
      "Weeks of unusual warmth stress the algae before the colony looks white.",
    signal: "STRESS RISING",
    narration:
      "The reef remembers heat over weeks, not moments. As warm water persists, its microscopic partners become damaging instead of helpful.",
    color: "#ffc35a",
    icon: ThermometerSun,
  },
  {
    phase: "bleaching",
    label: "Bleaching",
    title: "White is a warning—not a grave.",
    caption:
      "Bleached coral is alive, but hungry. Continued heat can turn stress into disease and death.",
    signal: "ALIVE · AT RISK",
    narration:
      "A bleached coral is not dead. Its clear tissue reveals the white skeleton after it loses much of its algae. Recovery is possible if the heat eases.",
    color: "#f4efe3",
    icon: TriangleAlert,
  },
  {
    phase: "recovery",
    label: "Recovery window",
    title: "Give the reef time and room.",
    caption:
      "Clean water and protected grazers help recovery; restoration cannot replace climate action.",
    signal: "RESILIENCE RETURNS",
    narration:
      "If heat eases, surviving coral can regain its algae. Clean water, grazing fish and careful restoration help, while emissions cuts protect its long-term future.",
    color: "#8edc84",
    icon: Sprout,
  },
];

export type ReefTimelineProps = {
  className?: string;
  guideOn?: boolean;
  onNarrate?: (line: string) => void;
  onStageChange?: (phase: ReefPhase) => void;
  onClose?: () => void;
};

export default function ReefTimeline({
  className = "",
  guideOn = false,
  onNarrate,
  onStageChange,
  onClose,
}: ReefTimelineProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const narrateRef = useRef(onNarrate);
  const phaseChangeRef = useRef(onStageChange);
  const lastNarratedRef = useRef<string | null>(null);
  const stage = stages[stageIndex];
  const StageIcon = stage.icon;

  useEffect(() => {
    narrateRef.current = onNarrate;
  }, [onNarrate]);

  useEffect(() => {
    phaseChangeRef.current = onStageChange;
  }, [onStageChange]);

  useEffect(() => {
    phaseChangeRef.current?.(stage.phase);

    const narrationKey = guideOn ? stage.phase : null;
    if (narrationKey && lastNarratedRef.current !== narrationKey) {
      lastNarratedRef.current = narrationKey;
      narrateRef.current?.(stage.narration);
    }
    if (!guideOn) lastNarratedRef.current = null;
  }, [guideOn, stage]);

  useEffect(() => {
    if (!playing) return;

    const timer = window.setTimeout(() => {
      const next = Math.min(stageIndex + 1, stages.length - 1);
      setStageIndex(next);
      if (next === stages.length - 1) setPlaying(false);
    }, 5600);

    return () => window.clearTimeout(timer);
  }, [playing, stageIndex]);

  const goTo = (next: number) => {
    setPlaying(false);
    setStageIndex(Math.max(0, Math.min(next, stages.length - 1)));
  };

  const togglePlay = () => {
    if (stageIndex === stages.length - 1) setStageIndex(0);
    setPlaying((current) => !current);
  };

  return (
    <section
      className={`reef-timeline ${className}`.trim()}
      data-phase={stage.phase}
      style={{ "--phase-color": stage.color } as CSSProperties}
      aria-label="Reef time dive"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") goTo(stageIndex - 1);
        if (event.key === "ArrowRight") goTo(stageIndex + 1);
        if (event.key === "Escape") onClose?.();
      }}
    >
      <header className="reef-timeline__bar">
        <span className="reef-timeline__brand">
          <Sparkles aria-hidden />
          Time dive
        </span>
        <span className="reef-timeline__guide" aria-label={guideOn ? "Guide narration on" : "Guide narration off"}>
          {guideOn ? <Volume2 aria-hidden /> : <VolumeX aria-hidden />}
          <span>{guideOn ? "Guide on" : "Guide off"}</span>
        </span>
        <button
          type="button"
          className="reef-timeline__close"
          onClick={onClose}
          aria-label="Close time dive"
        >
          <X aria-hidden />
        </button>
      </header>

      <article className="reef-timeline__story" aria-live="polite">
        <span className="reef-timeline__stage">
          <StageIcon aria-hidden />
          {stage.label}
        </span>
        <h2>{stage.title}</h2>
        <p>{stage.caption}</p>
        <strong>{stage.signal}</strong>
      </article>

      <div className="reef-timeline__controls">
        <button
          type="button"
          className="reef-timeline__step-button"
          onClick={() => goTo(stageIndex - 1)}
          disabled={stageIndex === 0}
          aria-label="Previous reef stage"
        >
          <ArrowLeft aria-hidden />
        </button>

        <button
          type="button"
          className="reef-timeline__play"
          onClick={togglePlay}
          aria-label={playing ? "Pause time dive" : "Play time dive"}
        >
          {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
        </button>

        <nav className="reef-timeline__scrub" aria-label="Reef stages">
          {stages.map((item, index) => (
            <button
              type="button"
              key={item.phase}
              className={index === stageIndex ? "is-active" : index < stageIndex ? "is-past" : ""}
              onClick={() => goTo(index)}
              aria-current={index === stageIndex ? "step" : undefined}
              aria-label={`Stage ${index + 1}: ${item.label}`}
            >
              <i aria-hidden />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="reef-timeline__step-button"
          onClick={() => goTo(stageIndex + 1)}
          disabled={stageIndex === stages.length - 1}
          aria-label="Next reef stage"
        >
          <ArrowRight aria-hidden />
        </button>
      </div>

      <a
        className="reef-timeline__source"
        href="https://oceanservice.noaa.gov/facts/coral_bleach.html"
        target="_blank"
        rel="noreferrer"
      >
        NOAA science
      </a>
    </section>
  );
}
