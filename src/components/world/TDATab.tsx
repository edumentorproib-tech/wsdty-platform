'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { WillWork } from '@/lib/types'

interface FormState {
  macroContext: string
  chartPattern: string
  entry: string
  sl: string
  tp: string
  willWork: WillWork | ''
  reasoning: string
}

const INITIAL: FormState = {
  macroContext: '',
  chartPattern: '',
  entry: '',
  sl: '',
  tp: '',
  willWork: '',
  reasoning: '',
}

const WILL_WORK_OPTIONS: { value: WillWork; label: string; color: string }[] = [
  { value: 'yes', label: 'Yes — high conviction', color: 'border-green-600 bg-green-950/30 text-green-400' },
  { value: 'maybe', label: 'Maybe — needs confirmation', color: 'border-yellow-600 bg-yellow-950/20 text-yellow-400' },
  { value: 'no', label: 'No — pass on this setup', color: 'border-red-700 bg-red-950/20 text-red-400' },
]

export default function TDATab() {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<FormState>(INITIAL)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!form.macroContext && !form.chartPattern && !form.entry) {
      setError('Add at least a macro context, chart pattern, or entry level.')
      return
    }
    setError(null)
    setSaving(true)

    let chartImageUrl: string | null = null

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated.'); setSaving(false); return }

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chart-images')
        .upload(path, imageFile, { contentType: imageFile.type })
      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`)
        setSaving(false)
        return
      }
      const { data: urlData } = supabase.storage.from('chart-images').getPublicUrl(uploadData.path)
      chartImageUrl = urlData.publicUrl
    }

    const { error: dbError } = await supabase.from('trade_ideas').insert({
      user_id: user.id,
      macro_context: form.macroContext || null,
      chart_pattern: form.chartPattern || null,
      chart_image_url: chartImageUrl,
      entry: form.entry || null,
      sl: form.sl || null,
      tp: form.tp || null,
      will_work: form.willWork || null,
      reasoning: form.reasoning || null,
    })

    if (dbError) {
      setError(dbError.message)
    } else {
      setSaved(true)
      setForm(INITIAL)
      setImageFile(null)
      setImagePreview(null)
      if (fileRef.current) fileRef.current.value = ''
    }
    setSaving(false)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Trade Decision Analysis</h2>
        <p className="text-sm text-gray-500">
          Document your full reasoning before entering a position. Be honest — it is for your eyes only.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-950 border border-red-800 text-red-300 text-sm">
          {error}
        </div>
      )}
      {saved && (
        <div className="p-3 rounded bg-green-950 border border-green-800 text-green-300 text-sm">
          Trade idea saved successfully.
        </div>
      )}

      {/* Macro context */}
      <div>
        <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
          1. Macro Context
        </label>
        <textarea
          value={form.macroContext}
          onChange={(e) => set('macroContext', e.target.value)}
          rows={3}
          className="input-base resize-y"
          placeholder="What is the macro backdrop? Fed stance, risk tone, correlated moves, upcoming events..."
        />
      </div>

      {/* Chart pattern */}
      <div>
        <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
          2. Chart Pattern &amp; Technical Setup
        </label>
        <textarea
          value={form.chartPattern}
          onChange={(e) => set('chartPattern', e.target.value)}
          rows={3}
          className="input-base resize-y"
          placeholder="Describe the pattern — e.g. ascending triangle on 4H, break of key resistance, OB/FVG..."
        />

        {/* Image upload */}
        <div className="mt-2">
          <label className="block text-xs text-gray-500 mb-1.5">
            Chart image (optional, max 5MB)
          </label>
          {imagePreview ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Chart preview"
                className="max-h-48 rounded border border-border"
              />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = '' }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 text-gray-300 hover:text-white flex items-center justify-center text-xs"
              >
                x
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 w-fit cursor-pointer text-xs text-gray-500 hover:text-gray-300 border border-border rounded-md px-3 py-2 hover:border-gray-600 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upload chart
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </div>

      {/* Entry / SL / TP */}
      <div>
        <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
          3. Levels
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Entry</label>
            <input
              type="text"
              value={form.entry}
              onChange={(e) => set('entry', e.target.value)}
              className="input-base text-sm"
              placeholder="e.g. 1.0845"
            />
          </div>
          <div>
            <label className="block text-xs text-red-800 mb-1">Stop Loss</label>
            <input
              type="text"
              value={form.sl}
              onChange={(e) => set('sl', e.target.value)}
              className="input-base text-sm border-red-900/30 focus:border-red-700"
              placeholder="e.g. 1.0790"
            />
          </div>
          <div>
            <label className="block text-xs text-green-800 mb-1">Take Profit</label>
            <input
              type="text"
              value={form.tp}
              onChange={(e) => set('tp', e.target.value)}
              className="input-base text-sm border-green-900/30 focus:border-green-700"
              placeholder="e.g. 1.0960"
            />
          </div>
        </div>
      </div>

      {/* Will this trade work */}
      <div>
        <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
          4. Will This Trade Work?
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          {WILL_WORK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('willWork', opt.value)}
              className={`flex-1 py-2.5 px-3 rounded-md border text-sm font-medium transition-all ${
                form.willWork === opt.value
                  ? opt.color + ' ring-1 ring-current'
                  : 'border-border text-gray-500 hover:border-gray-600 hover:text-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reasoning */}
      <div>
        <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
          5. Reasoning &amp; Edge
        </label>
        <textarea
          value={form.reasoning}
          onChange={(e) => set('reasoning', e.target.value)}
          rows={4}
          className="input-base resize-y"
          placeholder="Why do you have an edge here? What invalidates this trade? What is your R:R ratio?"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-gold text-background font-semibold py-2.5 px-6 rounded-md hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : 'Save Trade Idea'}
      </button>
    </div>
  )
}
