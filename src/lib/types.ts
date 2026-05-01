export type TradeResult = 'win' | 'loss' | 'be'
export type TradeDirection = 'long' | 'short'
export type WillWork = 'yes' | 'maybe' | 'no'

export interface Trade {
  id: string
  user_id: string
  created_at: string
  pair: string
  direction: TradeDirection
  entry_price: string | null
  sl_price: string | null
  tp_price: string | null
  lot_size: string | null
  pl_dollars: number | null
  result: TradeResult | null
  notes: string | null
}

export interface TradeIdea {
  id: string
  user_id: string
  created_at: string
  macro_context: string | null
  chart_pattern: string | null
  chart_image_url: string | null
  entry: string | null
  sl: string | null
  tp: string | null
  will_work: WillWork | null
  reasoning: string | null
}

export interface DiaryEntry {
  id: string
  user_id: string
  entry_date: string
  personal_reflection: string | null
  mood_score: number | null
  discipline_score: number | null
}

export interface TradeReflection {
  id: string
  user_id: string
  trade_id: string
  reflection_text: string | null
}

export interface DashboardStats {
  totalTrades: number
  winRate: number
  currentStreak: number
  avgPsychologyScore: number
  readWorld: boolean
  loggedTrade: boolean
  wroteDiary: boolean
}
