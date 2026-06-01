/* eslint-disable */
import type { Metadata } from "next";
import { GameProvider } from "../context/GameContext";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

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
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="antialiased bg-[#0f172a] text-[#f8fafc]">
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}

