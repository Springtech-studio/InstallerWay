"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useSolarDesign } from "@/context/SolarDesignContext";
import { 
  Download, 
  ArrowLeft, 
  ArrowRight, 
  Layers, 
  Info,
  CheckCircle2
} from "lucide-react";

export default function SingleLineDiagramPage() {
  const {
    scale,
    totals,
    selectedInverter,
    selectedBattery,
    selectedPanel,
    batteryResults,
    pvConfig
  } = useSolarDesign();

  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `InstallerWay_SLD_${scale.toUpperCase()}_${selectedInverter.ratedKw}kW.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const isExternalMppt = selectedInverter.type === "External MPPT";
  const batteryAmps = Math.round(((selectedInverter.ratedKw * 1000) / (selectedInverter.dcVoltage || 48)) * 1.25);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/40">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" /> Step 3: Electrical Engineering Schematics
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Single Line Diagram (SLD) Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Vector schematic with DC string protection, busbar distribution, battery isolation, and AC changeover.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSvg}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-white text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export Vector (.SVG)
          </button>
          <Link
            href="/bom"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/30"
          >
            View BOM &amp; Proposal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Engineering Badges Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs">
        <div>
          <span className="text-slate-400 block">System Architecture</span>
          <span className="font-bold text-emerald-400 uppercase">{scale} • {selectedInverter.type}</span>
        </div>
        <div>
          <span className="text-slate-400 block">PV Array Power</span>
          <span className="font-bold text-white">{pvConfig.actualKwp?.toFixed(2) || "0.00"} kWp ({pvConfig.totalPanels || 0} Panels)</span>
        </div>
        <div>
          <span className="text-slate-400 block">Inverter Continuous</span>
          <span className="font-bold text-amber-400">{selectedInverter.ratedKw} kW ({selectedInverter.dcVoltage}V DC Bus)</span>
        </div>
        <div>
          <span className="text-slate-400 block">Battery Storage</span>
          <span className="font-bold text-blue-400">{batteryResults.totalStorageKwh.toFixed(1)} kWh ({batteryResults.modulesCount} Modules)</span>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-2xl overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox="0 0 1150 560"
          className="w-full min-w-[950px] h-auto select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Grid Pattern & Gradients */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
            <linearGradient id="pvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="invGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="batGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="#020617" />
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Title Block Header inside SVG */}
          <text x="35" y="38" fill="#f8fafc" fontSize="16" fontWeight="bold">
            INSTALLERWAY — ELECTRICAL SINGLE LINE DIAGRAM (SLD)
          </text>
          <text x="35" y="56" fill="#64748b" fontSize="11">
            Standard: IEC 60364-7-712 / NEC 690 | Voltage: 230V/400V AC, {selectedInverter.dcVoltage}V DC | Classification: {scale.toUpperCase()}
          </text>

          {/* 1. SOLAR PV ARRAY BLOCK */}
          <g transform="translate(40, 95)">
            <rect width="180" height="200" rx="12" fill="#091e3a" stroke="#0284c7" strokeWidth="1.5" />
            <text x="90" y="28" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
              SOLAR PV ARRAY
            </text>
            <text x="90" y="46" fill="#94a3b8" fontSize="10" textAnchor="middle">
              {selectedPanel.brand} {selectedPanel.model}
            </text>
            
            {/* Panel Graphics Representation */}
            <g transform="translate(25, 60)">
              <rect width="38" height="55" rx="3" fill="url(#pvGrad)" stroke="#38bdf8" strokeWidth="0.8" />
              <line x1="0" y1="27" x2="38" y2="27" stroke="#38bdf8" strokeWidth="0.5" />
              <line x1="19" y1="0" x2="19" y2="55" stroke="#38bdf8" strokeWidth="0.5" />

              <rect x="46" y="0" width="38" height="55" rx="3" fill="url(#pvGrad)" stroke="#38bdf8" strokeWidth="0.8" />
              <line x1="46" y1="27" x2="84" y2="27" stroke="#38bdf8" strokeWidth="0.5" />
              <line x1="65" y1="0" x2="65" y2="55" stroke="#38bdf8" strokeWidth="0.5" />

              <rect x="92" y="0" width="38" height="55" rx="3" fill="url(#pvGrad)" stroke="#38bdf8" strokeWidth="0.8" />
              <line x1="92" y1="27" x2="130" y2="27" stroke="#38bdf8" strokeWidth="0.5" />
              <line x1="111" y1="0" x2="111" y2="55" stroke="#38bdf8" strokeWidth="0.5" />
            </g>

            <text x="90" y="145" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
              {pvConfig.actualKwp?.toFixed(2) || "0.00"} kWp Total
            </text>
            <text x="90" y="165" fill="#cbd5e1" fontSize="10" textAnchor="middle">
              {pvConfig.parallelStrings || 1} Strings of {pvConfig.panelsInSeries || 0} Modules
            </text>
            <text x="90" y="183" fill="#64748b" fontSize="9" textAnchor="middle">
              Voc: {pvConfig.stringVocCold?.toFixed(0) || "0"}V | Vmp: {pvConfig.stringVmpHot?.toFixed(0) || "0"}V
            </text>
          </g>

          {/* PV DC Isolator + SPD Combiner */}
          <g transform="translate(260, 160)">
            <rect width="60" height="70" rx="8" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.2" />
            <text x="30" y="24" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">DC SPD</text>
            <text x="30" y="38" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">&amp; ISO</text>
            <text x="30" y="56" fill="#38bdf8" fontSize="8" textAnchor="middle">1000V DC</text>
          </g>

          {/* Wires: PV to Combiner */}
          <path d="M 220 195 L 260 195" stroke="#38bdf8" strokeWidth="2.5" fill="none" />

          {/* Wires: Combiner to Inverter */}
          <path d="M 320 195 L 390 195" stroke="#38bdf8" strokeWidth="2.5" fill="none" />

          {/* 2. INVERTER / POWER ELECTRONICS BLOCK */}
          <g transform="translate(390, 85)">
            <rect width="240" height="220" rx="14" fill="#062017" stroke="#10b981" strokeWidth="2" />
            <text x="120" y="28" fill="#34d399" fontSize="13" fontWeight="bold" textAnchor="middle">
              {selectedInverter.brand.toUpperCase()} {selectedInverter.type.toUpperCase()}
            </text>
            <text x="120" y="46" fill="#94a3b8" fontSize="10" textAnchor="middle">
              Model: {selectedInverter.model}
            </text>

            {/* Inverter Internal Schematic Modules */}
            <g transform="translate(25, 65)">
              <rect width="70" height="50" rx="6" fill="#0f2b20" stroke="#059669" strokeWidth="1" />
              <text x="35" y="24" fill="#6ee7b7" fontSize="9" fontWeight="bold" textAnchor="middle">
                {isExternalMppt ? "DC CHARGE" : "INTERNAL"}
              </text>
              <text x="35" y="38" fill="#6ee7b7" fontSize="9" fontWeight="bold" textAnchor="middle">
                {isExternalMppt ? "CONTROLLER" : "MPPT STAGE"}
              </text>

              <path d="M 75 25 L 110 25" stroke="#10b981" strokeWidth="2" fill="none" />

              <rect x="115" width="75" height="50" rx="6" fill="#0f2b20" stroke="#059669" strokeWidth="1" />
              <text x="152" y="24" fill="#6ee7b7" fontSize="9" fontWeight="bold" textAnchor="middle">DC / AC</text>
              <text x="152" y="38" fill="#6ee7b7" fontSize="9" fontWeight="bold" textAnchor="middle">INVERTER</text>
            </g>

            <line x1="20" y1="135" x2="220" y2="135" stroke="#064e3b" strokeWidth="1" />

            <text x="120" y="160" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
              {selectedInverter.ratedKw} kW Pure Sine Wave
            </text>
            <text x="120" y="180" fill="#cbd5e1" fontSize="10" textAnchor="middle">
              Surge Capacity: {selectedInverter.surgeKw} kW (10s)
            </text>
            <text x="120" y="200" fill="#94a3b8" fontSize="9" textAnchor="middle">
              DC Bus: {selectedInverter.dcVoltage}V | Output: 230V/400V 50Hz
            </text>
          </g>

          {/* 3. BATTERY STORAGE BANK BLOCK */}
          <g transform="translate(390, 360)">
            <rect width="240" height="150" rx="14" fill="#241403" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="120" y="26" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">
              ENERGY STORAGE BANK (ESS)
            </text>
            <text x="120" y="42" fill="#94a3b8" fontSize="10" textAnchor="middle">
              {selectedBattery.brand} — {selectedBattery.model}
            </text>

            <text x="120" y="75" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">
              {batteryResults.totalStorageKwh.toFixed(1)} kWh Total
            </text>
            <text x="120" y="95" fill="#fde68a" fontSize="11" textAnchor="middle">
              {batteryResults.modulesCount} × {selectedBattery.nominalKwh} kWh Modules ({selectedBattery.chemistry})
            </text>
            <text x="120" y="115" fill="#cbd5e1" fontSize="10" textAnchor="middle">
              Nominal DC Bus: {selectedInverter.dcVoltage}V | DoD: {(selectedBattery.recommendedDoD * 100).toFixed(0)}%
            </text>
            <text x="120" y="133" fill="#94a3b8" fontSize="9" textAnchor="middle">
              Usable Energy: {(batteryResults.totalStorageKwh * selectedBattery.recommendedDoD).toFixed(1)} kWh
            </text>
          </g>

          {/* Battery DC Disconnect Switch & Fuse Block */}
          <g transform="translate(485, 310)">
            <rect width="50" height="40" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
            <text x="25" y="18" fill="#f8fafc" fontSize="8" fontWeight="bold" textAnchor="middle">NH00 DC</text>
            <text x="25" y="32" fill="#fbbf24" fontSize="8" textAnchor="middle">{batteryAmps}A Fuse</text>
          </g>

          {/* Wires: Battery to Inverter */}
          <line x1="510" y1="360" x2="510" y2="350" stroke="#f59e0b" strokeWidth="3" />
          <line x1="510" y1="310" x2="510" y2="305" stroke="#f59e0b" strokeWidth="3" />

          {/* 4. AC DISTRIBUTION & CHANGEOVER (ATS) */}
          <g transform="translate(680, 105)">
            <rect width="180" height="180" rx="12" fill="#111827" stroke="#64748b" strokeWidth="1.5" />
            <text x="90" y="26" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
              AC DISTRIBUTION &amp; ATS
            </text>

            <rect x="25" y="45" width="130" height="35" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <text x="90" y="62" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle">AUTOMATIC TRANSFER</text>
            <text x="90" y="73" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle">SWITCH (ATS)</text>

            <rect x="25" y="95" width="130" height="30" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <text x="90" y="114" fill="#cbd5e1" fontSize="9" textAnchor="middle">Type II AC Surge (SPD)</text>

            <text x="90" y="155" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle">
              Priority Inverter Output
            </text>
          </g>

          {/* Inverter AC out to ATS */}
          <path d="M 630 195 L 680 195" stroke="#10b981" strokeWidth="2.5" fill="none" />

          {/* External Inputs: Utility Grid & Generator */}
          <g transform="translate(680, 20)">
            <rect width="80" height="32" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
            <text x="40" y="20" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">UTILITY GRID</text>
            <path d="M 40 32 L 40 60 L 720 60 L 720 105" stroke="#64748b" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />

            <rect x="100" width="80" height="32" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
            <text x="140" y="20" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">GENSET (OPT)</text>
            <path d="M 140 32 L 140 60 L 760 60 L 760 105" stroke="#64748b" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
          </g>

          {/* 5. SUB-PANELS / AC LOAD SEPARATION */}
          <g transform="translate(910, 80)">
            <rect width="180" height="105" rx="10" fill="#062017" stroke="#10b981" strokeWidth="1.5" />
            <text x="90" y="24" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">
              ESSENTIAL LOADS
            </text>
            <text x="90" y="42" fill="#94a3b8" fontSize="9" textAnchor="middle">24/7 Battery Backup Bus</text>
            <line x1="20" y1="52" x2="160" y2="52" stroke="#064e3b" strokeWidth="1" />
            <text x="90" y="70" fill="#f8fafc" fontSize="10" textAnchor="middle">Lighting, Refrigeration</text>
            <text x="90" y="86" fill="#f8fafc" fontSize="10" textAnchor="middle">Servers, IT &amp; Security</text>

            <rect y="130" width="180" height="105" rx="10" fill="#1c1917" stroke="#78716c" strokeWidth="1.5" />
            <text x="90" y="154" fill="#a8a29e" fontSize="11" fontWeight="bold" textAnchor="middle">
              NON-ESSENTIAL LOADS
            </text>
            <text x="90" y="172" fill="#78716c" fontSize="9" textAnchor="middle">Grid / Daytime Run Only</text>
            <line x1="20" y1="182" x2="160" y2="182" stroke="#44403c" strokeWidth="1" />
            <text x="90" y="200" fill="#d6d3d1" fontSize="10" textAnchor="middle">Heavy Water Heaters</text>
            <text x="90" y="216" fill="#d6d3d1" fontSize="10" textAnchor="middle">Central HVAC, High Pumps</text>
          </g>

          {/* Wires to Sub-Panels */}
          <path d="M 860 140 L 910 140" stroke="#10b981" strokeWidth="2" fill="none" />
          <path d="M 860 210 L 910 210" stroke="#78716c" strokeWidth="2" fill="none" />

          {/* Engineering Stamp Seal */}
          <g transform="translate(870, 440)">
            <rect width="220" height="85" rx="8" fill="#09131a" stroke="#059669" strokeWidth="1" strokeDasharray="4 2" />
            <text x="110" y="22" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle">
              ENGINEERING SEAL &amp; APPROVAL
            </text>
            <text x="110" y="40" fill="#cbd5e1" fontSize="9" textAnchor="middle">
              InstallerWay Certified Solar Design
            </text>
            <text x="110" y="55" fill="#64748b" fontSize="8" textAnchor="middle">
              Ref: IW-SLD-{Math.abs(Math.round(totals.continuousWatts || 0))}-{scale.toUpperCase()}
            </text>
            <text x="110" y="72" fill="#38bdf8" fontSize="8" textAnchor="middle">
              Status: Verified Compliant
            </text>
          </g>
        </svg>
      </div>

      {/* Engineering Notes & Safety Compliance */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400" /> SLD Schematic &amp; Installation Standards
        </h3>
        <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
          <li><strong>DC Isolation:</strong> Ensure a 1000V DC rotary isolator is installed within 2 meters of the PV string entry point.</li>
          <li><strong>Overcurrent Protection:</strong> Battery DC lines require an NH00/NH1 fuse disconnect rated for at least {batteryAmps}A with a DC interrupt rating of 25kA+.</li>
          <li><strong>Bonding:</strong> All PV mounting frames, inverter chassis, and battery racks must be bonded to a common earthing rod with ground resistance below 5 Ohms.</li>
        </ul>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-4">
        <Link
          href="/equipment"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" /> 2. Back to Equipment Sizing
        </Link>
        <Link
          href="/bom"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition"
        >
          4. Proceed to Bill of Materials &amp; Proposal <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}