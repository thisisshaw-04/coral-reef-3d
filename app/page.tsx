"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Activity, AudioLines, Check, ChevronDown, CircleDot, Clock3, FlaskConical, Globe2, Map, MessageCircle, MousePointer2, ScanLine, Share2, Sparkles, Sprout, ThermometerSun, Waves, X } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ReefScene, { type ReefPhase, type ReefSceneHotspot } from "./components/ReefScene";
import { useReefGuide } from "./hooks/useReefGuide";

type Tool = "scan" | "mark" | "note" | "restore";
type Stressor = "heat" | "co2" | "plastic" | "runoff";
type Explorer = { id: string; name: string; color: string; lastSeen: number };
type Annotation = { hotspotId: string; label: string; health: string; by: string; note?: string };
type ReefRoom = { code: string; explorers: Explorer[]; annotations: Record<string, Annotation>; updatedAt: number };
type Colony = ReefSceneHotspot & { species: string; common: string; image: string; zone: string };

const colonies: Colony[] = [
  { id: "acro-table", label: "Colony A7", species: "Acropora hyacinthus", common: "Table coral", image: "/specimens/acropora-hyacinthus.jpg", position: [-8, 2.6, -11], zone: "Current Gate" },
  { id: "acro-compact", label: "Colony P3", species: "Acropora humilis", common: "Compact branching coral", image: "/specimens/acropora-humilis.jpg", position: [8, 2.2, -27], zone: "Turbid Shelf" },
  { id: "massive-star", label: "Colony R12", species: "Plesiastraea armata", common: "Massive star coral", image: "/specimens/plesiastraea-armata.jpg", position: [24, 2.7, -47], zone: "Archive Garden" },
];
const moments = [
  { year: "1998", title: "First global event", phase: "heat" as ReefPhase, temp: 0.9, dhw: 4.1, ph: 8.10, health: 72 },
  { year: "2016", title: "Mass bleaching", phase: "bleaching" as ReefPhase, temp: 1.5, dhw: 8.2, ph: 8.07, health: 43 },
  { year: "2024", title: "Record ocean heat", phase: "bleaching" as ReefPhase, temp: 1.8, dhw: 10.4, ph: 8.05, health: 31 },
  { year: "2026", title: "Today · intervene", phase: "healthy" as ReefPhase, temp: 0.7, dhw: 3.2, ph: 8.06, health: 68 },
  { year: "2035", title: "Recovery window", phase: "recovery" as ReefPhase, temp: 0.4, dhw: 1.1, ph: 8.08, health: 84 },
];
const reefWorlds = ["Great Barrier Reef", "Sisters’ Islands", "Coral Triangle", "Caribbean Reef"];
const emptyRoom: ReefRoom = { code: "DIVE", explorers: [], annotations: {}, updatedAt: 0 };
const stressCopy: Record<Stressor, { label: string; effect: string }> = {
  heat: { label: "Heat +1.5°C", effect: "Thermal stress accumulates over weeks; bleaching risk rises." },
  co2: { label: "CO₂ / pH −0.1", effect: "Acidification reduces the carbonate corals use to build skeletons." },
  plastic: { label: "Plastic debris", effect: "Debris can shade, abrade and increase disease risk locally." },
  runoff: { label: "Runoff pulse", effect: "Sediment blocks light and raises background turbidity." },
};
function randomCode() { return `R${Math.random().toString(36).slice(2, 7)}`.toUpperCase(); }

export default function Home() {
  const [entered, setEntered] = useState(false), [selected, setSelected] = useState<Colony | null>(null);
  const [tool, setTool] = useState<Tool>("scan"), [phase, setPhase] = useState<ReefPhase>("healthy");
  const [momentIndex, setMomentIndex] = useState(3), [stressor, setStressor] = useState<Stressor | null>(null);
  const [showTimeline, setShowTimeline] = useState(true), [showStress, setShowStress] = useState(false);
  const [showWorlds, setShowWorlds] = useState(false), [showSignals, setShowSignals] = useState(false);
  const [world, setWorld] = useState("Great Barrier Reef"), [roomCode, setRoomCode] = useState("DIVE");
  const [joinCode, setJoinCode] = useState(""), [room, setRoom] = useState<ReefRoom>(emptyRoom);
  const [note, setNote] = useState(""), [restored, setRestored] = useState<string[]>([]);
  const [sceneReady, setSceneReady] = useState(false), [engine, setEngine] = useState("Reef engine"), [copied, setCopied] = useState(false);
  const playerId = useId().replace(/[^a-zA-Z0-9]/g, "") || "diver", channel = useRef<BroadcastChannel | null>(null);
  const mappedIds = useMemo(() => Array.from(new Set([...Object.keys(room.annotations), ...restored])), [room.annotations, restored]);
  const activeMoment = moments[momentIndex];
  const guide = useReefGuide({ roomCode, context: selected ? `${world}. Observing ${selected.species}. Reef phase: ${phase}.` : `${world}. Research submersible expedition.` });
  const sync = useCallback(async (action?: Record<string, unknown>) => { try { const response = await fetch(`/api/room?code=${encodeURIComponent(roomCode)}`, action ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(action) } : undefined); if (!response.ok) return; const data = await response.json() as ReefRoom; setRoom(data); channel.current?.postMessage(data); } catch {} }, [roomCode]);
  useEffect(() => { const timer = window.setTimeout(() => setRoomCode(new URL(window.location.href).searchParams.get("room")?.toUpperCase().slice(0, 6) || randomCode()), 0); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { if (!entered || roomCode === "DIVE") return; const name = `Diver ${playerId.slice(0, 2).toUpperCase()}`; const joinTimer = window.setTimeout(() => void sync({ type: "join", id: playerId, name }), 0); channel.current = new BroadcastChannel(`reef-relay-${roomCode}`); channel.current.onmessage = (event) => setRoom(event.data as ReefRoom); const timer = window.setInterval(() => void sync({ type: "presence", id: playerId, name }), 2500); return () => { window.clearTimeout(joinTimer); window.clearInterval(timer); channel.current?.close(); channel.current = null; }; }, [entered, playerId, roomCode, sync]);
  const begin = (code?: string) => { const cleaned = code?.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6); if (cleaned) setRoomCode(cleaned); setEntered(true); guide.announce("Welcome aboard. Move freely, then choose a glowing colony. We will read the reef together."); };
  const inspect = (id: string) => { const colony = colonies.find((item) => item.id === id) || null; setSelected(colony); setTool("scan"); if (colony) guide.announce(`Scanning ${colony.common}. Form is evidence: inspect the colony before you name its condition.`); };
  const applyTool = (next: Tool) => { setTool(next); if (!selected) return; const name = `Diver ${playerId.slice(0, 2).toUpperCase()}`; if (next === "mark") void sync({ type: "annotate", id: playerId, name, hotspotId: selected.id, label: selected.species, health: `${activeMoment.health}% living cover` }); if (next === "restore") { setRestored((items) => items.includes(selected.id) ? items : [...items, selected.id]); setPhase("recovery"); guide.announce("Restoration preview placed. This can help local recovery, but it cannot replace clean water and climate action."); } };
  const saveNote = () => { if (!selected || !note.trim()) return; const name = `Diver ${playerId.slice(0, 2).toUpperCase()}`; void sync({ type: "annotate", id: playerId, name, hotspotId: selected.id, label: selected.species, health: `${activeMoment.health}% living cover` }); void sync({ type: "note", hotspotId: selected.id, note: note.trim() }); setNote(""); };
  const chooseMoment = (index: number) => { setMomentIndex(index); setPhase(moments[index].phase); setStressor(null); guide.announce(`${moments[index].year}. ${moments[index].title}. The same reef changes before your eyes.`); };
  const applyStress = (next: Stressor) => { setStressor(next); setPhase(next === "heat" ? "bleaching" : next === "co2" || next === "runoff" ? "heat" : phase); setShowStress(false); guide.announce(stressCopy[next].effect); };
  const share = async () => { const url = new URL(window.location.href); url.searchParams.set("room", roomCode); await navigator.clipboard?.writeText(url.toString()); setCopied(true); window.setTimeout(() => setCopied(false), 1300); };
  const graph = moments.map((m) => ({ year: m.year, health: m.health }));

  return <main className={`expedition-v5${entered ? " is-live" : ""}`} data-phase={phase}>
    <ReefScene active={entered} focusId={selected?.id || null} hotspots={colonies} mappedIds={mappedIds} fallbackSrc="/reef-cockpit.webp" phase={phase} stressor={stressor} restoredIds={restored} onHotspotSelect={inspect} onReady={() => setSceneReady(true)} onEngineChange={setEngine} />
    <div className="submarine-frame" aria-hidden="true" />
    <header className="mission-bar"><button className="world-button" type="button" onClick={() => setShowWorlds(!showWorlds)}><Globe2 /><span><small>GLOBAL NAVIGATOR</small><strong>{world}</strong></span><ChevronDown /></button><div className="mission-brand"><Waves /><span>REEF RELAY<small>Living Reef Lab</small></span></div><div className="mission-room"><span>{room.explorers.length || 1} DIVER{(room.explorers.length || 1) === 1 ? "" : "S"}</span><button type="button" onClick={share}>{copied ? <Check /> : <Share2 />} {roomCode}</button><strong>22 m</strong></div></header>
    {showWorlds && <aside className="world-drawer"><span>CHOOSE A LIVING CITY</span>{reefWorlds.map((item) => <button type="button" key={item} className={item === world ? "is-active" : ""} onClick={() => { setWorld(item); setShowWorlds(false); }}>{item}<small>{item === "Sisters’ Islands" ? "Singapore · tropical reef" : item === "Great Barrier Reef" ? "Australia · shelf reef" : "Global field station"}</small></button>)}</aside>}
    {!entered && <section className="expedition-entry"><span className="entry-status"><CircleDot /> LIVE REEF FEED · {sceneReady ? engine : "PREPARING SUB"}</span><h1>The ocean’s living city.<br/><em>Under your command.</em></h1><p>Explore, annotate and restore a shared reef—then move through time to see what survives.</p><button type="button" className="begin-button" onClick={() => begin()}>BEGIN EXPEDITION <Waves /></button><form onSubmit={(event) => { event.preventDefault(); begin(joinCode); }}><input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="JOIN CREW CODE" aria-label="Crew code" maxLength={6}/><button>JOIN</button></form><small>REAL 3D SCANS · LIVE COLLABORATION · AI FIELD GUIDE</small></section>}
    {entered && <><div className="sub-title"><span>EXPEDITION 01</span><strong>{selected ? selected.zone : "LANTERN NURSERY"}</strong><small>{selected ? selected.species : "Move freely · select a glowing colony"}</small></div><div className="diver-cursors" aria-hidden="true">{room.explorers.slice(0, 3).map((diver, index) => <span key={diver.id} style={{ "--diver-color": diver.color, left: `${52 + index * 9}%`, top: `${30 + index * 13}%` } as React.CSSProperties}><MousePointer2 />{diver.name}</span>)}</div>
      {selected && <aside className="specimen-monitor"><button type="button" onClick={() => setSelected(null)} aria-label="Close specimen"><X /></button><span>SPECIES HEALTH</span><div className="specimen-id"><img src={selected.image} alt=""/><div><strong>{selected.common}</strong><small>{selected.species}</small></div></div><dl><div><dt>Living cover</dt><dd>{restored.includes(selected.id) ? 92 : activeMoment.health}%</dd></div><div><dt>Heat stress</dt><dd>{activeMoment.dhw.toFixed(1)} °C-weeks</dd></div><div><dt>pH</dt><dd>{stressor === "co2" ? (activeMoment.ph - .1).toFixed(2) : activeMoment.ph.toFixed(2)}</dd></div></dl><button className="signal-button" type="button" onClick={() => setShowSignals(!showSignals)}><Activity /> {showSignals ? "Hide signals" : "Open signals"}</button>{showSignals && <div className="signal-chart"><ResponsiveContainer width="100%" height={118}><AreaChart data={graph}><defs><linearGradient id="healthFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5de9cd" stopOpacity={.55}/><stop offset="100%" stopColor="#5de9cd" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="year" tick={{fill:"#83a5a2",fontSize:9}} axisLine={false}/><YAxis hide domain={[0,100]}/><Tooltip contentStyle={{background:"#031116",border:"1px solid #34635f",fontSize:11}}/><Area type="monotone" dataKey="health" stroke="#5de9cd" fill="url(#healthFill)"/></AreaChart></ResponsiveContainer><p><b>DHW = Σ weekly heat anomaly</b> above the bleaching threshold. Around 4 °C-weeks signals risk.</p></div>} {tool === "note" && <form className="note-form" onSubmit={(e) => { e.preventDefault(); saveNote(); }}><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What do you notice?" autoFocus/><button><MessageCircle /> Save</button></form>} {stressor && <p className="effect-note"><FlaskConical />{stressCopy[stressor].effect}</p>}</aside>}
      {guide.caption && guide.status !== "off" && <div className="ai-guide"><Sparkles /><span><small>GPT REALTIME FIELD GUIDE</small>{guide.caption}</span></div>}
      <nav className="tool-console" aria-label="Research tools">{([["scan", ScanLine, "Scan"], ["mark", Map, "Mark"], ["note", MessageCircle, "Note"], ["restore", Sprout, "Restore"]] as const).map(([id, Icon, label]) => <button key={id} type="button" className={tool === id ? "is-active" : ""} onClick={() => applyTool(id)}><Icon /><span>{label}</span></button>)}<button type="button" className="guide-toggle" onClick={guide.toggle}><AudioLines /><span>{guide.status === "off" ? "Guide" : "Listening"}</span></button></nav>
      <button type="button" className="stress-trigger" onClick={() => setShowStress(!showStress)}><ThermometerSun /> STRESS TEST</button>{showStress && <aside className="stress-menu"><header><span>CHANGE ONE VARIABLE</span><button type="button" onClick={() => setShowStress(false)}><X /></button></header>{(Object.keys(stressCopy) as Stressor[]).map((item) => <button key={item} type="button" onClick={() => applyStress(item)}><strong>{stressCopy[item].label}</strong><small>{stressCopy[item].effect}</small></button>)}<p>Interactive forecast · not a prediction</p></aside>}
      {showTimeline && <footer className="time-current"><button type="button" onClick={() => setShowTimeline(false)}><Clock3 /> TIME CURRENT</button><div className="timeline-readout"><span>{activeMoment.year}</span><strong>{activeMoment.title}</strong></div><nav>{moments.map((moment, index) => <button type="button" key={moment.year} className={index === momentIndex ? "is-active" : index < momentIndex ? "is-past" : ""} onClick={() => chooseMoment(index)}><i/><span>{moment.year}</span></button>)}</nav><div className="timeline-metrics"><span>SST <b>+{activeMoment.temp}°C</b></span><span>DHW <b>{activeMoment.dhw}</b></span><span>pH <b>{activeMoment.ph}</b></span></div></footer>}{!showTimeline && <button type="button" className="timeline-reopen" onClick={() => setShowTimeline(true)}><Clock3 /> TIME</button>}
    </>}
  </main>;
}
