/* eslint-disable */
import type { Metadata } from "next";
import { GameProvider } from "../context/GameContext";
import "./globals.css";
import { Outfit } from "next/font/google";
import { cn } from "@/lib/utils";

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "GafferIQ - Football Manager Simulator",
  description: "A premium, AI-powered Football Manager simulation game. Manage real clubs and players from the top 5 European leagues.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", outfit.variable)}>
      <body className="antialiased bg-[#0B0C10] text-[#f8fafc]">
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}

