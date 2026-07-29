import { NextRequest, NextResponse } from "next/server"

const FRED_API_KEY = process.env.FRED_API_KEY || "02d615c1d8d5affe828a227cedb408d2"
const CPI_SERIES_ID = "CPIAUCSL"
const BASELINE_YEAR = 2026

// In-memory cache — refreshed every request (FRED is fast, ~200ms)
let cachedData: { annual: Record<number, number>; monthly: { date: string; value: number }[] } | null = null
let cacheTime = 0
const CACHE_TTL = 3600_000 // 1 hour

async function fetchFredCpi(): Promise<{ annual: Record<number, number>; monthly: { date: string; value: number }[] }> {
  const now = Date.now()
  if (cachedData && now - cacheTime < CACHE_TTL) return cachedData

  // Fetch ~10 years of monthly CPI data
  const url = `https://api.stlouisfed.org/fred/series/observations?` +
    `series_id=${CPI_SERIES_ID}&` +
    `observation_start=2015-01-01&` +
    `sort_order=desc&` +
    `api_key=${FRED_API_KEY}&` +
    `file_type=json`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`FRED API error: ${res.status}`)

  const json = await res.json()
  if (json.error_message) throw new Error(`FRED error: ${json.error_message}`)

  const observations: { date: string; value: string }[] = json.observations || []
  
  // Filter out "." values (missing data) and parse
  const monthly = observations
    .filter((o: any) => o.value !== ".")
    .map((o: any) => ({ date: o.date, value: parseFloat(o.value) }))

  // Compute annual averages from monthly data
  const byYear = new Map<number, number[]>()
  for (const obs of monthly) {
    const year = parseInt(obs.date.substring(0, 4))
    if (!byYear.has(year)) byYear.set(year, [])
    byYear.get(year)!.push(obs.value)
  }

  const annual: Record<number, number> = {}
  byYear.forEach((values, year) => {
    annual[year] = values.reduce((a, b) => a + b, 0) / values.length
  })

  cachedData = { annual, monthly }
  cacheTime = now
  return cachedData
}

function getCpiForYear(year: number, annualData: Record<number, number>): number {
  if (annualData[year]) return annualData[year]
  // Project future years using 2.5% annual inflation
  const years = Object.keys(annualData).map(Number).sort((a, b) => b - a)
  const nearestYear = years.find(y => y <= year) || Math.min(...years)
  let cpi = annualData[nearestYear]
  for (let y = nearestYear + 1; y <= year; y++) {
    cpi *= 1.025
  }
  return cpi
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const targetYear = parseInt(searchParams.get("year") || "")
  const targetMonth = parseInt(searchParams.get("month") || "6")
  const currentYear = new Date().getFullYear()

  if (targetYear && (targetYear < 2015 || targetYear > 2040)) {
    return NextResponse.json({ error: "Year must be between 2015 and 2040" }, { status: 400 })
  }

  try {
    const { annual, monthly } = await fetchFredCpi()
    const years = Object.keys(annual).map(Number).sort((a, b) => a - b)
    const baseCpi = annual[BASELINE_YEAR] || annual[Math.max(...Object.keys(annual).map(Number))]
    const targetCpi = targetYear ? getCpiForYear(targetYear, annual) : baseCpi
    const currentCpi = getCpiForYear(currentYear, annual)

    const multiplier = targetCpi / baseCpi
    const currentMultiplier = currentCpi / baseCpi
    const cumulativeRate = targetYear ? (multiplier - 1) * 100 : 0

    // Calculate last complete year's inflation rate
    const lastCompleteYear = Math.max(...years)
    const prevYearData = annual[lastCompleteYear - 1]
    const currentYearRate = prevYearData
      ? ((annual[lastCompleteYear] / prevYearData) - 1) * 100
      : null

    // Build historical data
    const historical = years.map(year => ({
      year,
      cpi: Math.round(annual[year] * 100) / 100,
      inflation_rate: annual[year - 1]
        ? Math.round(((annual[year] / annual[year - 1]) - 1) * 1000) / 10
        : null,
    }))

    return NextResponse.json({
      base_year: BASELINE_YEAR,
      base_cpi: Math.round(baseCpi * 100) / 100,
      base_label: `${BASELINE_YEAR} CPI (FRED Live)`,
      current_year: currentYear,
      current_cpi: Math.round(currentCpi * 100) / 100,
      current_multiplier: Math.round(currentMultiplier * 10000) / 10000,
      current_inflation_rate: currentYearRate ? Math.round(currentYearRate * 10) / 10 : null,
      target_year: targetYear || BASELINE_YEAR,
      target_cpi: Math.round(targetCpi * 100) / 100,
      target_multiplier: Math.round(multiplier * 10000) / 10000,
      cumulative_inflation_rate: Math.round(cumulativeRate * 10) / 10,
      annualized_rate: targetYear > currentYear ? 2.5 : currentYearRate ? Math.round(currentYearRate * 10) / 10 : null,
      latest_monthly: monthly.slice(0, 6),
      historical,
      data_source: "FRED API (Federal Reserve Economic Data) · Real-time CPI-U",
      note: "Live data from FRED API. Updated every request with 1-hour caching.",
    })
  } catch (error: any) {
    console.error("FRED fetch failed:", error.message)
    return NextResponse.json({
      error: "Failed to fetch inflation data from FRED API",
      detail: error.message,
      fallback: "Check your FRED_API_KEY env var or network connectivity.",
    }, { status: 502 })
  }
}