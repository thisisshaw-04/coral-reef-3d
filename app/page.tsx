"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  AudioLines,
  Check,
  ChevronDown,
  CircleDot,
  Clock3,
  Globe2,
  Map,
  MessageCircle,
  MousePointer2,
  ScanLine,
  Share2,
  Sparkles,
  Sprout,
  ThermometerSun,
  Waves,
  X,
} from "lucide-react";
import ReefScene, { type ReefPhase } from "./components/ReefScene";
import { SpecimenMonitor } from "./components/SpecimenMonitor";
import { useReefGuide } from "./hooks/useReefGuide";
import { useRoomSync } from "./hooks/useRoomSync";
import {
  defaultWorldId,
  getWorldById,
  moments,
  reefWorlds,
  stressCopy,
  type Colony,
  type ReefWorld,
  type Stressor,
  type Tool,
} from "./reef-data";

const briefingSteps = [
  {
    label: "MISSION BRIEFING 01",
    title: "You are entering a simulated reef nursery.",
    body: "Reef Relay uses real digitized coral scans inside a model reef. The readings are educational, not live field data.",
    points: ["Find scanned colonies", "Look at shape first", "Treat every ID as evidence-based"],
  },
  {
    label: "MISSION BRIEFING 02",
    title: "Your job is to read the reef like a field scientist.",
    body: "Coral form tells a story: plates catch light, branches create shelter, and massive corals store years of growth.",
    points: ["Scan a colony", "Mark its health", "Save one observation"],
  },
  {
    label: "MISSION BRIEFING 03",
    title: "Then test how stress changes the same place.",
    body: "Use the time current and stress test to compare living cover, heat stress, and pH. Restoration helps locally, but it does not replace clean water and climate action.",
    points: ["Compare 1998 to 2035", "Watch bleaching risk", "Restore with caution"],
  },
];

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [selected, setSelected] = useState<Colony | null>(null);
  const [tool, setTool] = useState<Tool>("scan");
  const [phase, setPhase] = useState<ReefPhase>("healthy");
  const [momentIndex, setMomentIndex] = useState(3);
  const [stressor, setStressor] = useState<Stressor | null>(null);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showBriefing, setShowBriefing] = useState(false);
  const [briefingStep, setBriefingStep] = useState(0);
  const [showStress, setShowStress] = useState(false);
  const [showWorlds, setShowWorlds] = useState(false);
  const [showSignals, setShowSignals] = useState(false);
  const [worldId, setWorldId] = useState(defaultWorldId);
  const [joinCode, setJoinCode] = useState("");
  const [note, setNote] = useState("");
  const [restored, setRestored] = useState<string[]>([]);
  const [sceneReady, setSceneReady] = useState(false);
  const [engine, setEngine] = useState("Reef engine");
  const [copied, setCopied] = useState(false);
  const { chooseRoomCode, diverName, mappedIds, playerId, room, roomCode, sync } =
    useRoomSync({ entered, restoredIds: restored });

  const activeMoment = moments[momentIndex];
  const activeWorld = useMemo(() => getWorldById(worldId), [worldId]);
  const activeColonies = activeWorld.colonies;
  const timelineProgress = (momentIndex / Math.max(1, moments.length - 1)) * 100;
  const timelineStyle = {
    "--timeline-progress": `${timelineProgress}%`,
    "--timeline-fill": `${timelineProgress * 0.88}%`,
    "--timeline-active-x": `${6 + timelineProgress * 0.88}%`,
  } as CSSProperties;
  const graph = useMemo(
    () => moments.map((moment) => ({ year: moment.year, health: moment.health })),
    [],
  );
  const guide = useReefGuide({
    roomCode,
    context: selected
      ? `${activeWorld.name}. Observing ${selected.species}. Reef phase: ${phase}.`
      : `${activeWorld.name}. ${activeWorld.researchBasis}`,
  });

  const begin = (code?: string) => {
    chooseRoomCode(code);
    setEntered(true);
    setShowBriefing(true);
    setBriefingStep(0);
    guide.announce(
      `Welcome aboard ${activeWorld.name}. Start with the mission briefing, then choose any scanned colony.`,
    );
  };

  const finishBriefing = () => {
    setShowBriefing(false);
    guide.announce(
      `Mission started. Scan ${activeColonies.length} research-based colonies, mark their health, then compare the reef through time.`,
    );
  };

  const inspect = (id: string) => {
    const colony = activeColonies.find((item) => item.id === id) || null;
    setSelected(colony);
    setTool("scan");
    if (!colony) return;

    guide.announce(
      `Scanning ${colony.common}. Form is evidence: inspect the colony before you name its condition.`,
    );
  };

  const markSelected = () => {
    if (!selected) return;

    void sync({
      type: "annotate",
      id: playerId,
      name: diverName,
      hotspotId: selected.id,
      label: selected.species,
      health: `${activeMoment.health}% living cover`,
    });
  };

  const applyTool = (next: Tool) => {
    setTool(next);
    if (!selected) return;

    if (next === "mark") markSelected();
    if (next === "restore") {
      setRestored((items) =>
        items.includes(selected.id) ? items : [...items, selected.id],
      );
      setPhase("recovery");
      guide.announce(
        "Restoration preview placed. This can help local recovery, but it cannot replace clean water and climate action.",
      );
    }
  };

  const chooseWorld = (nextWorld: ReefWorld) => {
    if (nextWorld.id === activeWorld.id) {
      setShowWorlds(false);
      return;
    }

    setWorldId(nextWorld.id);
    setSelected(null);
    setRestored([]);
    setSceneReady(false);
    setShowWorlds(false);
    guide.announce(
      `${nextWorld.name} terrain loaded. ${nextWorld.objectiveTitle}.`,
    );
  };

  const saveNote = () => {
    if (!selected || !note.trim()) return;

    markSelected();
    void sync({ type: "note", hotspotId: selected.id, note: note.trim() });
    setNote("");
  };

  const chooseMoment = (index: number) => {
    const nextMoment = moments[index];
    setMomentIndex(index);
    setPhase(nextMoment.phase);
    setStressor(null);
    guide.announce(
      `${nextMoment.year}. ${nextMoment.title}. The same reef changes before your eyes.`,
    );
  };

  const applyStress = (next: Stressor) => {
    setStressor(next);
    setPhase(
      next === "heat"
        ? "bleaching"
        : next === "co2" || next === "runoff"
          ? "heat"
          : phase,
    );
    setShowStress(false);
    guide.announce(stressCopy[next].effect);
  };

  const share = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("room", roomCode);
    await navigator.clipboard?.writeText(url.toString());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  };

  return (
    <main
      className={`expedition-v5${entered ? " is-live" : ""}${showBriefing ? " is-briefing" : ""}`}
      data-phase={phase}
    >
      <ReefScene
        active={entered}
        biome={activeWorld.id}
        focusId={selected?.id || null}
        hotspots={activeColonies}
        mappedIds={mappedIds}
        fallbackSrc="/reef-cockpit.webp"
        phase={phase}
        stressor={stressor}
        restoredIds={restored}
        onHotspotSelect={inspect}
        onReady={() => setSceneReady(true)}
        onEngineChange={setEngine}
      />
      <div className="submarine-frame" aria-hidden="true" />

      <header className="mission-bar">
        <button
          className="world-button"
          type="button"
          onClick={() => setShowWorlds(!showWorlds)}
        >
          <Globe2 />
          <span>
            <small>GLOBAL NAVIGATOR</small>
            <strong>{activeWorld.name}</strong>
          </span>
          <ChevronDown />
        </button>
        <div className="mission-brand">
          <Waves />
          <span>
            REEF RELAY<small>Living Reef Lab</small>
          </span>
        </div>
        <div className="mission-room">
          <span>
            {room.explorers.length || 1} DIVER
            {(room.explorers.length || 1) === 1 ? "" : "S"}
          </span>
          <button type="button" onClick={share}>
            {copied ? <Check /> : <Share2 />} {roomCode}
          </button>
          <strong>22 m</strong>
        </div>
      </header>

      {showWorlds && (
        <aside className="world-drawer">
          <span>CHOOSE A LIVING CITY</span>
          {reefWorlds.map((item) => (
            <button
              type="button"
              key={item.id}
              className={item.id === activeWorld.id ? "is-active" : ""}
              onClick={() => chooseWorld(item)}
            >
              {item.name}
              <small>{item.region} · {item.reefType}</small>
              <em>{item.researchBasis}</em>
            </button>
          ))}
        </aside>
      )}

      {!entered && (
        <section className="expedition-entry">
          <span className="entry-status">
            <CircleDot /> LIVE REEF FEED ·{" "}
            {sceneReady ? engine : "PREPARING SUB"}
          </span>
          <h1>
            The ocean&apos;s living city.
            <br />
            <em>Under your command.</em>
          </h1>
          <p>
            Explore, annotate and restore a shared reef, then move through time
            to see what survives.
          </p>
          <div className="entry-actions">
            <button type="button" className="begin-button" onClick={() => begin()}>
              BEGIN EXPEDITION <Waves />
            </button>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                begin(joinCode);
              }}
            >
              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value)}
                placeholder="JOIN CREW CODE"
                aria-label="Crew code"
                maxLength={6}
              />
              <button>JOIN</button>
            </form>
          </div>
          <small>REAL 3D SCANS · LIVE COLLABORATION · AI FIELD GUIDE</small>
        </section>
      )}

      {entered && showBriefing && (
        <section className="mission-briefing" aria-live="polite">
          <span>{briefingSteps[briefingStep].label}</span>
          <h2>{briefingSteps[briefingStep].title}</h2>
          <p>{briefingSteps[briefingStep].body}</p>
          <div className="briefing-points">
            {briefingSteps[briefingStep].points.map((point, index) => (
              <strong key={point}>
                <i>{index + 1}</i>
                {point}
              </strong>
            ))}
          </div>
          <footer>
            <button
              type="button"
              onClick={() => setBriefingStep((step) => Math.max(0, step - 1))}
              disabled={briefingStep === 0}
            >
              Back
            </button>
            <nav aria-label="Briefing progress">
              {briefingSteps.map((step, index) => (
                <button
                  type="button"
                  key={step.label}
                  className={index === briefingStep ? "is-active" : ""}
                  onClick={() => setBriefingStep(index)}
                  aria-label={`Open ${step.label}`}
                />
              ))}
            </nav>
            {briefingStep === briefingSteps.length - 1 ? (
              <button type="button" onClick={finishBriefing}>
                Start dive
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setBriefingStep((step) => step + 1)}
              >
                Next
              </button>
            )}
          </footer>
        </section>
      )}

      {entered && !showBriefing && (
        <>
          <div className="sub-title">
            <span>EXPEDITION 01</span>
            <strong>{selected ? selected.zone : activeWorld.expedition}</strong>
            <small>
              {selected
                ? selected.species
                : "Move freely · select a research-based colony"}
            </small>
          </div>
          <div className="diver-cursors" aria-hidden="true">
            {room.explorers.slice(0, 3).map((diver, index) => (
              <span
                key={diver.id}
                style={
                  {
                    "--diver-color": diver.color,
                    left: `${52 + index * 9}%`,
                    top: `${30 + index * 13}%`,
                  } as CSSProperties
                }
              >
                <MousePointer2 />
                {diver.name}
              </span>
            ))}
          </div>

          {!selected && (
            <aside className="field-lesson">
              <span>FIELD OBJECTIVE</span>
              <strong>{activeWorld.objectiveTitle}</strong>
              <p>{activeWorld.objectiveBody}</p>
              <ol>
                {activeWorld.objectiveSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <small>{activeWorld.researchBasis}</small>
            </aside>
          )}

          {selected && (
            <SpecimenMonitor
              activeMoment={activeMoment}
              graph={graph}
              note={note}
              restored={restored}
              selected={selected}
              showSignals={showSignals}
              stressor={stressor}
              tool={tool}
              onClose={() => setSelected(null)}
              onNoteChange={setNote}
              onSaveNote={saveNote}
              onToggleSignals={() => setShowSignals(!showSignals)}
            />
          )}

          {guide.caption && guide.status !== "off" && (
            <div className="ai-guide">
              <Sparkles />
              <span>
                <small>GPT REALTIME FIELD GUIDE</small>
                {guide.caption}
              </span>
            </div>
          )}

          <nav className="tool-console" aria-label="Research tools">
            {(
              [
                ["scan", ScanLine, "Scan"],
                ["mark", Map, "Mark"],
                ["note", MessageCircle, "Note"],
                ["restore", Sprout, "Restore"],
              ] as const
            ).map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                className={tool === id ? "is-active" : ""}
                onClick={() => applyTool(id)}
              >
                <Icon />
                <span>{label}</span>
              </button>
            ))}
            <button type="button" className="guide-toggle" onClick={guide.toggle}>
              <AudioLines />
              <span>{guide.status === "off" ? "Guide" : "Listening"}</span>
            </button>
          </nav>

          <button
            type="button"
            className="stress-trigger"
            onClick={() => setShowStress(!showStress)}
          >
            <ThermometerSun /> STRESS TEST
          </button>
          {showStress && (
            <aside className="stress-menu">
              <header>
                <span>CHANGE ONE VARIABLE</span>
                <button type="button" onClick={() => setShowStress(false)}>
                  <X />
                </button>
              </header>
              {(Object.keys(stressCopy) as Stressor[]).map((item) => (
                <button key={item} type="button" onClick={() => applyStress(item)}>
                  <strong>{stressCopy[item].label}</strong>
                  <small>{stressCopy[item].effect}</small>
                </button>
              ))}
              <p>Interactive forecast · not a prediction</p>
            </aside>
          )}

          {showTimeline ? (
            <footer className="time-current" data-phase={activeMoment.phase} style={timelineStyle}>
              <button type="button" onClick={() => setShowTimeline(false)}>
                <Clock3 /> TIME CURRENT
              </button>
              <div className="timeline-readout">
                <span>{activeMoment.year}</span>
                <strong>{activeMoment.title}</strong>
              </div>
              <nav>
                {moments.map((moment, index) => (
                  <button
                    type="button"
                    key={moment.year}
                    className={
                      index === momentIndex
                        ? "is-active"
                        : index < momentIndex
                          ? "is-past"
                          : ""
                    }
                    onClick={() => chooseMoment(index)}
                  >
                    <i />
                    <span>{moment.year}</span>
                  </button>
                ))}
              </nav>
              <div className="timeline-metrics">
                <span>
                  SST <b>+{activeMoment.temp}C</b>
                </span>
                <span>
                  DHW <b>{activeMoment.dhw}</b>
                </span>
                <span>
                  pH <b>{activeMoment.ph}</b>
                </span>
              </div>
            </footer>
          ) : (
            <button
              type="button"
              className="timeline-reopen"
              onClick={() => setShowTimeline(true)}
            >
              <Clock3 /> TIME
            </button>
          )}
        </>
      )}
    </main>
  );
}
