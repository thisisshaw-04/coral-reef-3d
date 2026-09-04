"use client";

/* eslint-disable @next/next/no-img-element */
import { BookOpen, CheckCircle2, CircleDashed, Sparkles, X } from "lucide-react";
import type { Colony } from "../reef-data";

type CoralLibraryProps = {
  colonies: Colony[];
  discoveredIds: string[];
  mappedIds: string[];
  restoredIds: string[];
  selectedId?: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
};

export function CoralLibrary({
  colonies,
  discoveredIds,
  mappedIds,
  restoredIds,
  selectedId,
  onClose,
  onSelect,
}: CoralLibraryProps) {
  const discovered = new Set([...discoveredIds, ...mappedIds, ...restoredIds]);
  const studied = new Set(mappedIds);
  const restored = new Set(restoredIds);
  const discoveredCount = colonies.filter((colony) => discovered.has(colony.id)).length;

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
      <div className="coral-library__grid">
        {colonies.map((colony) => {
          const isDiscovered = discovered.has(colony.id);
          const isStudied = studied.has(colony.id);
          const isRestored = restored.has(colony.id);
          const status = isRestored
            ? "Restored"
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
              </span>
              {isRestored && <Sparkles aria-label="Restored colony" />}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
