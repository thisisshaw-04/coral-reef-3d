"use client";

/* eslint-disable @next/next/no-img-element */
import { BookOpen, CheckCircle2, CircleDashed, Sparkles, X } from "lucide-react";
import type { Annotation, Colony } from "../reef-data";

type LibraryRecord = {
  scanned: boolean;
  marked?: boolean;
  restored?: boolean;
  note?: string;
};

type CoralLibraryProps = {
  annotations: Record<string, Annotation>;
  colonies: Colony[];
  discoveredIds: string[];
  mappedIds: string[];
  records: Record<string, LibraryRecord>;
  restoredIds: string[];
  selectedId?: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
};

export function CoralLibrary({
  annotations,
  colonies,
  discoveredIds,
  mappedIds,
  records,
  restoredIds,
  selectedId,
  onClose,
  onSelect,
}: CoralLibraryProps) {
  const discovered = new Set([...discoveredIds, ...mappedIds, ...restoredIds]);
  const studied = new Set(mappedIds);
  const restored = new Set(restoredIds);
  const discoveredCount = colonies.filter((colony) => discovered.has(colony.id)).length;
  const noteCount = colonies.filter(
    (colony) => Boolean(records[colony.id]?.note || annotations[colony.id]?.note),
  ).length;
  const restoredCount = colonies.filter(
    (colony) => restored.has(colony.id) || records[colony.id]?.restored,
  ).length;

  return (
    <aside className="coral-library" aria-label="Coral library notebook">
      <header>
        <span>
          <BookOpen /> Coral Library
        </span>
        <button type="button" onClick={onClose} aria-label="Close coral library">
          <X />
        </button>
      </header>
      <p>
        {discoveredCount} of {colonies.length} scanned colonies logged. Select
        any entry to revisit its evidence card in the reef.
      </p>
      <div className="coral-library__summary" aria-label="Library progress">
        <span><b>{discoveredCount}</b> scanned</span>
        <span><b>{noteCount}</b> noted</span>
        <span><b>{restoredCount}</b> restored</span>
      </div>
      <div className="coral-library__grid">
        {colonies.map((colony) => {
          const isDiscovered = discovered.has(colony.id);
          const record = records[colony.id];
          const annotation = annotations[colony.id];
          const isStudied = studied.has(colony.id) || Boolean(record?.marked);
          const hasNote = Boolean(record?.note || annotation?.note);
          const isRestored = restored.has(colony.id) || Boolean(record?.restored);
          const status = isRestored
            ? "Restored"
            : hasNote
              ? "Noted"
            : isStudied
              ? "Studied"
              : isDiscovered
                ? "Discovered"
                : "Unscanned";
          const StatusIcon = isDiscovered ? CheckCircle2 : CircleDashed;

          return (
            <button
              type="button"
              key={colony.id}
              className={`${selectedId === colony.id ? "is-active" : ""}${isDiscovered ? " is-discovered" : ""}`}
              onClick={() => onSelect(colony.id)}
            >
              <img src={colony.image} alt="" />
              <span>
                <strong>{colony.common}</strong>
                <small>{colony.species}</small>
                <em>
                  <StatusIcon /> {status}
                </em>
                {hasNote && <small>{record?.note || annotation?.note}</small>}
              </span>
              {isRestored && <Sparkles aria-label="Restored colony" />}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
