"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSolarDesign } from "@/context/SolarDesignContext";
import { 
  Bot, 
  X, 
  Sparkles, 
  Send, 
  Loader2,
  HelpCircle,
  Zap,
  Cable,
  Flame,
  Sun,
  ShieldAlert
} from "lucide-react";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export default function AICopilot() {
  const designData = useSolarDesign();
  const {
    scale,
    totals,
    targetKwp,
    selectedInverter,
    selectedBattery,
    selectedPanel,
    pvConfig,
    batteryResults,
    peakSunHours,
    autonomyDays
  } = designData;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [userQuery, setUserQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: `Hello! I am your InstallerWay Engineering Copilot. I'm actively monitoring your ${scale.toUpperCase()} design (${(totals.continuousWatts / 1000).toFixed(2)} kW load, ${selectedInverter.ratedKw} kW inverter, ${batteryResults.totalStorageKwh.toFixed(1)} kWh ESS). Ask me any technical question about cable sizing, generator matching, IEC/NEC standards, or array performance.`
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const askCopilot = async (questionText: string) => {
    if (!questionText.trim() || loading) return;

    const userMsg: ChatMessage = { sender: "user", text: questionText.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setUserQuery("");
    setLoading(true);

    try {
      // Package live design state into telemetry
      const systemTelemetry = {
        scale,
        totals,
        targetKwp,
        selectedInverter,
        selectedBattery,
        selectedPanel,
        pvConfig,
        batteryResults,
        peakSunHours,
        autonomyDays
      };

      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          systemTelemetry
        })
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Communication error. Check your connection or terminal logs." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    askCopilot(userQuery);
  };

  const quickPrompts = [
    { label: "Cable Sizing", query: "What cable gauge and fuse rating do I need for my battery bus and PV strings?" },
    { label: "Genset Pairing", query: "What kVA generator is recommended to sync with this inverter and charge the bank?" },
    { label: "Earthing & SPDs", query: "What are the IEC earthing and surge protection requirements for this site?" },
    { label: "MPPT Safety", query: "Review my cold Voc and hot Vmp string boundaries against inverter limits." }
  ];

  return (
    <>
     {/* Floating Action Button - Compact & Non-Obtrusive */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Open Engineering Copilot"
        className="fixed bottom-4 right-4 z-40 group flex items-center gap-2 p-2.5 sm:px-3 sm:py-2 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-950/50 backdrop-blur border border-emerald-400/30 transition-all duration-200 hover:scale-105"
      >
        <Bot className="w-4 h-4 text-emerald-100 shrink-0" />
        <span className="text-[11px] hidden group-hover:inline transition-all whitespace-nowrap pr-1">
          Copilot
        </span>
      </button>

      {/* Floating AI Interface Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[94vw] sm:w-[440px] h-[580px] max-h-[85vh] z-50 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  InstallerWay Engineering Copilot
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-emerald-500/30">
                    LIVE
                  </span>
                </h3>
                <span className="text-[10px] text-slate-400">
                  Tracking {selectedInverter.brand} {selectedInverter.ratedKw}kW &bull; {pvConfig.actualKwp?.toFixed(1)}kWp PV
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Real-Time Telemetry Bar */}
          <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Load: <strong className="text-slate-200">{(totals.continuousWatts / 1000).toFixed(1)}kW</strong></span>
            <span>Surge: <strong className="text-amber-400">{(totals.peakSurgeWatts / 1000).toFixed(1)}kW</strong></span>
            <span>Bank: <strong className="text-blue-400">{batteryResults.totalStorageKwh.toFixed(1)}kWh</strong></span>
            <span className={pvConfig.isCompliant ? "text-emerald-400" : "text-amber-400 font-bold"}>
              {pvConfig.isCompliant ? "MPPT OK" : "VOC WARN"}
            </span>
          </div>

          {/* Chat Messages Viewport */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto text-xs leading-relaxed">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl whitespace-pre-line ${
                  m.sender === "ai"
                    ? "bg-slate-950/90 text-slate-200 border border-slate-800 mr-5"
                    : "bg-emerald-600 text-white ml-8 font-medium shadow-md"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="p-3 rounded-2xl bg-slate-950/90 text-emerald-400 border border-slate-800 mr-8 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[11px]">Computing engineering calculations...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Queries */}
          <div className="px-3 py-2 bg-slate-950/40 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto scrollbar-none">
            {quickPrompts.map((btn, i) => (
              <button
                key={i}
                type="button"
                onClick={() => askCopilot(btn.query)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 border border-slate-700/60 transition"
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleFormSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask any solar/electrical question..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !userQuery.trim()}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition flex-shrink-0 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}