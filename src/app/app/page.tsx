import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]
  const greeting = getGreeting()
  const displayName = user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Trader'

  // Fetch stats in parallel
  const [tradesRes, diaryRes] = await Promise.all([
    supabase
      .from('trades')
      .select('result, pl_dollars, created_at')
      .eq('user_id', user!.id),
    supabase
      .from('diary_entries')
      .select('entry_date, mood_score, discipline_score')
      .eq('user_id', user!.id)
      .order('entry_date', { ascending: false }),
  ])

  const trades = tradesRes.data ?? []
  const diaryEntries = diaryRes.data ?? []

  // Daily checklist
  const loggedTradeToday = trades.some((t) => t.created_at?.startsWith(today))
  const wroteDiaryToday = diaryEntries.some((e) => e.entry_date === today)

  // Stats
  const totalTrades = trades.length
  const wins = trades.filter((t) => t.result === 'win').length
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0

  const streak = computeStreak(diaryEntries.map((e) => e.entry_date))

  const psychScores = diaryEntries
    .flatMap((e) => {
      const scores = []
      if (e.mood_score) scores.push(e.mood_score)
      if (e.discipline_score) scores.push(e.discipline_score)
      return scores
    })
  const avgPsych =
    psychScores.length > 0
      ? (psychScores.reduce((a, b) => a + b, 0) / psychScores.length).toFixed(1)
      : '—'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-500 text-sm">{formatDate(new Date())}</p>
        <h1 className="text-2xl font-bold mt-1">
          {greeting},{' '}
          <span className="text-gold">{displayName}</span>
        </h1>
      </div>

      {/* Daily checklist */}
      <div className="card p-6 mb-8">
        <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4">
          Today's Flow
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ChecklistItem
            label="Read The World"
            done={false}
            href="/app/world"
          />
          <ChecklistItem
            label="Logged a Trade"
            done={loggedTradeToday}
            href="/app/future"
          />
          <ChecklistItem
            label="Wrote in Diary"
            done={wroteDiaryToday}
            href="/app/diary"
          />
        </div>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <ModuleCard
          title="The World"
          description="Global macro overview, interactive globe, and trade decision analysis."
          href="/app/world"
          accent="from-blue-900/30 to-navy/40"
        />
        <ModuleCard
          title="Future"
          description="PropTradeCalc integration and your personal trade performance log."
          href="/app/future"
          accent="from-gold/10 to-navy/20"
        />
        <ModuleCard
          title="Diary"
          description="Daily reflection, psychology tracking, and performance heatmap."
          href="/app/diary"
          accent="from-green-900/20 to-navy/30"
        />
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Trades" value={totalTrades.toString()} />
        <StatCard label="Win Rate" value={totalTrades > 0 ? `${winRate}%` : '—'} />
        <StatCard label="Diary Streak" value={streak > 0 ? `${streak}d` : '—'} />
        <StatCard label="Avg Psychology" value={avgPsych.toString()} />
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

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
      const prev = new Date(new Date(check).getTime() - 86400000)
      check = prev.toISOString().split('T')[0]
    } else {
      break
    }
  }
  return streak
}

function ChecklistItem({
  label,
  done,
  href,
}: {
  label: string
  done: boolean
  href: string
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-3 rounded-md border transition-colors group ${
        done
          ? 'border-green-800/50 bg-green-950/20'
          : 'border-border hover:border-gray-600'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          done ? 'border-green-500 bg-green-500' : 'border-gray-600 group-hover:border-gray-400'
        }`}
      >
        {done && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm ${done ? 'text-green-400' : 'text-gray-300 group-hover:text-white'}`}>
        {label}
      </span>
    </Link>
  )
}

function ModuleCard({
  title,
  description,
  href,
  accent,
}: {
  title: string
  description: string
  href: string
  accent: string
}) {
  return (
    <Link
      href={href}
      className={`card p-6 bg-gradient-to-br ${accent} hover:border-gray-600 transition-all group`}
    >
      <h3 className="font-semibold text-white mb-2 group-hover:text-gold transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      <div className="mt-4 text-xs text-gold/70 group-hover:text-gold transition-colors flex items-center gap-1">
        Open
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold tabular-nums text-white">{value}</p>
    </div>
  )
}
