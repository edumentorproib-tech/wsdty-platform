'use client'

interface ScoreSliderProps {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}

function getSliderColor(value: number, max: number) {
  const pct = value / max
  if (pct < 0.4) return '#ef4444'
  if (pct < 0.7) return '#eab308'
  return '#22c55e'
}

export default function ScoreSlider({ label, value, onChange, min = 1, max = 10 }: ScoreSliderProps) {
  const color = getSliderColor(value, max)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-gray-300">{label}</label>
        <span className="text-sm font-bold tabular-nums" style={{ color }}>
          {value} / {max}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, #333333 ${((value - min) / (max - min)) * 100}%, #333333 100%)`,
          accentColor: color,
        }}
      />
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
