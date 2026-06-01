/* eslint-disable */
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Player } from '../../config/seededData';
import { CSS } from '@dnd-kit/utilities';

interface PlayerTokenProps {
  player: Player;
  id: string; // The player ID
}

export function PlayerToken({ player, id }: PlayerTokenProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: { player }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  let posColor = "bg-yellow-400 text-yellow-950";
  if (player.position === "GK") posColor = "bg-slate-300 text-slate-900";
  if (player.position === "DEF") posColor = "bg-sky-400 text-sky-950";
  if (player.position === "MID") posColor = "bg-emerald-400 text-emerald-950";
  if (player.position === "ATT") posColor = "bg-rose-400 text-rose-950";

  // Get the last name or a short name
  const nameParts = player.name.split(' ');
  const displayName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : player.name;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform ${isDragging ? 'opacity-40 z-50 scale-110' : 'opacity-100'}`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shadow-lg border border-white/30 ${posColor}`}>
        {player.overall}
      </div>
      <div className="absolute -bottom-4 bg-slate-950/90 text-slate-100 text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap overflow-hidden text-ellipsis max-w-[64px] border border-slate-800">
        {displayName}
      </div>
    </div>
  );
}
