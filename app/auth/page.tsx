"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInAnonymously
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Zap
} from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [licenseNumber, setLicenseNumber] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Register new engineer
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create initial engineer record in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          fullName: fullName || "Practicing Solar Engineer",
          licenseNumber: licenseNumber || "NEMSA/PENDING",
          createdAt: serverTimestamp(),
          completedProjects: 0,
          totalKwp: 0,
          totalKwh: 0
        });

        // Also persist locally for the Profile screen
        localStorage.setItem("installerway_engineer_profile", JSON.stringify({
          fullName: fullName || "Practicing Solar Engineer",
          firmName: "InstallerWay Engineering Practice",
          licenseNumber: licenseNumber || "NEMSA/PENDING",
          accreditationBody: "COREN / NEMSA Certified",
          email: user.email,
          phone: "",
          officeAddress: "",
          defaultSafetyMargin: 25,
          defaultTempDerate: 95
        }));

      } else {
        // Sign in existing engineer
        await signInWithEmailAndPassword(auth, email, password);
      }

      router.push("/auditor");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestDemo = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      router.push("/auditor");
    } catch (err: any) {
      // If Firebase anonymous sign-in is disabled in console, still allow local offline demo
      router.push("/auditor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-emerald-600 items-center justify-center font-black text-white shadow-lg shadow-emerald-500/20 mb-3">
            IW
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Installer<span className="text-emerald-400">Way</span> Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isSignUp ? "Register your engineering credentials" : "Sign in to access your portfolio & designs"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isSignUp && (
            <>
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Full Name / Engineer Title</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Engr. Emmanuel Ayegun"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">License / NEMSA / COREN ID</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. NEMSA/SOL/2026/8941"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-emerald-400 font-mono font-bold focus:border-emerald-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder="engineer@installerway.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:border-emerald-500"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 disabled:opacity-50"
          >
            {loading ? (
              "Authenticating..."
            ) : isSignUp ? (
              <>Create Certified Account <ArrowRight className="w-4 h-4" /></>
            ) : (
              <>Sign In to Workspace <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        {/* Toggle Sign Up / Login */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {isSignUp ? "Already have an engineering account?" : "Need a professional installer account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg("");
            }}
            className="text-emerald-400 font-bold hover:underline"
          >
            {isSignUp ? "Sign In" : "Register Now"}
          </button>
        </div>

        {/* Quick Demo Access */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <button
            onClick={handleGuestDemo}
            className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Continue as Guest Engineer (Offline Mode)
          </button>
        </div>
      </div>
    </div>
  );
}