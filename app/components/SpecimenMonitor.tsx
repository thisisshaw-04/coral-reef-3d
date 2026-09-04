"use client";

/* eslint-disable @next/next/no-img-element */
import { Activity, FlaskConical, MessageCircle, X } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Colony, ReefMoment, Stressor, Tool } from "../reef-data";
import { stressCopy } from "../reef-data";

type SpecimenMonitorProps = {
  activeMoment: ReefMoment;
  graph: Array<{ year: string; health: number }>;
  note: string;
  restored: string[];
  selected: Colony;
  showSignals: boolean;
  stressor: Stressor | null;
  tool: Tool;
  onClose: () => void;
  onNoteChange: (note: string) => void;
  onSaveNote: () => void;
  onToggleSignals: () => void;
};

export function SpecimenMonitor({
  activeMoment,
  graph,
  note,
  restored,
  selected,
  showSignals,
  stressor,
  tool,
  onClose,
  onNoteChange,
  onSaveNote,
  onToggleSignals,
}: SpecimenMonitorProps) {
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
          <dd>{restored.includes(selected.id) ? 92 : activeMoment.health}%</dd>
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
      {stressor && (
        <p className="effect-note">
          <FlaskConical />
          {stressCopy[stressor].effect}
        </p>
      )}
    </aside>
  );
}
