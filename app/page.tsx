"use client";

/* Local, already-compressed Smithsonian renders must bypass framework image proxying. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Compass,
  Eye,
  ExternalLink,
  MapPin,
  MousePointer2,
  RotateCcw,
  ScanSearch,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
  Waves,
  X,
} from "lucide-react";
import ReefScene, {
  type ReefPhase,
  type ReefSceneHotspot,
} from "./components/ReefScene";
import ReefTimeline from "./components/ReefTimeline";
import { useReefGuide } from "./hooks/useReefGuide";

type Choice = {
  id: string;
  label: string;
  scientific: string;
  image: string;
};

type Hotspot = ReefSceneHotspot & {
  zone: string;
  depth: string;
  eyebrow: string;
  prompt: string;
  choices: Choice[];
  correct: string;
  fact: string;
  takeaway: string;
  voiceLine: string;
  sourceLabel: string;
  sourceUrl: string;
};

type Annotation = {
  hotspotId: string;
  label: string;
  health: string;
  by: string;
};

type Explorer = {
  id: string;
  name: string;
  color: string;
  lastSeen: number;
};

type ReefRoom = {
  code: string;
  explorers: Explorer[];
  annotations: Record<string, Annotation>;
  updatedAt: number;
};

const choices: Choice[] = [
  {
    id: "acropora-table",
    label: "Table coral",
    scientific: "Acropora hyacinthus",
    image: "/specimens/acropora-hyacinthus.jpg",
  },
  {
    id: "acropora-compact",
    label: "Compact branches",
    scientific: "Acropora humilis",
    image: "/specimens/acropora-humilis.jpg",
  },
  {
    id: "plesiastraea",
    label: "Massive colony",
    scientific: "Plesiastraea armata",
    image: "/specimens/plesiastraea-armata.jpg",
  },
];

const hotspots: Hotspot[] = [
  {
    id: "acro-table",
    label: "Colony A",
    position: [-8, 2.6, -11],
    zone: "Current Gate",
    depth: "14 m",
    eyebrow: "FOLLOW THE FLOW",
    prompt: "Which shape catches light while leaving shelter below?",
    choices,
    correct: "acropora-table",
    fact: "Wide tables harvest sunlight; the branches beneath become shelter for young fish.",
    takeaway: "Skeleton → shelter",
    voiceLine:
      "Look at the colony before naming it. Which shape catches the most light while leaving a sheltered maze below?",
    sourceLabel: "Smithsonian Open Access",
    sourceUrl:
      "https://3d.si.edu/object/3d/madrepora-surculosa%3Afb975479-5faf-4ab7-aaae-6fad92f7fd55",
  },
  {
    id: "acro-compact",
    label: "Colony B",
    position: [8, 2.2, -27],
    zone: "Turbid Shelf",
    depth: "17 m",
    eyebrow: "READ THE FORM",
    prompt: "Which colony keeps its branches short and tightly packed?",
    choices,
    correct: "acropora-compact",
    fact: "Shape is evidence, not certainty. Coral identification also needs corallites, place and close inspection.",
    takeaway: "Observe → infer",
    voiceLine:
      "These branches are short and crowded. Shape is useful evidence, but a careful scientist keeps room for uncertainty.",
    sourceLabel: "Smithsonian Open Access",
    sourceUrl:
      "https://3d.si.edu/object/3d/madrepora-humilis%3Ac921c012-5a3e-4e6f-9c24-7dda761115f4",
  },
  {
    id: "massive-star",
    label: "Colony C",
    position: [24, 2.7, -47],
    zone: "Archive Garden",
    depth: "20 m",
    eyebrow: "A REEF WITH MEMORY",
    prompt: "Which form invests in a dense, massive skeleton?",
    choices,
    correct: "plesiastraea",
    fact: "Massive colonies grow slowly, creating durable habitat that can outlast many human lifetimes.",
    takeaway: "Growth → memory",
    voiceLine:
      "This colony grows like a stone city instead of a fast branch. What might a slow, dense skeleton preserve?",
    sourceLabel: "Smithsonian Open Access",
    sourceUrl:
      "https://3d.si.edu/object/3d/plesiastraea-armata%3A0c967ce1-ef2f-420f-8d65-c371b5be3346",
  },
];

const emptyRoom: ReefRoom = {
  code: "DIVE",
  explorers: [],
  annotations: {},
  updatedAt: 0,
};

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [screen, setScreen] = useState<"dive" | "timeline" | "complete">("dive");
  const [reefPhase, setReefPhase] = useState<ReefPhase>("healthy");
  const [selected, setSelected] = useState<Hotspot | null>(null);
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);
  const [zone, setZone] = useState("Current Gate");
  const [depth, setDepth] = useState("14 m");
  const [sceneReady, setSceneReady] = useState(false);
  const [engine, setEngine] = useState("Reef");
  const [roomCode, setRoomCode] = useState("DIVE");
  const [room, setRoom] = useState<ReefRoom>(emptyRoom);
  const [localMapped, setLocalMapped] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const playerId = useId().replace(/[^a-zA-Z0-9]/g, "") || "explorer";
  const channel = useRef<BroadcastChannel | null>(null);

  const mappedIds = useMemo(
    () => Array.from(new Set([...localMapped, ...Object.keys(room.annotations)])),
    [localMapped, room.annotations],
  );

  const mappedCount = mappedIds.length;
  const guideContext = selected
    ? `${selected.zone}. The explorer is observing ${selected.label}. ${selected.fact}`
    : `${zone}, Sisters' Islands Marine Park expedition. ${mappedCount} of 3 observations complete.`;
  const guide = useReefGuide({ roomCode, context: guideContext });
  const announce = guide.announce;

  const sync = useCallback(
    async (action?: Record<string, unknown>) => {
      try {
        const response = await fetch(
          `/api/room?code=${encodeURIComponent(roomCode)}`,
          action
            ? {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(action),
              }
            : undefined,
        );
        if (!response.ok) return null;
        const data = (await response.json()) as ReefRoom;
        setRoom(data);
        channel.current?.postMessage(data);
        return data;
      } catch {
        return null;
      }
    },
    [roomCode],
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    const shared = (url.searchParams.get("room") || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    const timer = window.setTimeout(
      () => setRoomCode(shared || `R${randomId().slice(0, 5)}`.toUpperCase()),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!entered || roomCode === "DIVE") return;
    const name = `Explorer ${playerId.slice(0, 2).toUpperCase()}`;
    const joinTimer = window.setTimeout(
      () => void sync({ type: "join", id: playerId, name }),
      0,
    );
    channel.current = new BroadcastChannel(`reef-relay-${roomCode}`);
    channel.current.onmessage = (event) => setRoom(event.data as ReefRoom);
    const timer = window.setInterval(
      () => void sync({ type: "presence", id: playerId, name }),
      2200,
    );
    return () => {
      window.clearTimeout(joinTimer);
      window.clearInterval(timer);
      channel.current?.close();
      channel.current = null;
    };
  }, [entered, playerId, roomCode, sync]);

  useEffect(() => {
    if (!entered || !showCoach) return;
    const timer = window.setTimeout(() => setShowCoach(false), 5600);
    return () => window.clearTimeout(timer);
  }, [entered, showCoach]);

  useEffect(() => {
    if (!selected || guide.status === "off") return;
    announce(selected.voiceLine);
  }, [announce, guide.status, selected]);

  const enterWater = () => {
    setEntered(true);
    setShowCoach(true);
    setScreen("dive");
    setReefPhase("healthy");
  };

  const inspect = (hotspotId: string) => {
    const hotspot = hotspots.find((item) => item.id === hotspotId);
    if (!hotspot) return;
    setSelected(hotspot);
    setZone(hotspot.zone);
    setDepth(hotspot.depth);
    setAnswer("");
    setWrong(false);
    setShowCoach(false);
  };

  const choose = (choiceId: string) => {
    if (!selected) return;
    setAnswer(choiceId);
    if (choiceId !== selected.correct) {
      setWrong(true);
      return;
    }

    setWrong(false);
    setLocalMapped((current) =>
      current.includes(selected.id) ? current : [...current, selected.id],
    );
    const name = `Explorer ${playerId.slice(0, 2).toUpperCase()}`;
    void sync({
      type: "annotate",
      id: playerId,
      name,
      hotspotId: selected.id,
      label: selected.choices.find((item) => item.id === choiceId)?.scientific,
      health: "Observed",
    });
  };

  const continueDive = () => {
    const willComplete = mappedCount >= 3;
    setSelected(null);
    setAnswer("");
    if (willComplete) setScreen("complete");
  };

  const shareDive = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("room", roomCode);
    await navigator.clipboard?.writeText(url.toString());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const restart = () => {
    setLocalMapped([]);
    setSelected(null);
    setAnswer("");
    setScreen("dive");
    setReefPhase("healthy");
    void sync({ type: "reset" });
  };

  const observers = room.explorers.slice(0, 4);

  return (
    <main className={`expedition${entered ? " is-entered" : " is-at-surface"}`}>
      <ReefScene
        active={entered && screen === "dive"}
        focusId={selected?.id ?? null}
        hotspots={hotspots}
        mappedIds={mappedIds}
        fallbackSrc="/reef-entry-v4.webp"
        phase={reefPhase}
        onHotspotSelect={inspect}
        onReady={() => setSceneReady(true)}
        onEngineChange={setEngine}
        onZoneChange={(nextZone, nextDepth) => {
          if (selected) return;
          setZone(nextZone);
          setDepth(nextDepth);
        }}
      />

      <header className="expedition-bar">
        <div className="reef-wordmark"><Waves /> <span>REEF RELAY</span></div>
        {entered && (
          <div className="reef-location" aria-live="polite">
            <MapPin />
            <span><strong>{zone}</strong><small>{depth} · Sisters&apos; Islands</small></span>
          </div>
        )}
        {entered && (
          <div className="reef-actions">
            <button
              type="button"
              className={guide.status !== "off" ? "is-active" : ""}
              onClick={guide.toggle}
              aria-label={guide.status === "off" ? "Turn on expedition guide" : "Turn off expedition guide"}
              title="Expedition guide"
            >
              {guide.status === "off" ? <VolumeX /> : <Volume2 />}
              <span>Guide</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setScreen("timeline");
              }}
              aria-label="Open reef time dive"
            >
              <Clock3 /><span>Time dive</span>
            </button>
            <button type="button" onClick={shareDive} aria-label="Copy an invitation link">
              {copied ? <Check /> : <Share2 />}
              <span>{copied ? "Copied" : "Crew"}</span>
            </button>
          </div>
        )}
      </header>

      {!entered && (
        <section className="entry" aria-labelledby="entry-title">
          <div className="entry-kicker"><span /> SMALL SISTER&apos;S ISLAND · SINGAPORE</div>
          <h1 id="entry-title">Enter the<br /><em>living city.</em></h1>
          <p>Less than 1% of the ocean. Nearly one-quarter of ocean species.</p>
          <button type="button" className="enter-button" onClick={enterWater}>
            <span>Enter the water</span><ArrowRight />
          </button>
          <div className="entry-actions" aria-label="Expedition steps">
            <span><Compass /><b>Move</b></span>
            <span><Eye /><b>Observe</b></span>
            <span><ScanSearch /><b>Identify</b></span>
          </div>
          <small>{sceneReady ? `${engine} ready` : "Preparing the reef…"}</small>
        </section>
      )}

      {entered && screen === "dive" && (
        <>
          <div className="discovery-progress" aria-label={`${mappedCount} of 3 discoveries`}>
            <span>{mappedCount}/3</span>
            <div>{[0, 1, 2].map((step) => <i key={step} className={mappedCount > step ? "is-done" : ""} />)}</div>
            <small>READ THE REEF</small>
          </div>

          <div className="crew-lights" aria-label={`${observers.length || 1} explorers in this dive`}>
            {(observers.length ? observers : [{ id: playerId, name: "You", color: "#65e8d0", lastSeen: 0 }]).map((explorer) => (
              <i key={explorer.id} style={{ "--diver": explorer.color } as React.CSSProperties} title={explorer.name} />
            ))}
          </div>

          {showCoach && (
            <div className="control-coach">
              <MousePointer2 />
              <span><b>Look around</b><small>Drag · W A S D to swim</small></span>
              <button type="button" onClick={() => setShowCoach(false)} aria-label="Dismiss controls"><X /></button>
            </div>
          )}

          {guide.caption && guide.status !== "off" && (
            <div className="guide-caption" aria-live="polite">
              <Sparkles /> <span>{guide.caption}</span>
            </div>
          )}
        </>
      )}

      {selected && screen === "dive" && (
        <section className="specimen" aria-labelledby="specimen-title">
          <button type="button" className="specimen-close" onClick={() => setSelected(null)} aria-label="Return to swimming"><X /></button>
          <div className="specimen-heading">
            <span>{selected.eyebrow}</span>
            <h2 id="specimen-title">{selected.label}</h2>
            <p>{selected.prompt}</p>
          </div>
          <div className="visual-choices">
            {selected.choices.map((choice) => {
              const isCorrect = answer === choice.id && choice.id === selected.correct;
              const isWrong = answer === choice.id && choice.id !== selected.correct;
              return (
                <button
                  type="button"
                  key={choice.id}
                  className={`${isCorrect ? "is-correct" : ""}${isWrong ? " is-wrong" : ""}`}
                  onClick={() => choose(choice.id)}
                  aria-label={`${choice.label}, ${choice.scientific}`}
                >
                  <img src={choice.image} alt="" width={480} height={360} loading="eager" />
                  <span><b>{choice.label}</b><small>{choice.scientific}</small></span>
                  {isCorrect && <Check />}
                </button>
              );
            })}
          </div>
          <div className={`specimen-result${answer === selected.correct ? " is-visible" : ""}`} aria-live="polite">
            {answer === selected.correct ? (
              <>
                <span><b>{selected.takeaway}</b>{selected.fact}</span>
                <a href={selected.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open ${selected.sourceLabel}`}><ExternalLink /></a>
                <button type="button" onClick={continueDive}>{mappedCount >= 3 ? "See what changed" : "Keep exploring"}<ArrowRight /></button>
              </>
            ) : wrong ? <span><b>Look closer.</b> Compare the whole silhouette before the color.</span> : null}
          </div>
        </section>
      )}

      {screen === "timeline" && (
        <ReefTimeline
          guideOn={guide.status !== "off"}
          onNarrate={announce}
          onStageChange={setReefPhase}
          onClose={() => {
            setReefPhase("healthy");
            setScreen(mappedCount >= 3 ? "complete" : "dive");
          }}
        />
      )}

      {screen === "complete" && (
        <section className="complete" aria-labelledby="complete-title">
          <Sparkles />
          <span>EXPEDITION COMPLETE</span>
          <h2 id="complete-title">You read the<br />living city.</h2>
          <p>Currents connect it. Skeletons shelter it. Care changes what comes next.</p>
          <strong>What we map, we can protect.</strong>
          <div>
            <button type="button" onClick={() => setScreen("timeline")}><Clock3 /> Time dive</button>
            <button type="button" onClick={restart}><RotateCcw /> Dive again</button>
          </div>
          <small>Science: NOAA · NParks Singapore · AIMS · Smithsonian Open Access</small>
        </section>
      )}
    </main>
  );
}
