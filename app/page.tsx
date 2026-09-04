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
  colonies,
  moments,
  reefWorlds,
  stressCopy,
  type Colony,
  type Stressor,
  type Tool,
} from "./reef-data";

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [selected, setSelected] = useState<Colony | null>(null);
  const [tool, setTool] = useState<Tool>("scan");
  const [phase, setPhase] = useState<ReefPhase>("healthy");
  const [momentIndex, setMomentIndex] = useState(3);
  const [stressor, setStressor] = useState<Stressor | null>(null);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showStress, setShowStress] = useState(false);
  const [showWorlds, setShowWorlds] = useState(false);
  const [showSignals, setShowSignals] = useState(false);
  const [world, setWorld] = useState("Great Barrier Reef");
  const [joinCode, setJoinCode] = useState("");
  const [note, setNote] = useState("");
  const [restored, setRestored] = useState<string[]>([]);
  const [sceneReady, setSceneReady] = useState(false);
  const [engine, setEngine] = useState("Reef engine");
  const [copied, setCopied] = useState(false);
  const { chooseRoomCode, diverName, mappedIds, playerId, room, roomCode, sync } =
    useRoomSync({ entered, restoredIds: restored });

  const activeMoment = moments[momentIndex];
  const graph = useMemo(
    () => moments.map((moment) => ({ year: moment.year, health: moment.health })),
    [],
  );
  const guide = useReefGuide({
    roomCode,
    context: selected
      ? `${world}. Observing ${selected.species}. Reef phase: ${phase}.`
      : `${world}. Research submersible expedition.`,
  });

  const begin = (code?: string) => {
    chooseRoomCode(code);
    setEntered(true);
    guide.announce(
      "Welcome aboard. Move freely, then choose a glowing colony. We will read the reef together.",
    );
  };

  const inspect = (id: string) => {
    const colony = colonies.find((item) => item.id === id) || null;
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
    <main className={`expedition-v5${entered ? " is-live" : ""}`} data-phase={phase}>
      <ReefScene
        active={entered}
        focusId={selected?.id || null}
        hotspots={colonies}
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
            <strong>{world}</strong>
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
              key={item}
              className={item === world ? "is-active" : ""}
              onClick={() => {
                setWorld(item);
                setShowWorlds(false);
              }}
            >
              {item}
              <small>
                {item === "Sisters' Islands"
                  ? "Singapore · tropical reef"
                  : item === "Great Barrier Reef"
                    ? "Australia · shelf reef"
                    : "Global field station"}
              </small>
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
          <small>REAL 3D SCANS · LIVE COLLABORATION · AI FIELD GUIDE</small>
        </section>
      )}

      {entered && (
        <>
          <div className="sub-title">
            <span>EXPEDITION 01</span>
            <strong>{selected ? selected.zone : "LANTERN NURSERY"}</strong>
            <small>
              {selected
                ? selected.species
                : "Move freely · select a glowing colony"}
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
            <footer className="time-current">
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
