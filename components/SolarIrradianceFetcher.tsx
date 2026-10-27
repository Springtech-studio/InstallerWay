"use client";

import React, { useState } from "react";
import { useSolarDesign } from "@/context/SolarDesignContext";
import { 
  Sun, 
  MapPin, 
  Crosshair, 
  Loader2, 
  CheckCircle2, 
  Satellite, 
  ExternalLink 
} from "lucide-react";

interface CityPreset {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

const REGIONAL_PRESETS: CityPreset[] = [
  { name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792 },
  { name: "Abuja (FCT)", country: "Nigeria", lat: 9.0765, lon: 7.3986 },
  { name: "Kano", country: "Nigeria", lat: 12.0022, lon: 8.5920 },
  { name: "Port Harcourt", country: "Nigeria", lat: 4.8156, lon: 7.0498 },
  { name: "Accra", country: "Ghana", lat: 5.6037, lon: -0.1870 },
  { name: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219 },
  { name: "Johannesburg", country: "South Africa", lat: -26.2041, lon: 28.0473 },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  { name: "Phoenix, AZ", country: "USA", lat: 33.4484, lon: -112.0740 }
];

export default function SolarIrradianceFetcher() {
  const { peakSunHours, setPeakSunHours } = useSolarDesign();
  
  const [lat, setLat] = useState<string>("6.5244");
  const [lon, setLon] = useState<string>("3.3792");
  const [selectedCity, setSelectedCity] = useState<string>("Lagos, Nigeria");
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchedSource, setFetchedSource] = useState<string | null>(null);

  const fetchSolarData = async (latitude: number, longitude: number, cityName?: string) => {
    setLoading(true);
    setFetchedSource(null);
    try {
      const res = await fetch(`/api/solar-irradiance?lat=${latitude}&lon=${longitude}`);
      const data = await res.json();
      if (data.annualPsh) {
        setPeakSunHours(data.annualPsh);
        setFetchedSource(data.source || "NASA POWER Satellites");
        if (cityName) setSelectedCity(cityName);
      }
    } catch (err) {
      console.error("Failed to fetch solar data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const found = REGIONAL_PRESETS.find((p) => `${p.name}, ${p.country}` === val);
    if (found) {
      setLat(found.lat.toString());
      setLon(found.lon.toString());
      fetchSolarData(found.lat, found.lon, `${found.name}, ${found.country}`);
    }
  };

  const handleCustomLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (!isNaN(latitude) && !isNaN(longitude)) {
      fetchSolarData(latitude, longitude, `Custom Site (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
    }
  };

  const handleDeviceGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLat(latitude.toFixed(4));
        setLon(longitude.toFixed(4));
        fetchSolarData(latitude, longitude, "Current Device GPS Coordinates");
      },
      (err) => {
        setLoading(false);
        alert("Unable to retrieve GPS coordinates: " + err.message);
      }
    );
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Satellite className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              Live Satellite Solar Irradiance (NASA POWER API)
            </h3>
            <p className="text-[11px] text-slate-400">
              Fetch accurate multi-year daily insolation (Peak Sun Hours / PSH) for precise PV array sizing.
            </p>
          </div>
        </div>

        {fetchedSource && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> {fetchedSource}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-xs">
        {/* City Presets Dropdown */}
        <div>
          <label className="text-slate-400 block mb-1 font-medium">Quick Regional Presets</label>
          <select
            value={selectedCity}
            onChange={handleCitySelect}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500"
          >
            {REGIONAL_PRESETS.map((p) => (
              <option key={p.name} value={`${p.name}, ${p.country}`}>
                {p.name}, {p.country} ({p.lat > 0 ? `${p.lat}°N` : `${Math.abs(p.lat)}°S`})
              </option>
            ))}
          </select>
        </div>

        {/* Custom Coordinates Inputs */}
        <form onSubmit={handleCustomLookup} className="flex gap-2">
          <div className="w-1/2">
            <label className="text-slate-400 block mb-1 font-medium">Latitude (°)</label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-right"
              placeholder="e.g. 6.5244"
              required
            />
          </div>
          <div className="w-1/2">
            <label className="text-slate-400 block mb-1 font-medium">Longitude (°)</label>
            <input
              type="number"
              step="any"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-right"
              placeholder="e.g. 3.3792"
              required
            />
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCustomLookup}
            disabled={loading}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sun className="w-3.5 h-3.5" />}
            Fetch Satellite PSH
          </button>
          <button
            type="button"
            onClick={handleDeviceGeolocation}
            title="Use current device GPS location"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            <Crosshair className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
}