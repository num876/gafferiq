import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface PitchSlotProps {
  id: string; // The slot ID (e.g., 'ST-C', 'CM-L')
  label: string; // Display label if empty
  children: React.ReactNode;
  top?: string;
  left?: string;
}

export function PitchSlot({ id, label, children, top, left }: PitchSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-colors ${
        isOver ? 'ring-2 ring-green-400 bg-green-400/30 shadow-[0_0_15px_rgba(74,222,128,0.5)]' 
        : children ? '' 
        : 'border-2 border-white/20 bg-black/20 hover:border-white/40'
      }`}
      style={{ top, left }}
    >
      {children}
      {!children && <span className="text-[9px] font-bold text-white/40 tracking-wider pointer-events-none">{label}</span>}
    </div>
  );
}
