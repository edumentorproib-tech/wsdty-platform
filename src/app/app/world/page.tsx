'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import nextDynamic from 'next/dynamic'
import Tabs from '@/components/ui/Tabs'
import FundamentalsTab from '@/components/world/FundamentalsTab'
import TDATab from '@/components/world/TDATab'

const GlobeTab = nextDynamic(() => import('@/components/world/GlobeTab'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px] text-gray-600 text-sm">
      Loading globe...
    </div>
  ),
})

const TABS = [
  { key: 'globe', label: 'Globe' },
  { key: 'fundamentals', label: 'Fundamentals' },
  { key: 'tda', label: 'TDA' },
]

export default function WorldPage() {
  const [tab, setTab] = useState('globe')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">The World</h1>
        <p className="text-sm text-gray-500 mt-1">
          Global macro intelligence, market fundamentals, and trade decision analysis
        </p>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className={`mt-6 ${tab === 'globe' ? 'h-[calc(100vh-280px)] min-h-[500px] flex flex-col' : ''}`}>
        {tab === 'globe' && <GlobeTab />}
        {tab === 'fundamentals' && <FundamentalsTab />}
        {tab === 'tda' && <TDATab />}
      </div>
    </div>
  )
}
