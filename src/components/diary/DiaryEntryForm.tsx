'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import ScoreSlider from '@/components/ui/ScoreSlider'
import type { Trade, DiaryEntry, TradeReflection } from '@/lib/types'

interface DiaryEntryFormProps {
  date: string
  onSaved?: () => void
}

export default function DiaryEntryForm({ date, onSaved }: DiaryEntryFormProps) {
  const supabase = createClient()
  const [todayTrades, setTodayTrades] = useState<Trade[]>([])
  const [reflections, setReflections] = useState<Record<string, string>>({})
  const [personalReflection, setPersonalReflection] = useState('')
  const [moodScore, setMoodScore] = useState(7)
  const [disciplineScore, setDisciplineScore] = useState(7)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingEntryId, setExistingEntryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    setSaved(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // Load trades for this date
    const dayStart = `${date}T00:00:00`
    const dayEnd = `${date}T23:59:59`
    const { data: tradesData } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', dayStart)
      .lte('created_at', dayEnd)
      .order('created_at', { ascending: true })

    setTodayTrades((tradesData as Trade[]) ?? [])

    // Load existing diary entry
    const { data: entryData } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('entry_date', date)
      .maybeSingle()

    if (entryData) {
      const entry = entryData as DiaryEntry
      setExistingEntryId(entry.id)
      setPersonalReflection(entry.personal_reflection ?? '')
      setMoodScore(entry.mood_score ?? 7)
      setDisciplineScore(entry.discipline_score ?? 7)
    } else {
      setExistingEntryId(null)
      setPersonalReflection('')
      setMoodScore(7)
      setDisciplineScore(7)
    }

    // Load trade reflections
    const tradeIds = ((tradesData as Trade[]) ?? []).map((t) => t.id)
    if (tradeIds.length > 0) {
      const { data: reflectionsData } = await supabase
        .from('trade_reflections')
        .select('*')
        .eq('user_id', user.id)
        .in('trade_id', tradeIds)

      const map: Record<string, string> = {}
      for (const r of (reflectionsData as TradeReflection[]) ?? []) {
        map[r.trade_id] = r.reflection_text ?? ''
      }
      setReflections(map)
    } else {
      setReflections({})
    }

    setLoading(false)
  }, [supabase, date])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleSave() {
    setError(null)
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated.'); setSaving(false); return }

    // Upsert diary entry
    const { error: entryError } = await supabase
      .from('diary_entries')
      .upsert(
        {
          ...(existingEntryId ? { id: existingEntryId } : {}),
          user_id: user.id,
          entry_date: date,
          personal_reflection: personalReflection || null,
          mood_score: moodScore,
          discipline_score: disciplineScore,
        },
        { onConflict: 'user_id,entry_date' }
      )

    if (entryError) {
      setError(entryError.message)
      setSaving(false)
      return
    }

    // Upsert trade reflections
    for (const trade of todayTrades) {
      const text = reflections[trade.id]
      if (text !== undefined) {
        const existing = await supabase
          .from('trade_reflections')
          .select('id')
          .eq('user_id', user.id)
          .eq('trade_id', trade.id)
          .maybeSingle()

        if (existing.data) {
          await supabase
            .from('trade_reflections')
            .update({ reflection_text: text || null })
            .eq('id', existing.data.id)
        } else if (text) {
          await supabase.from('trade_reflections').insert({
            user_id: user.id,
            trade_id: trade.id,
            reflection_text: text,
          })
        }
      }
    }

    setSaved(true)
    setSaving(false)
    if (onSaved) onSaved()
  }

  const isToday = date === new Date().toISOString().split('T')[0]

  if (loading) {
    return (
      <div className="card p-6 text-center text-gray-600 text-sm">
        Loading entry...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          {isToday
            ? "Today's Entry"
            : new Date(date + 'T12:00:00').toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
        </h2>
        {existingEntryId && (
          <span className="text-xs text-green-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Saved
          </span>
        )}
      </div>

      {/* Trade reflections */}
      {todayTrades.length > 0 && (
        <div>
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            Trades from this session
          </h3>
          <div className="space-y-3">
            {todayTrades.map((trade) => (
              <div key={trade.id} className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-sm">{trade.pair}</span>
                  <span
                    className={`text-xs font-medium ${
                      trade.direction === 'long' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {trade.direction === 'long' ? 'Long' : 'Short'}
                  </span>
                  {trade.result && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded border font-medium ${
                        trade.result === 'win'
                          ? 'text-green-400 border-green-900 bg-green-950/50'
                          : trade.result === 'loss'
                          ? 'text-red-400 border-red-900 bg-red-950/50'
                          : 'text-gray-400 border-gray-700 bg-gray-900/50'
                      }`}
                    >
                      {trade.result === 'win' ? 'Win' : trade.result === 'loss' ? 'Loss' : 'BE'}
                    </span>
                  )}
                  {trade.pl_dollars != null && (
                    <span
                      className={`text-xs tabular-nums ml-auto ${
                        trade.pl_dollars > 0
                          ? 'text-green-400'
                          : trade.pl_dollars < 0
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {trade.pl_dollars > 0 ? '+' : ''}${trade.pl_dollars.toFixed(2)}
                    </span>
                  )}
                </div>
                <textarea
                  value={reflections[trade.id] ?? ''}
                  onChange={(e) =>
                    setReflections((prev) => ({ ...prev, [trade.id]: e.target.value }))
                  }
                  rows={2}
                  className="input-base text-sm resize-none"
                  placeholder="Reflect on this trade — what did you do well? What would you improve?"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal reflection */}
      <div>
        <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
          Personal Reflection
        </label>
        <textarea
          value={personalReflection}
          onChange={(e) => setPersonalReflection(e.target.value)}
          rows={4}
          className="input-base resize-y"
          placeholder="How was today? What did you learn? What are you grateful for? What will you do better tomorrow?"
        />
      </div>

      {/* Scores */}
      <div className="card p-4 space-y-4">
        <h3 className="text-xs text-gray-500 uppercase tracking-wider">Psychology Scores</h3>
        <ScoreSlider
          label="Mood"
          value={moodScore}
          onChange={setMoodScore}
        />
        <ScoreSlider
          label="Discipline"
          value={disciplineScore}
          onChange={setDisciplineScore}
        />
      </div>

      {error && (
        <div className="p-3 rounded bg-red-950 border border-red-800 text-red-300 text-sm">
          {error}
        </div>
      )}
      {saved && (
        <div className="p-3 rounded bg-green-950 border border-green-800 text-green-300 text-sm">
          Entry saved successfully.
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gold text-background font-semibold py-2.5 rounded-md hover:bg-gold-light transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : existingEntryId ? 'Update Entry' : 'Save Entry'}
      </button>
    </div>
  )
}
