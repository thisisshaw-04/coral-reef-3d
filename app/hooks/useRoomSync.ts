"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { emptyRoom, type ReefRoom } from "../reef-data";

function randomCode() {
  return `R${Math.random().toString(36).slice(2, 7)}`.toUpperCase();
}

function cleanCode(code?: string | null) {
  return code?.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "";
}

export function useRoomSync({
  entered,
  restoredIds,
}: {
  entered: boolean;
  restoredIds: string[];
}) {
  const playerId = useId().replace(/[^a-zA-Z0-9]/g, "") || "diver";
  const diverName = `Diver ${playerId.slice(0, 2).toUpperCase()}`;
  const channel = useRef<BroadcastChannel | null>(null);
  const [roomCode, setRoomCode] = useState("DIVE");
  const [room, setRoom] = useState<ReefRoom>(emptyRoom);

  const mappedIds = useMemo(
    () => Array.from(new Set([...Object.keys(room.annotations), ...restoredIds])),
    [room.annotations, restoredIds],
  );

  const sync = useCallback(
    async (action?: Record<string, unknown>) => {
      try {
        const response = await fetch(`/api/room?code=${encodeURIComponent(roomCode)}`, action
          ? {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(action),
            }
          : undefined);
        if (!response.ok) return;
        const data = (await response.json()) as ReefRoom;
        setRoom(data);
        channel.current?.postMessage(data);
      } catch {}
    },
    [roomCode],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const sharedRoom = cleanCode(new URL(window.location.href).searchParams.get("room"));
      setRoomCode(sharedRoom || randomCode());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!entered || roomCode === "DIVE") return;

    const joinTimer = window.setTimeout(
      () => void sync({ type: "join", id: playerId, name: diverName }),
      0,
    );
    channel.current = new BroadcastChannel(`reef-relay-${roomCode}`);
    channel.current.onmessage = (event) => setRoom(event.data as ReefRoom);

    const timer = window.setInterval(
      () => void sync({ type: "presence", id: playerId, name: diverName }),
      2500,
    );

    return () => {
      window.clearTimeout(joinTimer);
      window.clearInterval(timer);
      channel.current?.close();
      channel.current = null;
    };
  }, [diverName, entered, playerId, roomCode, sync]);

  const chooseRoomCode = useCallback((code?: string) => {
    const cleaned = cleanCode(code);
    if (cleaned) setRoomCode(cleaned);
  }, []);

  return {
    chooseRoomCode,
    diverName,
    mappedIds,
    playerId,
    room,
    roomCode,
    sync,
  };
}
