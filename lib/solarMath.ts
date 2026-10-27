import { InverterSpec, BatterySpec, SolarPanelSpec } from "./hardwareCatalog";

export interface ApplianceLoad {
  id: string;
  name: string;
  qty: number;
  watts: number;
  hoursDay: number;
  hoursNight: number;
  surgeMultiplier: number;
}

export function calculateLoadTotals(loads: ApplianceLoad[]) {
  let totalContinuousWatts = 0;
  let totalSurgeWatts = 0;
  let totalDailyKwh = 0;
  let nightKwh = 0;

  loads.forEach((l) => {
    const runningWatts = l.qty * l.watts;
    totalContinuousWatts += runningWatts;
    totalSurgeWatts += runningWatts * l.surgeMultiplier;
    const dailyKwh = (runningWatts * (l.hoursDay + l.hoursNight)) / 1000;
    totalDailyKwh += dailyKwh;
    nightKwh += (runningWatts * l.hoursNight) / 1000;
  });

  return {
    continuousWatts: totalContinuousWatts,
    peakSurgeWatts: totalSurgeWatts,
    totalDailyKwh,
    dayKwh: totalDailyKwh - nightKwh,
    nightKwh
  };
}

export function calculateBatteryRequirements(
  nightKwh: number,
  autonomyDays: number,
  battery: BatterySpec,
  temperatureDerateFactor = 0.95
) {
  // Required usable kWh
  const requiredUsableKwh = nightKwh * autonomyDays;
  // Raw storage after DoD and temperature adjustments
  const effectiveDoD = battery.recommendedDoD * temperatureDerateFactor;
  const totalRequiredKwh = requiredUsableKwh / effectiveDoD;
  const modulesNeeded = Math.ceil(totalRequiredKwh / battery.nominalKwh);

  return {
    usableKwhNeeded: requiredUsableKwh,
    totalStorageKwh: modulesNeeded * battery.nominalKwh,
    modulesCount: modulesNeeded
  };
}

export function calculatePVArrayRequirements(
  dailyKwh: number,
  peakSunHours: number,
  systemLossFactor = 0.80 // 20% total balance of system losses
) {
  // PV kWp required = Daily energy / (PSH * efficiency)
  const targetKwp = dailyKwh / (peakSunHours * systemLossFactor);
  return targetKwp;
}

export function calculateStringConfiguration(
  inverter: InverterSpec,
  panel: SolarPanelSpec,
  targetKwp: number,
  minTempC = 15,
  maxTempC = 60
) {
  if (inverter.type === "External MPPT" || inverter.mpptMaxV === 0) {
    const totalPanels = Math.ceil((targetKwp * 1000) / panel.pMax);
    return { panelsInSeries: 0, parallelStrings: 0, totalPanels, isCompliant: true, note: "External MPPT in use" };
  }

  // Cold temperature Voc check: Voc_cold = Voc * (1 + (minTemp - 25) * coeff/100)
  const vocCold = panel.vOc * (1 + (minTempC - 25) * (panel.tempCoeffVoc / 100));
  // Hot temperature Vmp check: Vmp_hot = Vmp * (1 + (maxTemp - 25) * (panel.tempCoeffVoc / 100))
  const vmpHot = panel.vMp * (1 + (maxTempC - 25) * (panel.tempCoeffVoc / 100));

  // Max panels in series bounded by inverter Max Voc
  const maxSeries = Math.floor(inverter.maxVoc / vocCold);
  // Min panels in series bounded by MPPT Min Voltage
  const minSeries = Math.ceil(inverter.mpptMinV / vmpHot);

  // Pick an optimal series string count within the MPPT operating window
  const optimalSeries = Math.min(maxSeries, Math.max(minSeries, Math.floor(inverter.mpptMaxV / panel.vMp)));

  const totalPanelsNeeded = Math.ceil((targetKwp * 1000) / panel.pMax);
  const strings = Math.max(1, Math.ceil(totalPanelsNeeded / optimalSeries));
  const finalTotalPanels = strings * optimalSeries;

  const stringVocCold = optimalSeries * vocCold;
  const stringVmpHot = optimalSeries * vmpHot;
  const isCompliant = stringVocCold <= inverter.maxVoc && stringVmpHot >= inverter.mpptMinV;

  return {
    panelsInSeries: optimalSeries,
    parallelStrings: strings,
    totalPanels: finalTotalPanels,
    actualKwp: (finalTotalPanels * panel.pMax) / 1000,
    stringVocCold,
    stringVmpHot,
    isCompliant
  };
}