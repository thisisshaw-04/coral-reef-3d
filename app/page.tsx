"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  AudioLines,
  BookOpen,
  Check,
  ChevronDown,
  CircleDot,
  Clock3,
  Globe2,
  Map,
  MessageCircle,
  MousePointer2,
  Route,
  ScanLine,
  Share2,
  Sparkles,
  Sprout,
  ThermometerSun,
  Waves,
  X,
} from "lucide-react";
import ReefScene, {
  BIOME_AMBIENT_SCAN_COLONIES,
  type ReefPhase,
} from "./components/ReefScene";
import { CoralLibrary } from "./components/CoralLibrary";
import { SpecimenMonitor } from "./components/SpecimenMonitor";
import { useReefGuide } from "./hooks/useReefGuide";
import { useRoomSync } from "./hooks/useRoomSync";
import {
  defaultWorldId,
  createLibraryColonyFromHotspot,
  getWorldById,
  moments,
  reefWorlds,
  stressCopy,
  type Colony,
  type ReefWorld,
  type Stressor,
  type Tool,
} from "./reef-data";

type FieldRecord = {
  scanned: boolean;
  marked?: boolean;
  restored?: boolean;
  note?: string;
  condition?: string;
  health?: string;
  updatedAt: number;
};

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

const briefingPointIcons = [
  [
    "/icons/reef-find-colonies.png",
    "/icons/reef-shape-first.png",
    "/icons/reef-evidence-id.png",
  ],
  [
    "/icons/reef-scan-colony.png",
    "/icons/reef-mark-health.png",
    "/icons/reef-note-observation.png",
  ],
  [
    "/icons/reef-time-compare.png",
    "/icons/reef-bleaching-risk.png",
    "/icons/reef-restore-caution.png",
  ],
];

const toolDirections: Record<Tool, string> = {
  scan: "SCAN · SELECT ANY COLONY TO OPEN ITS EVIDENCE CARD",
  mark: "MARK · SELECT A COLONY TO SCORE ITS CURRENT HEALTH",
  note: "NOTE · SELECT A COLONY TO SAVE AN OBSERVATION",
  restore: "RESTORE · SELECT A COLONY TO PREVIEW LOCAL RECOVERY",
  library: "LIBRARY · REVIEW YOUR EVOLVING CORAL NOTEBOOK",
  story: "STORY · FOLLOW THE REEF THROUGH TIME",
};

const storySteps = [
  {
    label: "STORY 01",
    momentIndex: 0,
    title: "Start with a baseline, not a guess.",
    body: "A reef record begins by noticing what is alive, what shape it takes, and which colonies form the habitat.",
    takeaway: "Scan first. The colony shape is the evidence you carry into every later comparison.",
  },
  {
    label: "STORY 02",
    momentIndex: 1,
    title: "Recovery can be real, but uneven.",
    body: "Fast-growing branching and plate corals can return cover quickly, while slower massive forms hold long-term structure.",
    takeaway: "Compare growth form before deciding whether the whole reef is recovering.",
  },
  {
    label: "STORY 03",
    momentIndex: 2,
    title: "Heat stress changes the color story.",
    body: "Degree heating weeks track accumulated thermal stress. As stress rises, sensitive corals can pale before structure is lost.",
    takeaway: "Use the time current to watch living cover, DHW, pH, and species sensitivity together.",
  },
  {
    label: "STORY 04",
    momentIndex: 3,
    title: "Today is an intervention point.",
    body: "A field team would mark colonies, save notes, and decide which sites need close monitoring or local restoration.",
    takeaway: "Leave story mode any time to explore freely, scan colonies, and build the coral library.",
  },
  {
    label: "STORY 05",
    momentIndex: 4,
    title: "The future is a scenario, not a promise.",
    body: "A restored patch can improve local condition, but bleaching risk still depends on heat, water quality, and repeated disturbance.",
    takeaway: "Test stress carefully, then return to the reef and look for what actually changed.",
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
  const [storyStep, setStoryStep] = useState(0);
  const [showStress, setShowStress] = useState(false);
  const [showWorlds, setShowWorlds] = useState(false);
  const [showSignals, setShowSignals] = useState(false);
  const [worldId, setWorldId] = useState(defaultWorldId);
  const [joinCode, setJoinCode] = useState("");
  const [note, setNote] = useState("");
  const [restored, setRestored] = useState<string[]>([]);
  const [fieldRecords, setFieldRecords] = useState<Record<string, FieldRecord>>({});
  const [sceneReady, setSceneReady] = useState(false);
  const [engine, setEngine] = useState("Reef engine");
  const [diveDepth, setDiveDepth] = useState("22 m");
  const [copied, setCopied] = useState(false);
  const { chooseRoomCode, diverName, mappedIds, playerId, room, roomCode, sync } =
    useRoomSync({ entered, restoredIds: restored });

  const activeMoment = moments[momentIndex];
  const activeWorld = useMemo(() => getWorldById(worldId), [worldId]);
  const activeColonies = useMemo(() => {
    const colonies = new globalThis.Map(
      activeWorld.colonies.map((colony) => [colony.id, colony]),
    );
    for (const hotspot of BIOME_AMBIENT_SCAN_COLONIES[activeWorld.id] ?? []) {
      if (!colonies.has(hotspot.id)) {
        colonies.set(hotspot.id, createLibraryColonyFromHotspot(hotspot, activeWorld));
      }
    }
    return Array.from(colonies.values());
  }, [activeWorld]);
  const discoveredIds = useMemo(
    () =>
      Object.entries(fieldRecords)
        .filter(([, record]) => record.scanned)
        .map(([id]) => id),
    [fieldRecords],
  );
  const sceneMappedIds = useMemo(
    () => Array.from(new Set([...mappedIds, ...discoveredIds, ...restored])),
    [mappedIds, discoveredIds, restored],
  );
  const selectedRecord = selected ? fieldRecords[selected.id] : undefined;
  const timelineProgress = (momentIndex / Math.max(1, moments.length - 1)) * 100;
  const timelineStyle = {
    "--timeline-progress": `${timelineProgress}%`,
    "--timeline-fill": `${timelineProgress * 0.88}%`,
    "--timeline-active-x": `${6 + timelineProgress * 0.88}%`,
  } as CSSProperties;
  const activeStory = storySteps[storyStep];
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
    setSelected(null);
    setTool("story");
    setStoryStep(0);
    chooseMoment(storySteps[0].momentIndex);
    guide.announce(
      `Story mode started. Follow the reef through time, or leave story mode to explore freely.`,
    );
  };

  const chooseStoryStep = (index: number) => {
    const nextIndex = Math.max(0, Math.min(storySteps.length - 1, index));
    const nextStory = storySteps[nextIndex];
    setStoryStep(nextIndex);
    setSelected(null);
    setTool("story");
    chooseMoment(nextStory.momentIndex);
  };

  const exitStory = () => {
    setTool("scan");
    setSelected(null);
    guide.announce(`Free exploration ready. Scan any of the ${activeColonies.length} colonies in this reef.`);
  };

  const inspect = (id: string) => {
    const colony = activeColonies.find((item) => item.id === id) || null;
    const activeTool = tool;
    setSelected(colony);
    if (!colony) return;

    setFieldRecords((records) => ({
      ...records,
      [colony.id]: {
        ...records[colony.id],
        scanned: true,
        updatedAt: Date.now(),
      },
    }));

    if (activeTool === "mark") {
      markColony(colony);
      return;
    }

    if (activeTool === "note") {
      guide.announce(`Note mode ready for ${colony.common}. Save one clear field observation.`);
      return;
    }

    if (activeTool === "restore") {
      restoreColony(colony);
      return;
    }

    if (activeTool === "library") setTool("scan");

    guide.announce(
      `Scanning ${colony.common}. Form is evidence: inspect the colony before you name its condition.`,
    );
  };

  const conditionFor = (isRestored = false) => {
    if (isRestored) return "Restoration preview";
    if (activeMoment.dhw >= 8) return "Severe heat stress";
    if (activeMoment.dhw >= 4) return "Bleaching watch";
    if (activeMoment.phase === "recovery") return "Recovering";
    return "Stable survey";
  };

  const healthFor = (isRestored = false) =>
    `${isRestored ? 92 : activeMoment.health}% living cover`;

  const markColony = (colony: Colony) => {
    const health = healthFor(restored.includes(colony.id));
    const condition = conditionFor(restored.includes(colony.id));

    setFieldRecords((records) => ({
      ...records,
      [colony.id]: {
        ...records[colony.id],
        scanned: true,
        marked: true,
        condition,
        health,
        updatedAt: Date.now(),
      },
    }));

    void sync({
      type: "annotate",
      id: playerId,
      name: diverName,
      hotspotId: colony.id,
      label: colony.species,
      health: `${condition} · ${health}`,
    });

    guide.announce(`${colony.common} marked as ${condition.toLowerCase()} with ${health}.`);
  };

  const markSelected = () => {
    if (!selected) {
      guide.announce("Mark tool armed. Select a coral colony to score its current health.");
      return;
    }

    markColony(selected);
  };

  const restoreColony = (colony: Colony) => {
    setRestored((items) =>
      items.includes(colony.id) ? items : [...items, colony.id],
    );
    setFieldRecords((records) => ({
      ...records,
      [colony.id]: {
        ...records[colony.id],
        scanned: true,
        marked: true,
        restored: true,
        condition: "Restoration preview",
        health: healthFor(true),
        updatedAt: Date.now(),
      },
    }));
    setPhase("recovery");
    void sync({
      type: "annotate",
      id: playerId,
      name: diverName,
      hotspotId: colony.id,
      label: colony.species,
      health: `Restoration preview · ${healthFor(true)}`,
    });
    guide.announce(
      "Restoration preview placed. This can help local recovery, but it cannot replace clean water and climate action.",
    );
  };

  const restoreSelected = () => {
    if (!selected) {
      guide.announce("Restore tool armed. Select a colony to preview local recovery.");
      return;
    }

    restoreColony(selected);
  };

  const applyTool = (next: Tool) => {
    setTool(next);
    if (next === "story") {
      setSelected(null);
      setShowTimeline(true);
      setShowStress(false);
      guide.announce("Story mode reopened. Step through the reef timeline, then return to free exploration when ready.");
      return;
    }
    if (next === "library") return;

    if (next === "mark") markSelected();
    if (next === "restore") {
      restoreSelected();
    }
    if (next === "scan" && selected) {
      guide.announce(`${selected.common} evidence card reopened. Compare form, signals, and timeline.`);
    }
    if (next === "note") {
      if (selected) {
        guide.announce(`Note tool ready for ${selected.common}. Add one observation from the evidence card.`);
      } else {
        guide.announce("Note tool armed. Select a coral colony, then save your observation.");
      }
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
    setFieldRecords({});
    setSceneReady(false);
    setTool("scan");
    setStoryStep(0);
    setShowWorlds(false);
    guide.announce(
      `${nextWorld.name} terrain loaded. ${nextWorld.objectiveTitle}.`,
    );
  };

  const saveNote = () => {
    if (!selected || !note.trim()) return;

    const savedNote = note.trim();
    markColony(selected);
    setFieldRecords((records) => ({
      ...records,
      [selected.id]: {
        ...records[selected.id],
        scanned: true,
        marked: true,
        note: savedNote,
        updatedAt: Date.now(),
      },
    }));
    void sync({
      type: "note",
      id: playerId,
      name: diverName,
      hotspotId: selected.id,
      label: selected.species,
      health: selectedRecord?.health ?? healthFor(restored.includes(selected.id)),
      note: savedNote,
    });
    setNote("");
    guide.announce(`Observation saved to the coral library for ${selected.common}.`);
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
        mappedIds={sceneMappedIds}
        fallbackSrc="/reef-cockpit.webp"
        phase={phase}
        stressor={stressor}
        restoredIds={restored}
        onHotspotSelect={inspect}
        onReady={() => setSceneReady(true)}
        onEngineChange={setEngine}
        onZoneChange={(_, depth) => setDiveDepth(depth)}
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
          <span>REEF RELAY</span>
        </div>
        <div className="mission-room">
          <span>
            {room.explorers.length || 1} DIVER
            {(room.explorers.length || 1) === 1 ? "" : "S"}
          </span>
          <button type="button" onClick={share}>
            {copied ? <Check /> : <Share2 />} {roomCode}
          </button>
          <strong>{diveDepth}</strong>
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
            {briefingSteps[briefingStep].points.map((point, index) => {
              const iconSrc = briefingPointIcons[briefingStep][index];

              return (
                <strong key={point}>
                  <i aria-hidden="true">
                    <img src={iconSrc} alt="" />
                  </i>
                  {point}
                </strong>
              );
            })}
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
            <span>
              EXPEDITION 01 · {selected ? selected.zone : activeWorld.expedition}
            </span>
            <strong>
              {selected
                ? selected.species
                : toolDirections[tool]}
            </strong>
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

          {!selected && tool !== "story" && (
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

          {!selected && tool === "story" && (
            <aside className="story-panel" aria-live="polite">
              <span>{activeStory.label} · REEF TIME</span>
              <h2>{activeStory.title}</h2>
              <p>{activeStory.body}</p>
              <strong>{activeStory.takeaway}</strong>
              <div className="story-panel__rail" aria-label="Story progress">
                {storySteps.map((step, index) => (
                  <button
                    type="button"
                    key={step.label}
                    className={index === storyStep ? "is-active" : ""}
                    onClick={() => chooseStoryStep(index)}
                    aria-label={`Open ${step.label}`}
                  >
                    <i />
                    <span>{moments[step.momentIndex].year}</span>
                  </button>
                ))}
              </div>
              <footer>
                <button
                  type="button"
                  onClick={() => chooseStoryStep(storyStep - 1)}
                  disabled={storyStep === 0}
                >
                  Back
                </button>
                {storyStep === storySteps.length - 1 ? (
                  <button type="button" onClick={exitStory}>
                    Explore freely
                  </button>
                ) : (
                  <button type="button" onClick={() => chooseStoryStep(storyStep + 1)}>
                    Next
                  </button>
                )}
              </footer>
            </aside>
          )}

          {selected && (
            <SpecimenMonitor
              activeMoment={activeMoment}
              graph={graph}
              note={note}
              record={selectedRecord}
              roomNote={room.annotations[selected.id]?.note}
              restored={restored}
              selected={selected}
              showSignals={showSignals}
              stressor={stressor}
              tool={tool}
              onClose={() => setSelected(null)}
              onMark={markSelected}
              onNoteChange={setNote}
              onRestore={restoreSelected}
              onSaveNote={saveNote}
              onToggleSignals={() => setShowSignals(!showSignals)}
            />
          )}

          {tool === "library" && (
            <CoralLibrary
              colonies={activeColonies}
              discoveredIds={discoveredIds}
              records={fieldRecords}
              mappedIds={mappedIds}
              annotations={room.annotations}
              restoredIds={restored}
              selectedId={selected?.id}
              onClose={() => setTool("scan")}
              onSelect={inspect}
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
                ["library", BookOpen, "Library"],
                ["story", Route, "Story"],
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
