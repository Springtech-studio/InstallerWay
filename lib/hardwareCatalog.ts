export interface InverterSpec {
  id: string;
  brand: string;
  model: string;
  ratedKw: number;
  surgeKw: number;
  dcVoltage: number; // e.g. 24, 48
  type: "Hybrid" | "External MPPT" | "Grid-Tied";
  mpptMinV: number;
  mpptMaxV: number;
  maxVoc: number;
  mpptTrackers: number;
  maxAmpsPerMppt: number;
}

export interface BatterySpec {
  id: string;
  brand: string;
  model: string;
  chemistry: "LiFePO4" | "Tubular Deep Cycle" | "AGM / Gel" | "Lead-Carbon";
  nominalVoltage: number;
  capacityAh: number;
  nominalKwh: number;
  recommendedDoD: number; // 0.0 - 1.0 (e.g. 0.9 for 90%)
  maxContinuousC: number;
  surgeC: number;
}

export interface SolarPanelSpec {
  id: string;
  brand: string;
  model: string;
  pMax: number; // Watts
  vMp: number;  // Volts
  iMp: number;  // Amps
  vOc: number;  // Volts
  iSc: number;  // Amps
  tempCoeffVoc: number; // %/°C (e.g. -0.28)
  tech: "N-Type TOPCon" | "Mono PERC" | "Bifacial" | "Heterojunction (HJT)";
}

// 1. INVERTERS (Catalog sample - expandable to all 33 brands)
export const INVERTER_CATALOG: InverterSpec[] = [
  { id: "deye-5k", brand: "Deye", model: "SUN-5K-SG03LP1", ratedKw: 5.0, surgeKw: 10.0, dcVoltage: 48, type: "Hybrid", mpptMinV: 125, mpptMaxV: 425, maxVoc: 500, mpptTrackers: 2, maxAmpsPerMppt: 13 },
  { id: "deye-8k", brand: "Deye", model: "SUN-8K-SG01LP1", ratedKw: 8.0, surgeKw: 16.0, dcVoltage: 48, type: "Hybrid", mpptMinV: 125, mpptMaxV: 425, maxVoc: 500, mpptTrackers: 2, maxAmpsPerMppt: 22 },
  { id: "deye-12k", brand: "Deye", model: "SUN-12K-SG04LP3", ratedKw: 12.0, surgeKw: 24.0, dcVoltage: 48, type: "Hybrid", mpptMinV: 200, mpptMaxV: 650, maxVoc: 800, mpptTrackers: 2, maxAmpsPerMppt: 26 },
  { id: "victron-multi-5k", brand: "Victron Energy", model: "MultiPlus-II 48/5000", ratedKw: 4.0, surgeKw: 9.0, dcVoltage: 48, type: "External MPPT", mpptMinV: 0, mpptMaxV: 0, maxVoc: 0, mpptTrackers: 0, maxAmpsPerMppt: 0 },
  { id: "victron-rs-6k", brand: "Victron Energy", model: "Inverter RS 48/6000 Smart Solar", ratedKw: 6.0, surgeKw: 9.0, dcVoltage: 48, type: "Hybrid", mpptMinV: 80, mpptMaxV: 450, maxVoc: 450, mpptTrackers: 1, maxAmpsPerMppt: 18 },
  { id: "growatt-spf-5000es", brand: "Growatt", model: "SPF 5000 ES", ratedKw: 5.0, surgeKw: 10.0, dcVoltage: 48, type: "Hybrid", mpptMinV: 120, mpptMaxV: 430, maxVoc: 450, mpptTrackers: 1, maxAmpsPerMppt: 18 },
  { id: "felicity-ivem-5k", brand: "Felicity Solar", model: "IVEM5048", ratedKw: 5.0, surgeKw: 10.0, dcVoltage: 48, type: "Hybrid", mpptMinV: 120, mpptMaxV: 450, maxVoc: 500, mpptTrackers: 1, maxAmpsPerMppt: 18 },
  { id: "felicity-flx-10k", brand: "Felicity Solar", model: "FLX-10K", ratedKw: 10.0, surgeKw: 15.0, dcVoltage: 48, type: "Hybrid", mpptMinV: 150, mpptMaxV: 450, maxVoc: 500, mpptTrackers: 2, maxAmpsPerMppt: 22 },
  { id: "sunsynk-8k", brand: "Sunsynk", model: "SUN-8K-SG01LP1", ratedKw: 8.0, surgeKw: 16.0, dcVoltage: 48, type: "Hybrid", mpptMinV: 125, mpptMaxV: 425, maxVoc: 500, mpptTrackers: 2, maxAmpsPerMppt: 22 },
  { id: "huawei-sun2000-10ktl", brand: "Huawei", model: "SUN2000-10KTL-M1", ratedKw: 10.0, surgeKw: 15.0, dcVoltage: 48, type: "Hybrid", mpptMinV: 140, mpptMaxV: 980, maxVoc: 1100, mpptTrackers: 2, maxAmpsPerMppt: 13.5 },
  { id: "srne-hfp-5k", brand: "SRNE", model: "HF4850S80-145", ratedKw: 5.0, surgeKw: 10.0, dcVoltage: 48, type: "Hybrid", mpptMinV: 60, mpptMaxV: 130, maxVoc: 145, mpptTrackers: 1, maxAmpsPerMppt: 80 },
  { id: "must-pv18-5k", brand: "MUST Power", model: "PV18-5048 VHM", ratedKw: 5.0, surgeKw: 10.0, dcVoltage: 48, type: "Hybrid", mpptMinV: 60, mpptMaxV: 130, maxVoc: 145, mpptTrackers: 1, maxAmpsPerMppt: 80 },
  { id: "schneider-xw-pro", brand: "Schneider Electric", model: "XW Pro 6848", ratedKw: 6.8, surgeKw: 12.0, dcVoltage: 48, type: "External MPPT", mpptMinV: 0, mpptMaxV: 0, maxVoc: 0, mpptTrackers: 0, maxAmpsPerMppt: 0 }
  // Additional brands (Techfine, App Solar, GoodWe, Solis, Luxsun, Afore, Phocos, Luxwatt, Voltronic, Luminous, Mercury, PRAG, Su-Kam, Maxpower, Bluegate, Genus, Sako, C-Worth, Nexus, Fireman, Sumry, Itel) map directly to this schema
];

// 2. BATTERIES (Catalog sample - expandable to all 31 brands)
export const BATTERY_CATALOG: BatterySpec[] = [
  { id: "pylontech-us5000", brand: "Pylontech", model: "US5000", chemistry: "LiFePO4", nominalVoltage: 48, capacityAh: 100, nominalKwh: 4.8, recommendedDoD: 0.95, maxContinuousC: 0.5, surgeC: 1.0 },
  { id: "felicity-lpbf-48100", brand: "Felicity Solar", model: "LPBF48100", chemistry: "LiFePO4", nominalVoltage: 48, capacityAh: 100, nominalKwh: 5.0, recommendedDoD: 0.90, maxContinuousC: 0.5, surgeC: 1.0 },
  { id: "felicity-lpba-48200", brand: "Felicity Solar", model: "LPBA48200-OL", chemistry: "LiFePO4", nominalVoltage: 48, capacityAh: 200, nominalKwh: 10.0, recommendedDoD: 0.90, maxContinuousC: 0.5, surgeC: 0.8 },
  { id: "byd-b-box-hvs", brand: "BYD", model: "Battery-Box Premium HVS", chemistry: "LiFePO4", nominalVoltage: 51.2, capacityAh: 102, nominalKwh: 5.1, recommendedDoD: 0.95, maxContinuousC: 0.8, surgeC: 1.0 },
  { id: "deye-se-g51", brand: "Deye", model: "SE-G5.1 Pro", chemistry: "LiFePO4", nominalVoltage: 51.2, capacityAh: 100, nominalKwh: 5.12, recommendedDoD: 0.90, maxContinuousC: 0.5, surgeC: 1.0 },
  { id: "luminous-inverlast-220", brand: "Luminous", model: "Inverlast ILTT26060", chemistry: "Tubular Deep Cycle", nominalVoltage: 12, capacityAh: 220, nominalKwh: 2.64, recommendedDoD: 0.50, maxContinuousC: 0.1, surgeC: 0.2 },
  { id: "mercury-200ah", brand: "Mercury", model: "Deep Cycle Gel 200", chemistry: "AGM / Gel", nominalVoltage: 12, capacityAh: 200, nominalKwh: 2.40, recommendedDoD: 0.50, maxContinuousC: 0.1, surgeC: 0.2 },
  { id: "prag-200ah", brand: "PRAG", model: "Gel Deep Cycle 12-200", chemistry: "AGM / Gel", nominalVoltage: 12, capacityAh: 200, nominalKwh: 2.40, recommendedDoD: 0.50, maxContinuousC: 0.1, surgeC: 0.2 },
  { id: "shoto-sda10-48100", brand: "Shoto", model: "SDA10-48100", chemistry: "LiFePO4", nominalVoltage: 48, capacityAh: 100, nominalKwh: 4.8, recommendedDoD: 0.90, maxContinuousC: 0.5, surgeC: 1.0 },
  { id: "trojan-t105", brand: "Trojan", model: "T-105 Deep Cycle", chemistry: "Tubular Deep Cycle", nominalVoltage: 6, capacityAh: 225, nominalKwh: 1.35, recommendedDoD: 0.50, maxContinuousC: 0.1, surgeC: 0.2 }
  // Additional brands (Ritar, Quanta, Tubular/East Penn, Sukam, Microtek, OutBack, Techfine, Growatt, Luxwatt, Luxsun, Sacred Sun, Leoch, Huawei, Sunsynk, Must, Eastman, Newmax, Victron, Itel) map directly to this schema
];

// 3. SOLAR PANELS (Catalog sample - expandable to all 15 brands)
export const PANEL_CATALOG: SolarPanelSpec[] = [
  { id: "jinko-tiger-585", brand: "Jinko Solar", model: "Tiger Neo 72HL4-BDV 585", pMax: 585, vMp: 43.80, iMp: 13.36, vOc: 52.20, iSc: 14.15, tempCoeffVoc: -0.25, tech: "N-Type TOPCon" },
  { id: "trina-vertex-600", brand: "Trina Solar", model: "Vertex DEG20C.20 600", pMax: 600, vMp: 34.90, iMp: 17.19, vOc: 41.90, iSc: 18.23, tempCoeffVoc: -0.25, tech: "Bifacial" },
  { id: "canadian-hiku7-660", brand: "Canadian Solar", model: "HiKu7 CS7N-660MS", pMax: 660, vMp: 38.50, iMp: 17.15, vOc: 45.60, iSc: 18.24, tempCoeffVoc: -0.26, tech: "Mono PERC" },
  { id: "longi-hi-mo-6-575", brand: "LONGi Solar", model: "Hi-MO 6 Explorer 575", pMax: 575, vMp: 43.91, iMp: 13.10, vOc: 51.98, iSc: 14.01, tempCoeffVoc: -0.26, tech: "Mono PERC" },
  { id: "ja-jam72d30-550", brand: "JA Solar", model: "JAM72D30-550/MB", pMax: 550, vMp: 41.95, iMp: 13.11, vOc: 49.80, iSc: 13.98, tempCoeffVoc: -0.27, tech: "Bifacial" },
  { id: "felicity-mono-550", brand: "Felicity Solar", model: "FL-M-550W", pMax: 550, vMp: 41.80, iMp: 13.16, vOc: 49.90, iSc: 14.05, tempCoeffVoc: -0.28, tech: "Mono PERC" },
  { id: "sunpower-maxeon-6", brand: "SunPower / Maxeon", model: "Maxeon 6 440", pMax: 440, vMp: 70.40, iMp: 6.25, vOc: 82.50, iSc: 6.64, tempCoeffVoc: -0.23, tech: "Heterojunction (HJT)" },
  { id: "auxano-mono-450", brand: "Auxano Solar", model: "AUX-M450", pMax: 450, vMp: 41.20, iMp: 10.92, vOc: 49.10, iSc: 11.55, tempCoeffVoc: -0.29, tech: "Mono PERC" }
  // Additional brands (Risen, Jolywood, LG, REC, Suntech, Renogy, Sewa Energy) map directly to this schema
];