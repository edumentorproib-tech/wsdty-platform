'use client'

interface CalendarHeatmapProps {
  entryDates: string[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

function getMonthDays(year: number, month: number) {
  const days: { date: string; dayOfMonth: number }[] = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    const iso = date.toISOString().split('T')[0]
    days.push({ date: iso, dayOfMonth: d })
  }
  // leading empty cells for grid alignment (Sunday = 0)
  const startOffset = firstDay.getDay()
  return { days, startOffset }
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function CalendarHeatmap({
  entryDates,
  selectedDate,
  onSelectDate,
}: CalendarHeatmapProps) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const entrySet = new Set(entryDates)

  // We'll show the current month
  const year = today.getFullYear()
  const month = today.getMonth()
  const { days, startOffset } = getMonthDays(year, month)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">
          {MONTH_NAMES[month]} {year}
        </h3>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-green-700 inline-block" />
            Entry
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-surface-2 border border-border inline-block" />
            Skipped
          </span>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-600 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map(({ date, dayOfMonth }) => {
          const hasEntry = entrySet.has(date)
          const isToday = date === todayStr
          const isSelected = date === selectedDate
          const isFuture = date > todayStr

          return (
            <button
              key={date}
              onClick={() => !isFuture && onSelectDate(date)}
              disabled={isFuture}
              className={`
                aspect-square rounded-sm flex items-center justify-center text-xs font-medium transition-all
                ${isFuture ? 'text-gray-700 cursor-default' : 'cursor-pointer'}
                ${isSelected ? 'ring-2 ring-gold ring-offset-1 ring-offset-background' : ''}
                ${
                  hasEntry
                    ? 'bg-green-800/70 text-green-200 hover:bg-green-700/80'
                    : isFuture
                    ? 'bg-transparent'
                    : 'bg-surface-2 text-gray-500 hover:bg-surface border border-border/50'
                }
                ${isToday ? 'ring-1 ring-gold/50' : ''}
              `}
              title={date}
            >
              {dayOfMonth}
            </button>
          )
        })}
      </div>
    </div>
  )
}
