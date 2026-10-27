import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let userQuestion = "";
  let systemTelemetry: any = null;

  try {
    const body = await request.json();
    const { messages, systemTelemetry: tel } = body;
    systemTelemetry = tel;
    userQuestion = messages[messages.length - 1]?.text || "";

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // If no API key is present in .env.local, use the engineering rule base immediately
    if (!apiKey) {
      const fallbackReply = generateEngineeringFallback(userQuestion, systemTelemetry);
      return NextResponse.json({ reply: fallbackReply });
    }

    const systemInstruction = `You are the InstallerWay Chief Solar Engineering Copilot, an expert in photovoltaic systems, off-grid storage, mini-grids, and electrical standards (IEC 60364-7-712, NEC 690, IEEE 1547).

You give precise, mathematically sound, practical engineering answers with zero fluff. When appropriate, provide concise formulas, cable sizing rules, safety factors, breaker ratings, or standards references.

CURRENT PROJECT LIVE TELEMETRY:
- Installation Scale: ${systemTelemetry?.scale || "residential"}
- Continuous Running Demand: ${((systemTelemetry?.totals?.continuousWatts || 0) / 1000).toFixed(2)} kW
- Peak Inductive Surge: ${((systemTelemetry?.totals?.peakSurgeWatts || 0) / 1000).toFixed(2)} kW
- Total Daily Energy: ${systemTelemetry?.totals?.totalDailyKwh?.toFixed(2) || "0.00"} kWh/day (Day: ${systemTelemetry?.totals?.dayKwh?.toFixed(1) || "0.0"} kWh | Night: ${systemTelemetry?.totals?.nightKwh?.toFixed(1) || "0.0"} kWh)
- Selected Inverter: ${systemTelemetry?.selectedInverter?.brand || "Hybrid"} ${systemTelemetry?.selectedInverter?.model || ""} (${systemTelemetry?.selectedInverter?.ratedKw || 5} kW Continuous, ${systemTelemetry?.selectedInverter?.surgeKw || 10} kW Surge, ${systemTelemetry?.selectedInverter?.dcVoltage || 48}V DC Bus, MPPT Window: ${systemTelemetry?.selectedInverter?.mpptMinV || 125}V-${systemTelemetry?.selectedInverter?.mpptMaxV || 500}V, Max Voc: ${systemTelemetry?.selectedInverter?.maxVoc || 500}V)
- Selected Battery Bank: ${systemTelemetry?.batteryResults?.modulesCount || 1}x ${systemTelemetry?.selectedBattery?.brand || "Battery"} (${systemTelemetry?.batteryResults?.totalStorageKwh?.toFixed(1) || "5.0"} kWh Total, ${systemTelemetry?.selectedBattery?.chemistry || "LiFePO4"})
- PV Array: ${systemTelemetry?.pvConfig?.actualKwp?.toFixed(2) || "0.00"} kWp (${systemTelemetry?.pvConfig?.totalPanels || 0} panels)
- PV String Voltages: Cold Voc = ${systemTelemetry?.pvConfig?.stringVocCold?.toFixed(1) || "0"}V | Hot Vmp = ${systemTelemetry?.pvConfig?.stringVmpHot?.toFixed(1) || "0"}V (MPPT Compliant: ${systemTelemetry?.pvConfig?.isCompliant ? "YES" : "NO"})
- Site Solar Resource: ${systemTelemetry?.peakSunHours || 5.2} Peak Sun Hours (PSH)

Whenever the user asks about their system, calculate answers using the above live telemetry. If they ask general questions (e.g. cable sizing, generator integration, grounding rod depth, battery degradation, tilt angle, cloud edge effect), provide authoritative engineering advice.`;

    // Format chat turns for Gemini generateContent
    const contents = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    // Standard Gemini 1.5 Flash endpoint
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: contents
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Gemini API call failed, falling back to local engine:", response.status, errText);
      // Auto-fallback so the user is never stranded with an error
      const fallbackReply = generateEngineeringFallback(userQuestion, systemTelemetry);
      return NextResponse.json({ reply: fallbackReply });
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      const fallbackReply = generateEngineeringFallback(userQuestion, systemTelemetry);
      return NextResponse.json({ reply: fallbackReply });
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error("Copilot Handler Exception:", error);
    // Automatic fallback if network times out or fetch fails
    const fallbackReply = generateEngineeringFallback(userQuestion, systemTelemetry);
    return NextResponse.json({ reply: fallbackReply });
  }
}

// Built-in electrical & solar engineering knowledge engine
function generateEngineeringFallback(question: string, tel: any): string {
  const q = (question || "").toLowerCase();
  const inverterKw = tel?.selectedInverter?.ratedKw || 5;
  const dcVoltage = tel?.selectedInverter?.dcVoltage || 48;
  const storageKwh = tel?.batteryResults?.totalStorageKwh?.toFixed(1) || "14.4";
  const pvKwp = tel?.pvConfig?.actualKwp?.toFixed(2) || "4.6";
  const coldVoc = tel?.pvConfig?.stringVocCold?.toFixed(1) || "420";
  const maxVoc = tel?.selectedInverter?.maxVoc || 500;

  if (q.includes("cloud") || q.includes("edge") || q.includes("albedo") || q.includes("effect")) {
    return `⚡ Cloud-Edge (Edge-of-Cloud) Effect Analysis:
1. Irradiance Spike: When sunlight refracts through moving cumulus cloud fringes, global horizontal irradiance can momentarily surge from 1,000 W/m² up to 1,300–1,500 W/m² (a 30–50% spike).
2. Impact on Current (Isc): Short-circuit current jumps almost linearly with irradiance. Inverter MPPT controllers must have sufficient maximum DC input current headroom to avoid clipping or input tripping.
3. Impact on Voltage (Voc): Voltage increases logarithmically with irradiance (minor increase of 2–5%), but when combined with rapid sub-zero cold ambient air following a passing storm, your string cold Voc can easily spike beyond the ${maxVoc}V inverter threshold.
4. Engineering Mitigation: Always maintain at least a 10–15% buffer between your coldest calculated string Voc (${coldVoc}V) and the inverter absolute max rating (${maxVoc}V).`;
  }

  if (q.includes("cable") || q.includes("wire") || q.includes("gauge") || q.includes("fuse") || q.includes("bus")) {
    const dcBusAmps = Math.round(((inverterKw * 1000) / dcVoltage) * 1.25);
    return `⚡ Cable Sizing & Protection Breakdown (NEC 690 / IEC 60364):
1. Battery DC Bus (${dcVoltage}V):
   - Maximum Continuous Inverter Current: ~${Math.round((inverterKw * 1000) / dcVoltage)}A.
   - Design Ampacity (125% continuous duty factor): ${dcBusAmps}A.
   - Recommended Conductor: 50mm² – 70mm² flexible double-insulated copper welding/battery cable.
   - Overcurrent Protection: ${dcBusAmps >= 200 ? "250A" : "160A – 200A"} NH00 DC fuse disconnect with minimum 25kA interrupt capacity.
2. Solar PV DC Strings:
   - Size conductors for 1.56 × Isc (1.25 continuous factor × 1.25 irradiance surge factor).
   - Recommended Conductor: 4mm² or 6mm² TÜV/UL certified solar cable (H1Z2Z2-K) with 1000V/1500V DC insulation.
   - String Overcurrent Protection: 15A – 20A gPV cylindrical fuses on both positive and negative lines.`;
  }

  if (q.includes("generator") || q.includes("genset") || q.includes("ats")) {
    const minGensetKva = (inverterKw * 1.5).toFixed(1);
    return `⚡ Generator Sizing & Synchronization Rules:
1. Sizing Requirement: Minimum genset capacity should be 1.5× to 2.0× your inverter continuous rating (~${minGensetKva} kVA minimum for your ${inverterKw}kW unit).
2. Rationale: When the generator starts, it must simultaneously supply active household loads while providing up to ${Math.round(inverterKw * 0.6)}kW to charge the ${storageKwh}kWh battery bank without dropping AC frequency below 48Hz or above 52Hz.
3. ATS Delay: Set an automatic transfer switch (ATS) warm-up delay of 30–60 seconds before applying inverter load to ensure engine stabilization.`;
  }

  if (q.includes("earth") || q.includes("ground") || q.includes("spd") || q.includes("lightning")) {
    return `⚡ Earthing & Surge Protection Standards (IEC 62305 & IEC 60364-7-712):
1. Ground Impedance: Measured loop impedance must be strictly < 5 Ohms using copper-clad steel earth rods (minimum 2.4m depth).
2. DC Surge Protection: Class II (Type 2) 1000V DC SPD installed at the DC combiner box within 2 meters of inverter entry.
3. AC Surge Protection: Class II Type 2 AC SPD (275V/440V) installed immediately downstream of the inverter AC output breaker.
4. Equipotential Bonding: Bond all aluminum solar rails, inverter casing, and battery frames using green/yellow 16mm² multi-strand copper earth conductors.`;
  }

  if (q.includes("mppt") || q.includes("voc") || q.includes("string") || q.includes("boundary")) {
    return `⚡ MPPT String Boundary Audit:
- Coldest String Voc: ${coldVoc}V (Inverter Max: ${maxVoc}V) → ${Number(coldVoc) < maxVoc ? "✅ SAFE (Within breakdown limit)" : "⚠️ WARNING: Exceeds inverter limit!"}
- Total Installed Array: ${pvKwp} kWp.
- Temperature Coefficient Warning: Silicon PV cells increase voltage by ~0.3%/°C below 25°C STC. Ensure string sizing accounts for local morning record cold.`;
  }

  return `⚡ System Engineering Telemetry:
- Operating Inverter: ${inverterKw} kW on ${dcVoltage}V DC Bus.
- Active Running Load: ${((tel?.totals?.continuousWatts || 0) / 1000).toFixed(2)} kW (Surge Capacity: ${((tel?.totals?.peakSurgeWatts || 0) / 1000).toFixed(2)} kW).
- Array Capacity: ${pvKwp} kWp across ${tel?.pvConfig?.totalPanels || 0} panels.
- Storage Bank: ${storageKwh} kWh total (${tel?.autonomyDays || 1} day autonomy).

You can ask about cable sizing, generator matching, earthing impedance, MPPT boundaries, or cloud edge effects.`;
}