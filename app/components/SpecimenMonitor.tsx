"use client";

/* eslint-disable @next/next/no-img-element */
import { Activity, CheckCircle2, FlaskConical, MapPinned, MessageCircle, Sprout, X } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Colony, ReefMoment, Stressor, Tool } from "../reef-data";
import { stressCopy } from "../reef-data";

type SpecimenRecord = {
  scanned: boolean;
  marked?: boolean;
  restored?: boolean;
  note?: string;
  condition?: string;
  health?: string;
};

type SpecimenMonitorProps = {
  activeMoment: ReefMoment;
  graph: Array<{ year: string; health: number }>;
  note: string;
  record?: SpecimenRecord;
  roomNote?: string;
  restored: string[];
  selected: Colony;
  showSignals: boolean;
  stressor: Stressor | null;
  tool: Tool;
  onClose: () => void;
  onMark: () => void;
  onNoteChange: (note: string) => void;
  onRestore: () => void;
  onSaveNote: () => void;
  onToggleSignals: () => void;
};

export function SpecimenMonitor({
  activeMoment,
  graph,
  note,
  record,
  roomNote,
  restored,
  selected,
  showSignals,
  stressor,
  tool,
  onClose,
  onMark,
  onNoteChange,
  onRestore,
  onSaveNote,
  onToggleSignals,
}: SpecimenMonitorProps) {
  const isRestored = restored.includes(selected.id) || record?.restored;
  const savedNote = record?.note || roomNote || "";
  const currentHealth = isRestored ? 92 : activeMoment.health;
  const statusItems = [
    ["Scanned", true],
    ["Marked", Boolean(record?.marked)],
    ["Noted", Boolean(savedNote)],
    ["Restored", Boolean(isRestored)],
  ] as const;

  return (
    <aside className="specimen-monitor">
      <button type="button" onClick={onClose} aria-label="Close specimen">
        <X />
      </button>
      <span>SPECIES HEALTH</span>
      <div className="specimen-id">
        <img src={selected.image} alt="" />
        <div>
          <strong>{selected.common}</strong>
          <small>{selected.species}</small>
        </div>
      </div>
      <dl>
        <div>
          <dt>Living cover</dt>
          <dd>{currentHealth}%</dd>
        </div>
        <div>
          <dt>Heat stress</dt>
          <dd>{activeMoment.dhw.toFixed(1)} C-weeks</dd>
        </div>
        <div>
          <dt>pH</dt>
          <dd>
            {stressor === "co2"
              ? (activeMoment.ph - 0.1).toFixed(2)
              : activeMoment.ph.toFixed(2)}
          </dd>
        </div>
      </dl>
      <div className="specimen-status" aria-label="Colony workflow status">
        {statusItems.map(([label, complete]) => (
          <span key={label} className={complete ? "is-complete" : ""}>
            {complete && <CheckCircle2 />}
            {label}
          </span>
        ))}
      </div>
      <section className="evidence-card" aria-label="Observation evidence">
        <span>OBSERVE BEFORE NAMING</span>
        <p>{selected.lesson.form}</p>
        <p>{selected.lesson.habitat}</p>
        <p>{selected.lesson.scientistCheck}</p>
      </section>
      <button className="signal-button" type="button" onClick={onToggleSignals}>
        <Activity /> {showSignals ? "Hide signals" : "Open signals"}
      </button>
      {showSignals && (
        <div className="signal-chart">
          <ResponsiveContainer width="100%" height={118}>
            <AreaChart data={graph}>
              <defs>
                <linearGradient id="healthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5de9cd" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#5de9cd" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="year"
                tick={{ fill: "#83a5a2", fontSize: 9 }}
                axisLine={false}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "#031116",
                  border: "1px solid #34635f",
                  fontSize: 11,
                }}
              />
              <Area
                type="monotone"
                dataKey="health"
                stroke="#5de9cd"
                fill="url(#healthFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <p>
            <b>DHW = sum of weekly heat anomaly</b> above the bleaching
            threshold. Around 4 C-weeks signals risk.
          </p>
        </div>
      )}
      {tool === "mark" && (
        <section className="tool-card" aria-label="Mark colony health">
          <span><MapPinned /> Mark health</span>
          <p>
            {record?.marked
              ? `${record.condition ?? "Survey score"} saved at ${record.health ?? `${currentHealth}% living cover`}.`
              : `Score this colony against the ${activeMoment.year} reef conditions.`}
          </p>
          <button type="button" onClick={onMark}>
            {record?.marked ? "Update mark" : "Mark colony"}
          </button>
        </section>
      )}
      {tool === "note" && (
        <form
          className="note-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSaveNote();
          }}
        >
          <input
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="What do you notice?"
            autoFocus
          />
          <button>
            <MessageCircle /> Save
          </button>
        </form>
      )}
      {savedNote && tool !== "note" && (
        <p className="saved-note">
          <MessageCircle /> {savedNote}
        </p>
      )}
      {tool === "restore" && (
        <section className="tool-card" aria-label="Restore colony preview">
          <span><Sprout /> Restore preview</span>
          <p>
            {isRestored
              ? "Recovery preview is active for this colony and reflected in the library."
              : "Apply a local recovery preview to compare protected cover against the same stress timeline."}
          </p>
          <button type="button" onClick={onRestore}>
            {isRestored ? "Refresh preview" : "Apply restore"}
          </button>
        </section>
      )}
      {stressor && (
        <p className="effect-note">
          <FlaskConical />
          {stressCopy[stressor].effect}
        </p>
      )}
    </aside>
  );
}
