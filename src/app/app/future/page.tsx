'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import TradeTable from '@/components/future/TradeTable'
import AddTradeModal from '@/components/future/AddTradeModal'
import type { Trade } from '@/lib/types'

export default function FuturePage() {
  const supabase = createClient()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const loadTrades = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false })
    setTrades((data as Trade[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadTrades()
  }, [loadTrades])

  const totalTrades = trades.length
  const wins = trades.filter((t) => t.result === 'win').length
  const losses = trades.filter((t) => t.result === 'loss').length
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : null
  const totalPL = trades.reduce((sum, t) => sum + (t.pl_dollars ?? 0), 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Future</h1>
        <p className="text-sm text-gray-500 mt-1">
          PropTradeCalc integration and your personal trade performance log
        </p>
      </div>

      {/* PropTradeCalc banner */}
      <div className="card p-6 mb-8 bg-gradient-to-r from-navy/40 to-background border-gold/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">PropTradeCalc</h2>
            <p className="text-sm text-gray-400 max-w-lg leading-relaxed">
              Calculate position sizes, risk percentages, pip values, and R:R ratios for your prop firm account. The calculator runs entirely in your browser — no data is sent to any server.
            </p>
          </div>
          <Link
            href="https://proptradecalc.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-gold text-background font-semibold py-2.5 px-5 rounded-md hover:bg-gold-light transition-colors whitespace-nowrap"
          >
            Open Trade Calculator
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
        <p className="mt-3 text-xs text-gray-600">
          Note: PropTradeCalc currently uses localStorage. Manually log your trades below to keep a permanent record.
        </p>
      </div>

      {/* Stats */}
      {totalTrades > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Trades</p>
            <p className="text-2xl font-bold tabular-nums">{totalTrades}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Win Rate</p>
            <p className="text-2xl font-bold tabular-nums">
              {winRate !== null ? `${winRate}%` : '—'}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">W / L</p>
            <p className="text-2xl font-bold tabular-nums">
              <span className="text-green-400">{wins}</span>
              <span className="text-gray-600 mx-1">/</span>
              <span className="text-red-400">{losses}</span>
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total P/L</p>
            <p
              className={`text-2xl font-bold tabular-nums ${
                totalPL > 0 ? 'text-green-400' : totalPL < 0 ? 'text-red-400' : ''
              }`}
            >
              {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Trade log header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Trade Log</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-surface-2 border border-border text-sm font-medium px-4 py-2 rounded-md hover:border-gray-600 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Trade
        </button>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-gray-600 text-sm">Loading trades...</div>
      ) : (
        <TradeTable trades={trades} />
      )}

      <AddTradeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={loadTrades}
      />
    </div>
  )
}
