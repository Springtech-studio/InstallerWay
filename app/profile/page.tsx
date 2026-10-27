"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  UserCheck, 
  ShieldCheck, 
  Award, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileCheck, 
  Save, 
  CheckCircle2, 
  ArrowLeft,
  Sliders,
  Sparkles
} from "lucide-react";

interface EngineerProfile {
  fullName: string;
  firmName: string;
  licenseNumber: string;
  accreditationBody: string; // e.g. COREN, NEMSA, NABCEP, IEEE
  email: string;
  phone: string;
  officeAddress: string;
  defaultSafetyMargin: number; // percentage
  defaultTempDerate: number;   // percentage
}

const DEFAULT_PROFILE: EngineerProfile = {
  fullName: "Engr. Lead Installer",
  firmName: "InstallerWay Engineering Services",
  licenseNumber: "ENG/NEMSA/2026/8492",
  accreditationBody: "COREN / NEMSA Certified",
  email: "engineering@installerway.com",
  phone: "+234 800 000 0000",
  officeAddress: "Victoria Island, Lagos, Nigeria",
  defaultSafetyMargin: 25,
  defaultTempDerate: 95
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<EngineerProfile>(DEFAULT_PROFILE);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Load persisted profile on mount
  useEffect(() => {
    const saved = localStorage.getItem("installerway_engineer_profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load profile:", e);
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("installerway_engineer_profile", JSON.stringify(profile));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/40">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" /> Engineer Credentials &amp; Standards
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Practicing Engineer Profile &amp; Seal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure your professional licensing, digital engineering seal, and default sizing safety bounds.
          </p>
        </div>

        <Link
          href="/portfolio"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition self-start md:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Portfolio
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLS: Profile & Safety Margin Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Primary Details Box */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-3">
                <FileCheck className="w-4 h-4 text-emerald-400" /> Professional Credentials
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Lead Engineer / Designer Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Company / EPC Firm Name</label>
                  <input
                    type="text"
                    value={profile.firmName}
                    onChange={(e) => setProfile({ ...profile, firmName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">License / Registration Number</label>
                  <input
                    type="text"
                    value={profile.licenseNumber}
                    onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:border-emerald-500"
                    placeholder="e.g. NEMSA/SOL/2026/0491"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Accreditation Body / Certification</label>
                  <input
                    type="text"
                    value={profile.accreditationBody}
                    onChange={(e) => setProfile({ ...profile, accreditationBody: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500"
                    placeholder="e.g. COREN Registered / NEMSA Certified"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Official Contact Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Phone Number</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-400 block mb-1 font-medium">Corporate / Workshop Address</label>
                  <input
                    type="text"
                    value={profile.officeAddress}
                    onChange={(e) => setProfile({ ...profile, officeAddress: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Design Rules & Safety Headroom Controls */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-3">
                <Sliders className="w-4 h-4 text-emerald-400" /> Default Engineering Safety Margins
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-slate-300">Continuous Inverter Sizing Headroom:</span>
                    <span className="text-emerald-400 font-bold">+{profile.defaultSafetyMargin}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    step="5"
                    value={profile.defaultSafetyMargin}
                    onChange={(e) => setProfile({ ...profile, defaultSafetyMargin: parseInt(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <span className="text-[10px] text-slate-500">
                    Recommended 20–25% cushion above continuous audited wattage.
                  </span>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-slate-300">Battery Temperature & Aging Derating Factor:</span>
                    <span className="text-emerald-400 font-bold">{profile.defaultTempDerate}%</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="100"
                    step="1"
                    value={profile.defaultTempDerate}
                    onChange={(e) => setProfile({ ...profile, defaultTempDerate: parseInt(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <span className="text-[10px] text-slate-500">
                    Accounts for high ambient battery room temperatures and cyclic cell degradation.
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition"
              >
                <Save className="w-4 h-4" /> Save Engineer Profile
              </button>
              {savedSuccess && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-pulse">
                  <CheckCircle2 className="w-4 h-4" /> Profile saved successfully!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT COL: Live Digital Engineering Seal Preview */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center space-y-4 shadow-xl">
            <div className="flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-4 h-4 text-amber-400" /> Digital Certification Stamp
            </div>
            <p className="text-[11px] text-slate-400">
              This official watermark is automatically stamped onto all generated Single Line Diagrams (SLD) and exported tender proposals.
            </p>

            {/* Rendered Digital Seal Badge */}
            <div className="p-6 bg-slate-950 border-2 border-dashed border-emerald-500/50 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center space-y-2">
              <div className="w-14 h-14 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-emerald-950/40 text-emerald-400 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="text-sm font-black text-white tracking-wide uppercase mt-1">
                {profile.fullName || "Certified Engineer"}
              </div>

              <div className="text-[11px] font-semibold text-emerald-400">
                {profile.firmName || "Engineering Practice"}
              </div>

              <div className="text-[10px] font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                REG: {profile.licenseNumber || "NEMSA/PENDING"}
              </div>

              <div className="text-[9px] text-slate-400 pt-2 border-t border-slate-800 w-full text-center">
                {profile.accreditationBody}
              </div>

              <div className="text-[8px] text-slate-400 uppercase tracking-widest">
                VERIFIED SOLAR DESIGN SYSTEM
              </div>
            </div>
          </div>

          {/* Quick Contact Overview */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-400" /> Corporate Information
            </h3>
            <div className="text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-200">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-200">{profile.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-200">{profile.officeAddress}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}