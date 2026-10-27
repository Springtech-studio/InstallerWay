"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSolarDesign } from "@/context/SolarDesignContext";
import jsPDF from "jspdf";
import { 
  Receipt, 
  FileDown, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Briefcase 
} from "lucide-react";

interface BomItem {
  id: string;
  category: "Primary Equipment" | "Balance of System (BOS)" | "Labor & Engineering";
  description: string;
  qty: number;
  unitCost: number;
}

export default function BillOfMaterialsPage() {
  const {
    scale,
    totals,
    selectedInverter,
    selectedBattery,
    selectedPanel,
    batteryResults,
    pvConfig
  } = useSolarDesign();

  const [currencySymbol, setCurrencySymbol] = useState<string>("₦");
  const [taxPercent, setTaxPercent] = useState<number>(7.5);
  const [clientName, setClientName] = useState<string>("Valued Client");
  const [projectTitle, setProjectTitle] = useState<string>(
    `${scale.toUpperCase()} Solar Hybrid Installation (${selectedInverter.ratedKw}kW / ${batteryResults.totalStorageKwh.toFixed(1)}kWh)`
  );

  const [items, setItems] = useState<BomItem[]>([
    {
      id: "1",
      category: "Primary Equipment",
      description: `${selectedInverter.brand} ${selectedInverter.model} (${selectedInverter.ratedKw}kW / ${selectedInverter.surgeKw}kW, ${selectedInverter.dcVoltage}V)`,
      qty: 1,
      unitCost: 0
    },
    {
      id: "2",
      category: "Primary Equipment",
      description: `${selectedBattery.brand} ${selectedBattery.model} (${selectedBattery.nominalKwh}kWh, ${selectedBattery.capacityAh}Ah @ ${selectedBattery.nominalVoltage}V, ${selectedBattery.chemistry})`,
      qty: batteryResults.modulesCount,
      unitCost: 0
    },
    {
      id: "3",
      category: "Primary Equipment",
      description: `${selectedPanel.brand} ${selectedPanel.model} (${selectedPanel.pMax}W ${selectedPanel.tech})`,
      qty: pvConfig.totalPanels,
      unitCost: 0
    },
    {
      id: "4",
      category: "Balance of System (BOS)",
      description: `Aluminum Railing, Mid/End Clamps & Roof Mount Kits (for ${pvConfig.totalPanels} modules)`,
      qty: pvConfig.totalPanels,
      unitCost: 0
    },
    {
      id: "5",
      category: "Balance of System (BOS)",
      description: "DC Combiner Box, 1000V DC Isolator, 600V/1000V Surge Protection (SPD) & MC4 Sets",
      qty: 1,
      unitCost: 0
    },
    {
      id: "6",
      category: "Balance of System (BOS)",
      description: `Battery NH00 Fuse Disconnect Switch & Heavy Gauge Copper Cables (${selectedInverter.dcVoltage}V DC Bus)`,
      qty: 1,
      unitCost: 0
    },
    {
      id: "7",
      category: "Balance of System (BOS)",
      description: "AC Distribution Box, Main Breakers, Changeover Switch (ATS) & Grounding Rod Kit",
      qty: 1,
      unitCost: 0
    },
    {
      id: "8",
      category: "Labor & Engineering",
      description: "Professional System Sizing, Electrical Installation, Rigging, Earthing & Commissioning",
      qty: 1,
      unitCost: 0
    }
  ]);

  const updateCost = (id: string, cost: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, unitCost: Math.max(0, cost) } : item)));
  };

  const updateQty = (id: string, qty: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, qty: Math.max(1, qty) } : item)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        category: "Balance of System (BOS)",
        description: "Additional Equipment / Component",
        qty: 1,
        unitCost: 0
      }
    ]);
  };

  const subtotal = items.reduce((acc, item) => acc + item.qty * item.unitCost, 0);
  const taxAmount = (subtotal * taxPercent) / 100;
  const grandTotal = subtotal + taxAmount;

  const generatePdfProposal = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header Banner
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, pageWidth, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("INSTALLERWAY", 14, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("ENGINEERING PROPOSAL & SYSTEM BILL OF MATERIALS", 14, 26);
    doc.text(`Ref: IW-${Date.now().toString().slice(-6)}`, pageWidth - 45, 18);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 45, 26);

    // 2. Client & Project Details
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PROJECT & CLIENT INFORMATION", 14, 46);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Client Name: ${clientName}`, 14, 53);
    doc.text(`Project Title: ${projectTitle}`, 14, 59);
    doc.text(`System Scale: ${scale.toUpperCase()}`, 14, 65);

    doc.text(`Peak Continuous Load: ${(totals.continuousWatts / 1000).toFixed(2)} kW`, 110, 53);
    doc.text(`Total Daily Energy: ${totals.totalDailyKwh.toFixed(2)} kWh/day`, 110, 59);
    doc.text(`Installed Array: ${pvConfig.actualKwp?.toFixed(2)} kWp (${pvConfig.totalPanels} Panels)`, 110, 65);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 70, pageWidth - 14, 70);

    // 3. Table Headers
    let yPos = 78;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, yPos - 5, pageWidth - 28, 8, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text("ITEM DESCRIPTION", 16, yPos);
    doc.text("QTY", 125, yPos);
    doc.text(`UNIT PRICE (${currencySymbol})`, 140, yPos);
    doc.text(`TOTAL (${currencySymbol})`, 175, yPos);

    yPos += 7;

    // 4. Line Items
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    items.forEach((item) => {
      const lineTotal = item.qty * item.unitCost;
      const descLines = doc.splitTextToSize(item.description, 105);
      const textHeight = descLines.length * 4.5;

      if (yPos + textHeight > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.text(descLines, 16, yPos);
      doc.text(String(item.qty), 127, yPos);
      doc.text(item.unitCost.toLocaleString(), 140, yPos);
      doc.text(lineTotal.toLocaleString(), 175, yPos);

      yPos += textHeight + 2;
      doc.setDrawColor(241, 245, 249);
      doc.line(14, yPos - 2, pageWidth - 14, yPos - 2);
    });

    // 5. Total Calculations Block
    yPos += 5;
    if (yPos > 240) {
      doc.addPage();
      yPos = 30;
    }

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(pageWidth - 95, yPos, 81, 28, 2, 2, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", pageWidth - 90, yPos + 7);
    doc.text(`${currencySymbol} ${subtotal.toLocaleString()}`, pageWidth - 20, yPos + 7, { align: "right" });

    doc.text(`Tax (${taxPercent}%):`, pageWidth - 90, yPos + 14);
    doc.text(`${currencySymbol} ${taxAmount.toLocaleString()}`, pageWidth - 20, yPos + 14, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(5, 150, 105);
    doc.text("Grand Total:", pageWidth - 90, yPos + 23);
    doc.text(`${currencySymbol} ${grandTotal.toLocaleString()}`, pageWidth - 20, yPos + 23, { align: "right" });

    // 6. Signature Block
    yPos += 45;
    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    }

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("ENGINEERING CERTIFICATION & TENDER ACCEPTANCE", 14, yPos);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Prepared by InstallerWay Certified Solar Engineering System.", 14, yPos + 5);
    doc.text("Quotation is valid for 14 calendar days from date of issuance.", 14, yPos + 10);

    doc.setDrawColor(203, 213, 225);
    doc.line(14, yPos + 25, 80, yPos + 25);
    doc.text("Client Authorized Signature", 14, yPos + 30);

    doc.line(pageWidth - 80, yPos + 25, pageWidth - 14, yPos + 25);
    doc.text("Engineer Signature & Seal", pageWidth - 80, yPos + 30);

    doc.save(`InstallerWay_Proposal_${clientName.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/40">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" /> Step 4: Costing & Procurement
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Bill of Materials & Proposal Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Strictly user-defined item pricing with dynamic subtotals and one-click PDF export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={generatePdfProposal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/40"
          >
            <FileDown className="w-4 h-4" /> Export PDF Proposal
          </button>
          <Link
            href="/portfolio"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-white text-xs font-bold transition"
          >
            <Briefcase className="w-4 h-4 text-emerald-400" /> Go to Portfolio
          </Link>
        </div>
      </div>

      {/* Proposal Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs">
        <div>
          <label className="text-slate-400 block mb-1">Client / Company Name</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-slate-400 block mb-1">Project Proposal Title</label>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
          />
        </div>
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="text-slate-400 block mb-1">Currency</label>
            <select
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
            >
              <option value="₦">₦ (NGN)</option>
              <option value="$">$ (USD)</option>
              <option value="€">€ (EUR)</option>
              <option value="£">£ (GBP)</option>
              <option value="R">R (ZAR)</option>
              <option value="A$">A$ (AUD)</option>
            </select>
          </div>
          <div className="w-1/2">
            <label className="text-slate-400 block mb-1">Tax / VAT (%)</label>
            <input
              type="number"
              value={taxPercent}
              onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-right"
            />
          </div>
        </div>
      </div>

      {/* BOM Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            Component Cost Breakdown (Enter Unit Prices)
          </h2>
          <button
            onClick={addItem}
            className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Line Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Component Description</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price ({currencySymbol})</th>
                <th className="py-3 px-4 text-right">Total Price ({currencySymbol})</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-semibold">{item.description}</td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                      className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center text-white"
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={item.unitCost === 0 ? "" : item.unitCost}
                      onChange={(e) => updateCost(item.id, parseFloat(e.target.value) || 0)}
                      className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right text-emerald-400 font-bold focus:border-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-white">
                    {(item.qty * item.unitCost).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => removeItem(item.id)}
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

        {/* Financial Summary */}
        <div className="p-5 bg-slate-950/80 border-t border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-xs text-slate-400">
            All prices are customizable and save automatically to this proposal session.
          </div>

          <div className="w-full md:w-72 space-y-1.5 text-xs text-right">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-semibold text-white">{currencySymbol} {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tax / VAT ({taxPercent}%):</span>
              <span className="font-semibold text-white">{currencySymbol} {taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-emerald-400 border-t border-slate-800 pt-1.5">
              <span>Grand Total:</span>
              <span>{currencySymbol} {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Link
          href="/sld"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" /> 3. Back to SLD Diagram
        </Link>
        <Link
          href="/portfolio"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition"
        >
          5. View Portfolio & Earn Badges
        </Link>
      </div>
    </div>
  );
}