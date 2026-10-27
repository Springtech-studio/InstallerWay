import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { SolarDesignProvider } from "@/context/SolarDesignContext";
import AICopilot from "@/components/AICopilot";

export const metadata: Metadata = {
  title: "InstallerWay — Solar Load Auditor & SLD Engine",
  description: "Engineering-grade PV array, battery, inverter sizing, and Single Line Diagram generator."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <SolarDesignProvider>
          {/* Header */}
          <header className="border-b border-emerald-900/40 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
                  IW
                </span>
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Installer<span className="text-emerald-400">Way</span>
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                <Link href="/auditor" className="px-3 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition">
                  1. Load Audit
                </Link>
                <Link href="/equipment" className="px-3 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition">
                  2. Equipment
                </Link>
                <Link href="/sld" className="px-3 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition">
                  3. Single Line Diagram
                </Link>
                <Link href="/bom" className="px-3 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition">
                  4. BOM & Proposal
                </Link>
                <Link href="/portfolio" className="px-3 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition">
                  5. Portfolio & Badges
                </Link>
                <Link href="/community" className="px-3 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition">
  6. Community
</Link>
              </nav>

              <div className="flex items-center gap-3">
                <Link
                  href="/auth"
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/profile"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
                >
                  Engineer Profile
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
            {children}
          </main>

          {/* AI Copilot */}
          <AICopilot />
        </SolarDesignProvider>
      </body>
    </html>
  );
}