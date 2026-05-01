'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import DiaryEntryForm from '@/components/diary/DiaryEntryForm'
import CalendarHeatmap from '@/components/diary/CalendarHeatmap'
import type { DiaryEntry, Trade } from '@/lib/types'

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const sorted = [...new Set(dates)].sort((a, b) => b.localeCompare(a))
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0
  let streak = 0
  let check = sorted[0] === today ? today : yesterday
  for (const d of sorted) {
    if (d === check) {
      streak++
      check = new Date(new Date(check).getTime() - 86400000).toISOString().split('T')[0]
    } else break
  }
  return streak
}

export default function DiaryPage() {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data: entryData } = await supabase
      .from('diary_entries')
      .select('*')
      .order('entry_date', { ascending: false })
    setEntries((entryData as DiaryEntry[]) ?? [])

    const { data: tradeData } = await supabase
      .from('trades')
      .select('result, created_at')
      .order('created_at', { ascending: false })
    setTrades((tradeData as Trade[]) ?? [])

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData, refreshKey])

  function handleSaved() {
    setRefreshKey((k) => k + 1)
  }

  // Weekly stats (last 7 days)
  const last7 = entries.filter((e) => {
    const diff = (new Date(today).getTime() - new Date(e.entry_date).getTime()) / 86400000
    return diff >= 0 && diff < 7
  })
  const avgMood =
    last7.filter((e) => e.mood_score).length > 0
      ? (last7.reduce((s, e) => s + (e.mood_score ?? 0), 0) / last7.filter((e) => e.mood_score).length).toFixed(1)
      : '—'
  const avgDiscipline =
    last7.filter((e) => e.discipline_score).length > 0
      ? (
          last7.reduce((s, e) => s + (e.discipline_score ?? 0), 0) /
          last7.filter((e) => e.discipline_score).length
        ).toFixed(1)
      : '—'

  const last7Trades = trades.filter((t) => {
    if (!t.created_at) return false
    const diff = (new Date(today).getTime() - new Date(t.created_at).getTime()) / 86400000
    return diff >= 0 && diff < 7
  })
  const wins7 = last7Trades.filter((t) => t.result === 'win').length
  const winRate7 =
    last7Trades.length > 0 ? Math.round((wins7 / last7Trades.length) * 100) : null

  const streak = computeStreak(entries.map((e) => e.entry_date))
  const entryDates = entries.map((e) => e.entry_date)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Diary</h1>
        <p className="text-sm text-gray-500 mt-1">
          Daily reflection, psychology tracking, and performance heatmap
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Entry form */}
        <div>
          <DiaryEntryForm
            key={`${selectedDate}-${refreshKey}`}
            date={selectedDate}
            onSaved={handleSaved}
          />
        </div>

        {/* Right: Calendar + stats */}
        <div className="space-y-5">
          {/* Calendar heatmap */}
          <div className="card p-5">
            <CalendarHeatmap
              entryDates={entryDates}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>

          {/* Weekly stats */}
          <div className="card p-5">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-4">
              This Week
            </h3>
            {loading ? (
              <p className="text-gray-600 text-sm">Loading...</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-2 rounded-md p-3">
                  <p className="text-xs text-gray-500 mb-1">Avg Mood</p>
                  <p className="text-xl font-bold tabular-nums">{avgMood}</p>
                </div>
                <div className="bg-surface-2 rounded-md p-3">
                  <p className="text-xs text-gray-500 mb-1">Avg Discipline</p>
                  <p className="text-xl font-bold tabular-nums">{avgDiscipline}</p>
                </div>
                <div className="bg-surface-2 rounded-md p-3">
                  <p className="text-xs text-gray-500 mb-1">Win Rate (7d)</p>
                  <p className="text-xl font-bold tabular-nums">
                    {winRate7 !== null ? `${winRate7}%` : '—'}
                  </p>
                </div>
                <div className="bg-surface-2 rounded-md p-3">
                  <p className="text-xs text-gray-500 mb-1">Best Streak</p>
                  <p className="text-xl font-bold tabular-nums">
                    {streak > 0 ? `${streak}d` : '—'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Entry history note */}
          {!loading && entries.length > 0 && (
            <div className="text-xs text-gray-600 text-center">
              {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} recorded.{' '}
              Click any past date on the calendar to view or edit that entry.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
