'use client'

import { useState } from 'react'

interface MarketItem {
  label: string
  value: string
  change: string
  positive: boolean | null
}

const INDICES: MarketItem[] = [
  { label: 'S&P 500', value: '5,234.18', change: '+0.32%', positive: true },
  { label: 'NASDAQ', value: '16,396.83', change: '+0.51%', positive: true },
  { label: 'Dow Jones', value: '38,996.39', change: '+0.20%', positive: true },
  { label: 'FTSE 100', value: '8,187.60', change: '-0.12%', positive: false },
  { label: 'Nikkei 225', value: '38,460.08', change: '+0.34%', positive: true },
  { label: 'DAX', value: '18,156.31', change: '+0.28%', positive: true },
  { label: 'CAC 40', value: '8,225.88', change: '-0.08%', positive: false },
  { label: 'Hang Seng', value: '18,092.45', change: '-0.45%', positive: false },
  { label: 'Shanghai Comp.', value: '3,104.82', change: '+0.15%', positive: true },
  { label: 'ASX 200', value: '7,882.40', change: '+0.22%', positive: true },
]

const COMMODITIES: MarketItem[] = [
  { label: 'Gold (XAU/USD)', value: '$2,329.40', change: '+0.18%', positive: true },
  { label: 'Silver (XAG/USD)', value: '$27.32', change: '-0.22%', positive: false },
  { label: 'WTI Crude Oil', value: '$83.71', change: '+0.45%', positive: true },
  { label: 'Brent Crude', value: '$88.02', change: '+0.38%', positive: true },
  { label: 'Natural Gas', value: '$1.74', change: '-1.25%', positive: false },
  { label: 'Copper', value: '$4.52', change: '+0.67%', positive: true },
  { label: 'Platinum', value: '$981.20', change: '-0.30%', positive: false },
]

const FX: MarketItem[] = [
  { label: 'EUR/USD', value: '1.0845', change: '+0.12%', positive: true },
  { label: 'GBP/USD', value: '1.2690', change: '+0.08%', positive: true },
  { label: 'USD/JPY', value: '154.82', change: '+0.15%', positive: null },
  { label: 'USD/CHF', value: '0.9012', change: '-0.05%', positive: false },
  { label: 'AUD/USD', value: '0.6524', change: '-0.10%', positive: false },
  { label: 'USD/CAD', value: '1.3641', change: '+0.18%', positive: null },
  { label: 'USD/CNY', value: '7.2385', change: '+0.02%', positive: null },
  { label: 'NZD/USD', value: '0.6018', change: '-0.05%', positive: false },
  { label: 'USD/MXN', value: '17.1240', change: '-0.22%', positive: null },
]

const MACRO_NOTES = [
  { label: 'Fed Funds Rate', value: '5.25–5.50%', note: 'Held at 23-year high' },
  { label: 'ECB Rate', value: '4.50%', note: 'Easing cycle began Jun 2024' },
  { label: 'BoE Rate', value: '5.25%', note: 'Hold — watching inflation' },
  { label: 'BoJ Rate', value: '0.10%', note: 'First hike since 2007' },
  { label: 'US 10Y Yield', value: '4.48%', note: 'Elevated — fiscal concern' },
  { label: 'DXY', value: '104.82', note: 'USD resilient on rate differential' },
  { label: 'VIX', value: '13.42', note: 'Low — complacency risk' },
  { label: 'BTC/USD', value: '$62,840', note: 'Post-halving consolidation' },
]

function MarketRow({ item }: { item: MarketItem }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-gray-300">{item.label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold tabular-nums">{item.value}</span>
        <span
          className={`text-xs font-medium tabular-nums w-16 text-right ${
            item.positive === true
              ? 'text-green-400'
              : item.positive === false
              ? 'text-red-400'
              : 'text-gray-400'
          }`}
        >
          {item.change}
        </span>
      </div>
    </div>
  )
}

export default function FundamentalsTab() {
  const [refreshNote, setRefreshNote] = useState(false)

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-navy/20 border border-navy/40">
        <svg className="w-4 h-4 text-gold/60 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-gray-400 leading-relaxed">
          Data shown is for illustrative and educational purposes.{' '}
          {refreshNote
            ? 'For live data, connect a market data provider (Alpha Vantage, Polygon.io, or similar) to the /api/market route.'
            : (
              <button
                onClick={() => setRefreshNote(true)}
                className="text-gold/80 hover:text-gold underline transition-colors"
              >
                How to get live data
              </button>
            )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Indices */}
        <div className="card p-4">
          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">
            Equity Indices
          </h3>
          {INDICES.map((item) => (
            <MarketRow key={item.label} item={item} />
          ))}
        </div>

        {/* Commodities */}
        <div className="card p-4">
          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">
            Commodities
          </h3>
          {COMMODITIES.map((item) => (
            <MarketRow key={item.label} item={item} />
          ))}

          <div className="mt-4 pt-3 border-t border-border">
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">
              Macro Rates &amp; Indicators
            </h3>
            {MACRO_NOTES.map((item) => (
              <div key={item.label} className="flex items-start justify-between py-2 border-b border-border/50 last:border-0 gap-2">
                <div>
                  <p className="text-sm text-gray-300">{item.label}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{item.note}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums flex-shrink-0">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FX */}
        <div className="card p-4">
          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">
            FX Pairs
          </h3>
          {FX.map((item) => (
            <MarketRow key={item.label} item={item} />
          ))}

          {/* Market summary */}
          <div className="mt-4 pt-3 border-t border-border">
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">
              Daily Context
            </h3>
            <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
              <p>
                <span className="text-gray-300 font-medium">Risk tone:</span>{' '}
                Risk-on. Equities broadly bid, USD marginally firmer on resilient US data. Gold consolidating below all-time highs.
              </p>
              <p>
                <span className="text-gray-300 font-medium">Key themes:</span>{' '}
                Fed rate cut timing, China stimulus expectations, Middle East oil supply risk, JPY intervention watch.
              </p>
              <p>
                <span className="text-gray-300 font-medium">Upcoming events:</span>{' '}
                US CPI (Thu), ECB minutes (Thu), UK GDP (Fri), Japan BoJ Summary.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
