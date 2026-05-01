'use client'

import type { Trade } from '@/lib/types'

interface TradeTableProps {
  trades: Trade[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function ResultBadge({ result }: { result: Trade['result'] }) {
  if (!result) return <span className="text-gray-600 text-xs">—</span>
  const styles = {
    win: 'text-green-400 bg-green-950/50 border-green-900',
    loss: 'text-red-400 bg-red-950/50 border-red-900',
    be: 'text-gray-400 bg-gray-900/50 border-gray-700',
  }
  const labels = { win: 'Win', loss: 'Loss', be: 'BE' }
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${styles[result]}`}>
      {labels[result]}
    </span>
  )
}

export default function TradeTable({ trades }: TradeTableProps) {
  if (trades.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-gray-500 text-sm">No trades logged yet.</p>
        <p className="text-gray-600 text-xs mt-1">Click &quot;Add Trade&quot; to log your first trade.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Pair</th>
              <th className="text-left px-4 py-3 font-medium">Dir</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Entry</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">SL</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">TP</th>
              <th className="text-right px-4 py-3 font-medium">P/L</th>
              <th className="text-center px-4 py-3 font-medium">Result</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Notes</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, i) => (
              <tr
                key={trade.id}
                className={`border-b border-border/50 last:border-0 hover:bg-surface-2/50 transition-colors ${
                  i % 2 === 0 ? '' : 'bg-surface/30'
                }`}
              >
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                  {formatDate(trade.created_at)}
                </td>
                <td className="px-4 py-3 font-semibold">{trade.pair}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium ${
                      trade.direction === 'long' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {trade.direction === 'long' ? 'Long' : 'Short'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                  {trade.entry_price ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                  {trade.sl_price ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                  {trade.tp_price ?? '—'}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {trade.pl_dollars != null ? (
                    <span
                      className={
                        trade.pl_dollars > 0
                          ? 'text-green-400'
                          : trade.pl_dollars < 0
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }
                    >
                      {trade.pl_dollars > 0 ? '+' : ''}
                      {trade.pl_dollars.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <ResultBadge result={trade.result} />
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate hidden lg:table-cell">
                  {trade.notes ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
