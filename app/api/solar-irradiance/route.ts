import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Latitude and Longitude parameters are required" },
      { status: 400 }
    );
  }

  try {
    // NASA POWER Climatology Endpoint (Annual & Monthly solar radiation)
    const nasaUrl = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon}&latitude=${lat}&format=JSON`;

    const res = await fetch(nasaUrl, {
      next: { revalidate: 86400 } // Cache data for 24 hours
    });

    if (!res.ok) {
      throw new Error(`NASA POWER API responded with status ${res.status}`);
    }

    const data = await res.json();
    const monthlyRadiation = data.properties?.parameter?.ALLSKY_SFC_SW_DWN;

    if (!monthlyRadiation) {
      throw new Error("Invalid solar irradiance dataset returned");
    }

    // "ANN" represents the multi-year annual average daily PSH
    const annualAveragePsh = monthlyRadiation["ANN"] || monthlyRadiation["13"] || 5.0;

    return NextResponse.json({
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      source: "NASA POWER Satellites (CERES/MERRA-2)",
      annualPsh: parseFloat(Number(annualAveragePsh).toFixed(2)),
      monthlyBreakdown: monthlyRadiation
    });
  } catch (error: any) {
    console.error("NASA POWER Solar Irradiance Fetch Error:", error);
    // Graceful fallback with regional estimates based on latitude proximity
    const fallbackPsh = Math.abs(parseFloat(lat)) < 15 ? 5.2 : 4.4;
    return NextResponse.json({
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      source: "InstallerWay Regional Empirical Model (Fallback)",
      annualPsh: fallbackPsh,
      note: "Offline or satellite timeout. Empirical regional baseline applied."
    });
  }
}