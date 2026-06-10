"use client";

import React from "react";
import Link from "next/link";
import { 
  Trophy, LayoutDashboard, Users, Shield, Calendar, Table, 
  ArrowLeftRight, Search, TrendingUp, User, LogOut, Mail,
  Building, GraduationCap, Landmark
} from 'lucide-react';
import { useGame } from "../../../context/GameContext";

export default function MoreMenu() {
  const { activeSave } = useGame();

  if (!activeSave) return null;

  const menuItems = [
    { name: "League Table", href: "/game/table", icon: Table },
    { name: "Competitions", href: "/game/competitions", icon: Trophy },
    { name: "Transfers", href: "/game/transfers", icon: ArrowLeftRight },
    { name: "Finances", href: "/game/finances", icon: Landmark },
    { name: "Scouting", href: "/game/scouting", icon: Search },
    { name: "Development", href: "/game/development", icon: GraduationCap },
    { name: "Board", href: "/game/board", icon: Building },
    { name: "Career", href: "/game/manager-career", icon: User },
  ];

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
             More
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">Access all other club management areas.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.name}
              href={item.href}
              className="glass-card flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-white/5 hover:bg-white/5 hover:border-fm-neonCyan/30 transition-all group"
            >
              <Icon className="w-8 h-8 text-fm-slate group-hover:text-fm-neonCyan transition-colors" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-300 group-hover:text-white">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
