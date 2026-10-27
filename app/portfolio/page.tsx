"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSolarDesign } from "@/context/SolarDesignContext";
import confetti from "canvas-confetti";
import {
  Briefcase,
  Award,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  TrendingUp,
  Zap,
  BatteryCharging,
  Leaf,
  ShieldCheck,
  Building2,
  Home,
  Network,
  Sparkles,
  ArrowRight
} from "lucide-react";

export type ProjectStatus =
  | "Audited & Designed"
  | "Procurement"
  | "In Progress"
  | "Commissioning"
  | "Completed";

export interface PortfolioProject {
  id: string;
  clientName: string;
  location: string;
  scale: "residential" | "commercial" | "minigrid";
  pvKwp: number;
  inverterKw: number;
  batteryKwh: number;
  contractValue: number;
  status: ProjectStatus;
  dateCreated: string;
}

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "capacity" | "milestone" | "scale";
  requirementText: string;
  isUnlocked: (projects: PortfolioProject[]) => boolean;
  getProgress: (projects: PortfolioProject[]) => { current: number; target: number };
}

const BADGES: BadgeDefinition[] = [
  {
    id: "first_spark",
    name: "First Spark",
    description: "Logged your first audited solar design project on InstallerWay.",
    icon: "⚡",
    category: "milestone",
    requirementText: "1 Project logged",
    isUnlocked: (projects) => projects.length >= 1,
    getProgress: (projects) => ({ current: Math.min(projects.length, 1), target: 1 })
  },
  {
    id: "rooftop_specialist",
    name: "Rooftop Specialist",
    description: "Successfully commissioned 3 or more residential solar installations.",
    icon: "🏠",
    category: "scale",
    requirementText: "3 Residential sites completed",
    isUnlocked: (projects) =>
      projects.filter((p) => p.scale === "residential" && p.status === "Completed").length >= 3,
    getProgress: (projects) => ({
      current: Math.min(
        projects.filter((p) => p.scale === "residential" && p.status === "Completed").length,
        3
      ),
      target: 3
    })
  },
  {
    id: "kw_commander",
    name: "Kilowatt Commander",
    description: "Reached or exceeded 25 kWp of cumulative installed solar PV capacity.",
    icon: "☀️",
    category: "capacity",
    requirementText: "25 kWp deployed",
    isUnlocked: (projects) => {
      const totalKwp = projects
        .filter((p) => p.status === "Completed")
        .reduce((sum, p) => sum + p.pvKwp, 0);
      return totalKwp >= 25;
    },
    getProgress: (projects) => {
      const totalKwp = projects
        .filter((p) => p.status === "Completed")
        .reduce((sum, p) => sum + p.pvKwp, 0);
      return { current: Math.min(Math.round(totalKwp), 25), target: 25 };
    }
  },
  {
    id: "storage_master",
    name: "Storage Master",
    description: "Commissioned 50+ kWh of cumulative lithium/deep cycle storage banks.",
    icon: "🔋",
    category: "capacity",
    requirementText: "50 kWh storage commissioned",
    isUnlocked: (projects) => {
      const totalKwh = projects
        .filter((p) => p.status === "Completed")
        .reduce((sum, p) => sum + p.batteryKwh, 0);
      return totalKwh >= 50;
    },
    getProgress: (projects) => {
      const totalKwh = projects
        .filter((p) => p.status === "Completed")
        .reduce((sum, p) => sum + p.batteryKwh, 0);
      return { current: Math.min(Math.round(totalKwh), 50), target: 50 };
    }
  },
  {
    id: "commercial_titan",
    name: "Commercial Titan",
    description: "Executed a Commercial & Industrial (C&I) solar plant installation.",
    icon: "🏢",
    category: "scale",
    requirementText: "1 Commercial installation completed",
    isUnlocked: (projects) =>
      projects.some((p) => p.scale === "commercial" && p.status === "Completed"),
    getProgress: (projects) => ({
      current: projects.some((p) => p.scale === "commercial" && p.status === "Completed") ? 1 : 0,
      target: 1
    })
  },
  {
    id: "minigrid_pioneer",
    name: "Mini-Grid Pioneer",
    description: "Designed or deployed a utility-grade decentralized mini-grid installation.",
    icon: "🌐",
    category: "scale",
    requirementText: "1 Mini-grid commissioned",
    isUnlocked: (projects) =>
      projects.some((p) => p.scale === "minigrid" && p.status === "Completed"),
    getProgress: (projects) => ({
      current: projects.some((p) => p.scale === "minigrid" && p.status === "Completed") ? 1 : 0,
      target: 1
    })
  },
  {
    id: "carbon_crusader",
    name: "Zero Carbon Hero",
    description: "Offset over 20 Tons of estimated carbon emissions through clean generation.",
    icon: "🌿",
    category: "milestone",
    requirementText: "20 Tons CO2 offset",
    isUnlocked: (projects) => {
      const totalKwp = projects
        .filter((p) => p.status === "Completed")
        .reduce((sum, p) => sum + p.pvKwp, 0);
      return totalKwp * 0.9 >= 20; // ~0.9 Tons CO2 offset per kWp/year
    },
    getProgress: (projects) => {
      const totalKwp = projects
        .filter((p) => p.status === "Completed")
        .reduce((sum, p) => sum + p.pvKwp, 0);
      const tons = totalKwp * 0.9;
      return { current: Math.min(Math.round(tons), 20), target: 20 };
    }
  }
];

export default function PortfolioBadgesPage() {
  const {
    scale,
    selectedInverter,
    selectedBattery,
    pvConfig,
    batteryResults
  } = useSolarDesign();

  // Load Initial Projects from LocalStorage or Sample Set
  const [projects, setProjects] = useState<PortfolioProject[]>([
    {
      id: "demo-p1",
      clientName: "GreenGate Residence",
      location: "Lekki Phase 1, Lagos",
      scale: "residential",
      pvKwp: 6.6,
      inverterKw: 5.0,
      batteryKwh: 10.0,
      contractValue: 4850000,
      status: "Completed",
      dateCreated: "2026-03-12"
    },
    {
      id: "demo-p2",
      clientName: "Alpha Logistics Hub",
      location: "Ibadan Express, Ogun",
      scale: "commercial",
      pvKwp: 22.0,
      inverterKw: 15.0,
      batteryKwh: 30.0,
      contractValue: 16500000,
      status: "In Progress",
      dateCreated: "2026-07-20"
    }
  ]);

  // Status Filter
  const [filterStatus, setFilterStatus] = useState<string>("All");

  // Trigger celebration on completing a project
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Add the currently active sizing session as a project
  const handleSaveCurrentSizingAsProject = () => {
    const newProject: PortfolioProject = {
      id: Math.random().toString(36).substring(2, 9),
      clientName: "New Audited Client",
      location: "Site Survey / Installation Site",
      scale: scale,
      pvKwp: parseFloat((pvConfig.actualKwp || 0).toFixed(2)),
      inverterKw: selectedInverter.ratedKw,
      batteryKwh: parseFloat(batteryResults.totalStorageKwh.toFixed(1)),
      contractValue: 0,
      status: "Audited & Designed",
      dateCreated: new Date().toISOString().split("T")[0]
    };

    setProjects((prev) => [newProject, ...prev]);
    triggerConfetti();
  };

  const updateProjectStatus = (id: string, newStatus: ProjectStatus) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          if (newStatus === "Completed" && p.status !== "Completed") {
            triggerConfetti();
          }
          return { ...p, status: newStatus };
        }
        return p;
      })
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Portfolio Totals
  const completedProjects = projects.filter((p) => p.status === "Completed");
  const totalKwpDeployed = completedProjects.reduce((sum, p) => sum + p.pvKwp, 0);
  const totalKwhDeployed = completedProjects.reduce((sum, p) => sum + p.batteryKwh, 0);
  const estimatedCarbonOffsetTons = (totalKwpDeployed * 0.9).toFixed(1);

  // Installer Rank Tier Determination
  const getRankTier = () => {
    if (completedProjects.length >= 10 || totalKwpDeployed >= 100) {
      return { rank: "Master EPC Director", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" };
    }
    if (completedProjects.length >= 5 || totalKwpDeployed >= 30) {
      return { rank: "Senior Principal Systems Engineer", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
    }
    if (completedProjects.length >= 2 || totalKwpDeployed >= 10) {
      return { rank: "Certified Solar Specialist", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" };
    }
    return { rank: "Apprentice Solar Technician", color: "text-slate-300", bg: "bg-slate-800 border-slate-700" };
  };

  const currentTier = getRankTier();

  const filteredProjects =
    filterStatus === "All" ? projects : projects.filter((p) => p.status === filterStatus);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/40">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" /> Step 5: Professional Portfolio & Engineering Badges
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Work Tracker & Badges Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Earn certified engineering badges by uploading and executing verified solar projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveCurrentSizingAsProject}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/40"
          >
            <Plus className="w-4 h-4" /> Save Current Sizing to Portfolio
          </button>
        </div>
      </div>

      {/* Installer Rank & Deployed Capacity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tier Card */}
        <div className={`p-4 rounded-2xl border ${currentTier.bg} flex flex-col justify-between`}>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Installer Rank Tier
            </span>
            <div className={`text-lg font-black mt-1 ${currentTier.color}`}>
              {currentTier.rank}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {completedProjects.length} Verified Commissioned Sites
          </div>
        </div>

        {/* Total Installed PV */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total PV Deployed</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {totalKwpDeployed.toFixed(1)} <span className="text-xs font-normal text-emerald-400">kWp</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all completed sites</div>
        </div>

        {/* Total Storage */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Storage Commissioned</span>
            <BatteryCharging className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {totalKwhDeployed.toFixed(1)} <span className="text-xs font-normal text-blue-400">kWh</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Battery ESS capacity online</div>
        </div>

        {/* CO2 Offset */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Estimated CO2 Offset</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {estimatedCarbonOffsetTons} <span className="text-xs font-normal text-slate-400">Tons</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Annual environmental benefit</div>
        </div>
      </div>

      {/* BADGES ENGINE SECTION */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Dynamic Engineering Badges</h2>
              <p className="text-xs text-slate-400">
                Unlock achievements automatically as you upload and mark projects complete.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
            {BADGES.filter((b) => b.isUnlocked(projects)).length} of {BADGES.length} Unlocked
          </span>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {BADGES.map((badge) => {
            const unlocked = badge.isUnlocked(projects);
            const progress = badge.getProgress(projects);
            const percent = Math.min(100, Math.round((progress.current / progress.target) * 100));

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border transition-all ${
                  unlocked
                    ? "bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20"
                    : "bg-slate-950/60 border-slate-800 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{badge.icon}</span>
                  {unlocked ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                      Earned
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Locked
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-white">{badge.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{badge.description}</p>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>{badge.requirementText}</span>
                    <span className="font-semibold text-white">{percent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        unlocked ? "bg-emerald-500" : "bg-slate-600"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PROJECTS TRACKER TABLE */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            Project Lifecycle Pipeline ({projects.length})
          </h2>

          {/* Filter Status Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value="All">All Projects</option>
              <option value="Audited & Designed">Audited &amp; Designed</option>
              <option value="Procurement">Procurement</option>
              <option value="In Progress">In Progress</option>
              <option value="Commissioning">Commissioning</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Client / Site</th>
                <th className="py-3 px-3">Scale</th>
                <th className="py-3 px-3 text-center">PV Array</th>
                <th className="py-3 px-3 text-center">Inverter</th>
                <th className="py-3 px-3 text-center">Battery Bank</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
              {filteredProjects.map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{proj.clientName}</div>
                    <div className="text-[11px] text-slate-400">{proj.location}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {proj.scale}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-blue-400">
                    {proj.pvKwp} kWp
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-amber-400">
                    {proj.inverterKw} kW
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-400">
                    {proj.batteryKwh} kWh
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={proj.status}
                      onChange={(e) => updateProjectStatus(proj.id, e.target.value as ProjectStatus)}
                      className={`text-xs rounded-lg px-2.5 py-1 font-semibold border ${
                        proj.status === "Completed"
                          ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400"
                          : proj.status === "In Progress"
                          ? "bg-amber-950/40 border-amber-500/40 text-amber-400"
                          : "bg-slate-950 border-slate-700 text-slate-300"
                      }`}
                    >
                      <option value="Audited & Designed">Audited &amp; Designed</option>
                      <option value="Procurement">Procurement</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Commissioning">Commissioning</option>
                      <option value="Completed">Completed &amp; Handed Over</option>
                    </select>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="p-1 text-slate-400 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-4">
        <Link
          href="/bom"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition"
        >
          Return to BOM Proposal
        </Link>
        <Link
          href="/profile"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition"
        >
          Go to Engineer Profile &amp; Seal <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}