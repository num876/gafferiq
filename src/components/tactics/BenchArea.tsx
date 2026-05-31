import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Player } from '../../config/seededData';
import { PlayerToken } from './PlayerToken';

interface BenchAreaProps {
  bench: Player[];
}

export function BenchArea({ bench }: BenchAreaProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'bench',
  });

  return (
    <div 
      ref={setNodeRef}
      className={`min-h-[160px] p-4 rounded-xl border-2 transition-colors flex flex-wrap gap-4 items-start ${isOver ? 'border-green-500 bg-green-500/10' : 'border-slate-800 bg-slate-900/50'}`}
    >
      {bench.length === 0 && (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 font-medium text-xs py-8">
          Bench is empty
        </div>
      )}
      {bench.map(player => (
        <PlayerToken key={player.id} id={player.id} player={player} />
      ))}
    </div>
  );
}
