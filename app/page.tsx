"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSolarDesign, InstallationScale } from "@/context/SolarDesignContext";
import { 
  Zap, 
  Sun, 
  Moon, 
  BatteryCharging, 
  Plus, 
  Trash2, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck,
  Building2,
  Home,
  Network
} from "lucide-react";

export default function LoadAuditorPage() {
  const {
    scale,
    setScale,
    peakSunHours,
    setPeakSunHours,
    autonomyDays,
    setAutonomyDays,
    loads,
    addLoad,
    removeLoad,
    updateLoad,
    totals,
    batteryResults,
    targetKwp
  } = useSolarDesign();

  // Form state for adding new custom appliance
  const [newAppliance, setNewAppliance] = useState({
    name: "",
    qty: 1,
    watts: 100,
    hoursDay: 2,
    hoursNight: 4,
    surgeMultiplier: 1.0
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppliance.name.trim()) return;
    addLoad(newAppliance);
    setNewAppliance({
      name: "",
      qty: 1,
      watts: 100,
      hoursDay: 2,
      hoursNight: 4,
      surgeMultiplier: 1.0
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Header & Installation Scale Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/40">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" /> Step 1: Energy & Power Audit
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Solar Load Auditor Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Quantify continuous run-watts, inductive surge multipliers, and nocturnal storage demands.
          </p>
        </div>

        {/* Installation Scale Pill Switcher */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-emerald-900/40">
          <button
            onClick={() => setScale("residential")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              scale === "residential"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Home className="w-3.5 h-3.5" /> Residential
          </button>
          <button
            onClick={() => setScale("commercial")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              scale === "commercial"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Commercial
          </button>
          <button
            onClick={() => setScale("minigrid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              scale === "minigrid"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Network className="w-3.5 h-3.5" /> Mini-Grid
          </button>
        </div>
      </div>

      {/* KPI Engineering Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-400">Continuous Running Power</div>
          <div className="text-2xl font-black text-white mt-1">
            {(totals.continuousWatts / 1000).toFixed(2)}{" "}
            <span className="text-xs font-normal text-emerald-400">kW</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Baseline inverter capacity threshold</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-400">Peak Inductive Surge</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {(totals.peakSurgeWatts / 1000).toFixed(2)}{" "}
            <span className="text-xs font-normal text-amber-500">kW</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Inrush surge for pumps, compressors & ACs</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-400">Daily Energy Demand</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {totals.totalDailyKwh.toFixed(2)}{" "}
            <span className="text-xs font-normal text-slate-400">kWh/day</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Day: {totals.dayKwh.toFixed(1)} kWh | Night: {totals.nightKwh.toFixed(1)} kWh
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-400">Estimated PV Array Required</div>
          <div className="text-2xl font-black text-blue-400 mt-1">
            {targetKwp.toFixed(2)}{" "}
            <span className="text-xs font-normal text-blue-500">kWp</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Based on {peakSunHours} Peak Sun Hours (PSH)</div>
        </div>
      </div>

      {/* Environmental & Site Conditions Panel */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400" /> Site Environmental & Autonomy Tuning
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Peak Sun Hours (PSH - NASA POWER / PVGIS)</span>
              <span className="text-emerald-400 font-bold">{peakSunHours} hrs/day</span>
            </div>
            <input
              type="range"
              min="2.5"
              max="7.0"
              step="0.1"
              value={peakSunHours}
              onChange={(e) => setPeakSunHours(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>2.5 hrs (Low Irradiance/Temperate)</span>
              <span>5.0 hrs (Tropical/Sub-Saharan)</span>
              <span>7.0 hrs (Equatorial/Desert)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Days of Storage Autonomy</span>
              <span className="text-emerald-400 font-bold">{autonomyDays} {autonomyDays === 1 ? "Day" : "Days"}</span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={autonomyDays}
              onChange={(e) => setAutonomyDays(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 Day (Standard Grid Backup)</span>
              <span>2 Days (Reliable Hybrid)</span>
              <span>3+ Days (100% Critical Off-Grid)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appliance Load Inventory Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Appliance Load Breakdown & Duty Cycles
          </h2>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-semibold">
            {loads.length} Configured Loads
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Appliance / Machine</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Rating (W)</th>
                <th className="py-3 px-3 text-center">Day (Hrs)</th>
                <th className="py-3 px-3 text-center">Night (Hrs)</th>
                <th className="py-3 px-3 text-center">Inrush Multiplier</th>
                <th className="py-3 px-4 text-right">Daily Demand</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
              {loads.map((item) => {
                const totalItemDailyKwh = (item.qty * item.watts * (item.hoursDay + item.hoursNight)) / 1000;
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white">{item.name}</span>
                      {item.surgeMultiplier > 1.5 && (
                        <span className="ml-2 inline-flex items-center text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                          Inductive Load
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateLoad(item.id, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center text-white"
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <input
                        type="number"
                        min="1"
                        value={item.watts}
                        onChange={(e) => updateLoad(item.id, { watts: Math.max(1, parseFloat(e.target.value) || 0) })}
                        className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right text-white"
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={item.hoursDay}
                        onChange={(e) => updateLoad(item.id, { hoursDay: Math.max(0, parseFloat(e.target.value) || 0) })}
                        className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center text-white"
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={item.hoursNight}
                        onChange={(e) => updateLoad(item.id, { hoursNight: Math.max(0, parseFloat(e.target.value) || 0) })}
                        className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center text-white"
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <select
                        value={item.surgeMultiplier}
                        onChange={(e) => updateLoad(item.id, { surgeMultiplier: parseFloat(e.target.value) })}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                      >
                        <option value="1.0">1.0x (Resistive / Electronics)</option>
                        <option value="1.5">1.5x (Fans / Light Motors)</option>
                        <option value="2.5">2.5x (Inverter Refrigerator / AC)</option>
                        <option value="3.5">3.5x (Water Pump / Conventional AC)</option>
                        <option value="5.0">5.0x (Heavy Induction Motor)</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      {totalItemDailyKwh.toFixed(2)} kWh
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => removeLoad(item.id)}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Quick Add Custom Appliance Sub-Form */}
        <form onSubmit={handleAddSubmit} className="p-4 bg-slate-950/80 border-t border-slate-800 grid grid-cols-2 md:grid-cols-7 gap-3 items-end">
          <div className="col-span-2">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Appliance Name</label>
            <input
              type="text"
              placeholder="e.g. Workshop Air Compressor"
              value={newAppliance.name}
              onChange={(e) => setNewAppliance({ ...newAppliance, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Qty</label>
            <input
              type="number"
              min="1"
              value={newAppliance.qty}
              onChange={(e) => setNewAppliance({ ...newAppliance, qty: parseInt(e.target.value) || 1 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Power (Watts)</label>
            <input
              type="number"
              min="1"
              value={newAppliance.watts}
              onChange={(e) => setNewAppliance({ ...newAppliance, watts: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-right text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Day Hrs</label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={newAppliance.hoursDay}
              onChange={(e) => setNewAppliance({ ...newAppliance, hoursDay: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Night Hrs</label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={newAppliance.hoursNight}
              onChange={(e) => setNewAppliance({ ...newAppliance, hoursNight: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center text-white"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full h-8 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
        </form>
      </div>

      {/* AI Diagnostic Advisory Bar */}
      <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              InstallerWay AI Engineering Check
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Nighttime consumption is {totals.nightKwh.toFixed(1)} kWh ({((totals.nightKwh / (totals.totalDailyKwh || 1)) * 100).toFixed(0)}% of daily load).
              Ensure battery capacity is rated for at least {batteryResults.usableKwhNeeded.toFixed(1)} kWh usable storage.
            </p>
          </div>
        </div>

        {/* Proceed to Equipment Selection */}
        <Link
          href="/equipment"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition whitespace-nowrap self-end md:self-auto"
        >
          Proceed to Equipment Sizing <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}