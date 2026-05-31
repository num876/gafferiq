import React from 'react';
import { PitchSlot } from './PitchSlot';
import { PlayerToken } from './PlayerToken';
import { Player } from '../../../config/seededData';

export const FORMATION_433 = [
  { id: 'GK', label: 'GK', top: '90%', left: '50%' },
  { id: 'LB', label: 'LB', top: '75%', left: '15%' },
  { id: 'LCB', label: 'CB', top: '75%', left: '35%' },
  { id: 'RCB', label: 'CB', top: '75%', left: '65%' },
  { id: 'RB', label: 'RB', top: '75%', left: '85%' },
  { id: 'LCM', label: 'CM', top: '55%', left: '30%' },
  { id: 'CDM', label: 'CDM', top: '60%', left: '50%' },
  { id: 'RCM', label: 'CM', top: '55%', left: '70%' },
  { id: 'LW', label: 'LW', top: '35%', left: '20%' },
  { id: 'ST', label: 'ST', top: '30%', left: '50%' },
  { id: 'RW', label: 'RW', top: '35%', left: '80%' },
];

interface TacticsPitchProps {
  startingXI: Record<string, Player | null>; // Map slot ID -> Player
}

export function TacticsPitch({ startingXI }: TacticsPitchProps) {
  return (
    <div className="relative w-full aspect-[3/4] sm:aspect-[2/3] max-h-[600px] bg-gradient-to-b from-green-600 to-green-700 rounded-lg overflow-hidden border-4 border-slate-900 shadow-2xl mx-auto">
      {/* Pitch Markings */}
      {/* Center Circle & Line */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-white/30 shadow-[0_0_2px_rgba(255,255,255,0.4)]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/30"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/50 rounded-full"></div>
      
      {/* Top Penalty Area */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[15%] border-b border-l border-r border-white/30 flex justify-center">
        {/* Goal Area */}
        <div className="absolute top-0 w-1/2 h-1/2 border-b border-l border-r border-white/30"></div>
        {/* Penalty Spot */}
        <div className="absolute bottom-3 w-1 h-1 bg-white/50 rounded-full"></div>
      </div>
      
      {/* Bottom Penalty Area */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[15%] border-t border-l border-r border-white/30 flex justify-center">
        {/* Goal Area */}
        <div className="absolute bottom-0 w-1/2 h-1/2 border-t border-l border-r border-white/30"></div>
        {/* Penalty Spot */}
        <div className="absolute top-3 w-1 h-1 bg-white/50 rounded-full"></div>
      </div>

      {/* Slots */}
      {FORMATION_433.map(slot => {
        const player = startingXI[slot.id];
        return (
          <PitchSlot key={slot.id} id={slot.id} label={slot.label} top={slot.top} left={slot.left}>
            {player && <PlayerToken id={player.id} player={player} />}
          </PitchSlot>
        );
      })}
    </div>
  );
}
