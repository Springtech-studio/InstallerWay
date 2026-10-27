"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSolarDesign } from "@/context/SolarDesignContext";
import { 
  INVERTER_CATALOG, 
  BATTERY_CATALOG, 
  PANEL_CATALOG,
  InverterSpec,
  BatterySpec,
  SolarPanelSpec
} from "@/lib/hardwareCatalog";
import { 
  Cpu, 
  Battery, 
  SunMedium, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Zap,
  Sliders
} from "lucide-react";

export default function EquipmentPage() {
  const {
    totals,
    batteryResults,
    targetKwp,
    selectedInverter,
    setSelectedInverter,
    selectedBattery,
    setSelectedBattery,
    selectedPanel,
    setSelectedPanel,
    pvConfig
  } = useSolarDesign();

  // Brand Filter States
  const [inverterBrandFilter, setInverterBrandFilter] = useState<string>("All");
  const [batteryBrandFilter, setBatteryBrandFilter] = useState<string>("All");
  const [panelBrandFilter, setPanelBrandFilter] = useState<string>("All");

  // Temperature parameters for MPPT string boundary checks
  const [minAmbientTemp, setMinAmbientTemp] = useState<number>(15);
  const [maxAmbientTemp, setMaxAmbientTemp] = useState<number>(45);

  // Extract Unique Brand Lists
  const inverterBrands = useMemo(() => ["All", ...Array.from(new Set(INVERTER_CATALOG.map((i) => i.brand)))], []);
  const batteryBrands = useMemo(() => ["All", ...Array.from(new Set(BATTERY_CATALOG.map((b) => b.brand)))], []);
  const panelBrands = useMemo(() => ["All", ...Array.from(new Set(PANEL_CATALOG.map((p) => p.brand)))], []);

  // Filtered Catalogues
  const filteredInverters = useMemo(() => {
    return inverterBrandFilter === "All"
      ? INVERTER_CATALOG
      : INVERTER_CATALOG.filter((i) => i.brand === inverterBrandFilter);
  }, [inverterBrandFilter]);

  const filteredBatteries = useMemo(() => {
    return batteryBrandFilter === "All"
      ? BATTERY_CATALOG
      : BATTERY_CATALOG.filter((b) => b.brand === batteryBrandFilter);
  }, [batteryBrandFilter]);

  const filteredPanels = useMemo(() => {
    return panelBrandFilter === "All"
      ? PANEL_CATALOG
      : PANEL_CATALOG.filter((p) => p.brand === panelBrandFilter);
  }, [panelBrandFilter]);

  // Electrical checks
  const inverterAdequate = selectedInverter.ratedKw * 1000 >= totals.continuousWatts;
  const surgeAdequate = selectedInverter.surgeKw * 1000 >= totals.peakSurgeWatts;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/40">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" /> Step 2: Hardware Selection & Sizing
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Equipment Matching Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Verify continuous kW, surge headroom, MPPT voltage windows, and storage bank modules.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/auditor"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Auditor
          </Link>
          <Link
            href="/sld"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-900/30"
          >
            Generate SLD <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Audit Target Quick Reference Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
        <div>
          <span className="text-[11px] text-slate-400 block">Required Continuous</span>
          <span className="text-base font-bold text-white">{(totals.continuousWatts / 1000).toFixed(2)} kW</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block">Required Surge</span>
          <span className="text-base font-bold text-amber-400">{(totals.peakSurgeWatts / 1000).toFixed(2)} kW</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block">Night Demand</span>
          <span className="text-base font-bold text-emerald-400">{totals.nightKwh.toFixed(2)} kWh</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block">Target PV Capacity</span>
          <span className="text-base font-bold text-blue-400">{targetKwp.toFixed(2)} kWp</span>
        </div>
      </div>

      {/* SECTION 1: INVERTER SELECTION */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">1. Power Inverter / Charger Selection</h2>
              <p className="text-xs text-slate-400">Select model and verify against peak continuous and inrush surges.</p>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter Brand:</span>
            <select
              value={inverterBrandFilter}
              onChange={(e) => setInverterBrandFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-white"
            >
              {inverterBrands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-slate-300">Select Inverter Model</label>
            <select
              value={selectedInverter.id}
              onChange={(e) => {
                const found = INVERTER_CATALOG.find((i) => i.id === e.target.value);
                if (found) setSelectedInverter(found);
              }}
              className="w-full bg-slate-950 border border-slate-700 text-sm rounded-xl p-3 text-white focus:border-emerald-500"
            >
              {filteredInverters.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.brand} — {inv.model} ({inv.ratedKw} kW / {inv.surgeKw} kW surge, {inv.dcVoltage}V, {inv.type})
                </option>
              ))}
            </select>
          </div>

          {/* Compliance Card */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            inverterAdequate && surgeAdequate
              ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-300"
              : "bg-red-950/20 border-red-900/50 text-red-300"
          }`}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              {inverterAdequate && surgeAdequate ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Inverter Rating Adequate
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400" /> Undersized Inverter
                </>
              )}
            </div>
            <div className="text-xs mt-2 space-y-1">
              <div>Continuous Margin: <strong>{((selectedInverter.ratedKw * 1000) - totals.continuousWatts).toFixed(0)} W</strong></div>
              <div>Surge Margin: <strong>{((selectedInverter.surgeKw * 1000) - totals.peakSurgeWatts).toFixed(0)} W</strong></div>
              <div>DC Bus: <strong>{selectedInverter.dcVoltage}V Nominal</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: BATTERY STORAGE SELECTION */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Battery className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">2. Battery Bank & Storage Sizing</h2>
              <p className="text-xs text-slate-400">Sizes module count based on chemistry DoD deratings.</p>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter Brand:</span>
            <select
              value={batteryBrandFilter}
              onChange={(e) => setBatteryBrandFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-white"
            >
              {batteryBrands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-slate-300">Select Battery Model</label>
            <select
              value={selectedBattery.id}
              onChange={(e) => {
                const found = BATTERY_CATALOG.find((b) => b.id === e.target.value);
                if (found) setSelectedBattery(found);
              }}
              className="w-full bg-slate-950 border border-slate-700 text-sm rounded-xl p-3 text-white focus:border-emerald-500"
            >
              {filteredBatteries.map((bat) => (
                <option key={bat.id} value={bat.id}>
                  {bat.brand} — {bat.model} ({bat.nominalKwh} kWh, {bat.capacityAh}Ah @ {bat.nominalVoltage}V, {bat.chemistry}, {(bat.recommendedDoD * 100).toFixed(0)}% DoD)
                </option>
              ))}
            </select>
          </div>

          {/* Bank Sizing Result Card */}
          <div className="p-4 rounded-xl border bg-slate-950/60 border-slate-800 text-slate-200 flex flex-col justify-between">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Storage Bank Requirement
            </div>
            <div className="text-2xl font-black text-white my-1">
              {batteryResults.modulesCount} <span className="text-xs font-normal text-slate-400">Modules Required</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <div>Total Nameplate: <strong>{batteryResults.totalStorageKwh.toFixed(1)} kWh</strong></div>
              <div>Usable Storage: <strong>{(batteryResults.totalStorageKwh * selectedBattery.recommendedDoD).toFixed(1)} kWh</strong></div>
              <div>Chemistry: <strong>{selectedBattery.chemistry}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: SOLAR PV & MPPT STRING ENGINE */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <SunMedium className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">3. Solar PV Array & MPPT String Configurator</h2>
              <p className="text-xs text-slate-400">Verifies series/parallel string limits against inverter MPPT voltages.</p>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter Brand:</span>
            <select
              value={panelBrandFilter}
              onChange={(e) => setPanelBrandFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-white"
            >
              {panelBrands.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-slate-300">Select Solar Panel</label>
            <select
              value={selectedPanel.id}
              onChange={(e) => {
                const found = PANEL_CATALOG.find((p) => p.id === e.target.value);
                if (found) setSelectedPanel(found);
              }}
              className="w-full bg-slate-950 border border-slate-700 text-sm rounded-xl p-3 text-white focus:border-emerald-500"
            >
              {filteredPanels.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand} — {p.model} ({p.pMax}W, Voc: {p.vOc}V, Vmp: {p.vMp}V, {p.tech})
                </option>
              ))}
            </select>
          </div>

          {/* Temperature Range Controls */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Temperature Design Bounds
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Cold Min (Voc limit):</span>
              <input
                type="number"
                value={minAmbientTemp}
                onChange={(e) => setMinAmbientTemp(parseFloat(e.target.value) || 0)}
                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-right text-white"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Hot Max (Vmp limit):</span>
              <input
                type="number"
                value={maxAmbientTemp}
                onChange={(e) => setMaxAmbientTemp(parseFloat(e.target.value) || 50)}
                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-right text-white"
              />
            </div>
          </div>
        </div>

        {/* String Calculation Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Total Array Modules</span>
            <span className="text-lg font-bold text-white">{pvConfig.totalPanels} Panels</span>
            <span className="text-[10px] text-emerald-400 block">({pvConfig.actualKwp?.toFixed(2)} kWp Installed)</span>
          </div>
          <div>
            <span className="text-slate-400 block">String Layout</span>
            <span className="text-lg font-bold text-blue-400">
              {pvConfig.parallelStrings} Strings of {pvConfig.panelsInSeries}
            </span>
            <span className="text-[10px] text-slate-400 block">Parallel × Series</span>
          </div>
          <div>
            <span className="text-slate-400 block">Cold String Voc</span>
            <span className={`text-lg font-bold ${pvConfig.isCompliant ? "text-white" : "text-red-400"}`}>
              {pvConfig.stringVocCold?.toFixed(1)} V
            </span>
            <span className="text-[10px] text-slate-400 block">Max Inverter Voc: {selectedInverter.maxVoc}V</span>
          </div>
          <div>
            <span className="text-slate-400 block">Hot String Vmp</span>
            <span className="text-lg font-bold text-white">{pvConfig.stringVmpHot?.toFixed(1)} V</span>
            <span className="text-[10px] text-slate-400 block">Min MPPT V: {selectedInverter.mpptMinV}V</span>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-4">
        <Link
          href="/auditor"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" /> 1. Return to Load Auditor
        </Link>
        <Link
          href="/sld"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition"
        >
          3. Generate Single Line Diagram <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}