'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import type { TradeDirection, TradeResult } from '@/lib/types'

interface AddTradeModalProps {
  open: boolean
  onClose: () => void
  onAdded: () => void
}

interface FormState {
  pair: string
  direction: TradeDirection | ''
  entryPrice: string
  slPrice: string
  tpPrice: string
  lotSize: string
  plDollars: string
  result: TradeResult | ''
  notes: string
}

const INITIAL: FormState = {
  pair: '',
  direction: '',
  entryPrice: '',
  slPrice: '',
  tpPrice: '',
  lotSize: '',
  plDollars: '',
  result: '',
  notes: '',
}

export default function AddTradeModal({ open, onClose, onAdded }: AddTradeModalProps) {
  const supabase = createClient()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.pair || !form.direction) {
      setError('Pair and direction are required.')
      return
    }
    setError(null)
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated.'); setSaving(false); return }

    const { error: dbError } = await supabase.from('trades').insert({
      user_id: user.id,
      pair: form.pair.toUpperCase(),
      direction: form.direction,
      entry_price: form.entryPrice || null,
      sl_price: form.slPrice || null,
      tp_price: form.tpPrice || null,
      lot_size: form.lotSize || null,
      pl_dollars: form.plDollars ? parseFloat(form.plDollars) : null,
      result: form.result || null,
      notes: form.notes || null,
    })

    if (dbError) {
      setError(dbError.message)
    } else {
      setForm(INITIAL)
      onAdded()
      onClose()
    }
    setSaving(false)
  }

  return (
    <Modal open={open} onClose={onClose} title="Log a Trade">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded bg-red-950 border border-red-800 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
              Pair *
            </label>
            <input
              type="text"
              value={form.pair}
              onChange={(e) => set('pair', e.target.value)}
              required
              className="input-base text-sm"
              placeholder="e.g. EURUSD"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
              Direction *
            </label>
            <select
              value={form.direction}
              onChange={(e) => set('direction', e.target.value)}
              required
              className="input-base text-sm"
            >
              <option value="">Select</option>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
              Entry
            </label>
            <input
              type="text"
              value={form.entryPrice}
              onChange={(e) => set('entryPrice', e.target.value)}
              className="input-base text-sm"
              placeholder="1.0845"
            />
          </div>
          <div>
            <label className="block text-xs text-red-800 uppercase tracking-wider mb-1.5">
              Stop Loss
            </label>
            <input
              type="text"
              value={form.slPrice}
              onChange={(e) => set('slPrice', e.target.value)}
              className="input-base text-sm"
              placeholder="1.0790"
            />
          </div>
          <div>
            <label className="block text-xs text-green-800 uppercase tracking-wider mb-1.5">
              Take Profit
            </label>
            <input
              type="text"
              value={form.tpPrice}
              onChange={(e) => set('tpPrice', e.target.value)}
              className="input-base text-sm"
              placeholder="1.0960"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
              P/L ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.plDollars}
              onChange={(e) => set('plDollars', e.target.value)}
              className="input-base text-sm"
              placeholder="+250.00"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
              Result
            </label>
            <select
              value={form.result}
              onChange={(e) => set('result', e.target.value)}
              className="input-base text-sm"
            >
              <option value="">Select</option>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="be">Break-even</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={2}
            className="input-base text-sm resize-none"
            placeholder="Optional trade notes..."
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-border text-gray-400 py-2 rounded-md text-sm hover:text-white hover:border-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gold text-background font-semibold py-2 rounded-md text-sm hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Trade'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
