export interface User {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'admin'
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | string
  plan: 'monthly' | 'yearly' | string
  current_period_end: string | null
  reminder_sent_at: string | null
  created_at: string
  users?: User
}

export interface Charity {
  id: string
  name: string
  description: string | null
  category: string | null
  image_url: string | null
  website: string | null
  featured: boolean
  events: any[] // JSONB array
  created_at: string
}

export interface Score {
  id: string
  user_id: string
  score: number
  created_at: string
}

export interface Draw {
  id: string
  month: string
  status: 'simulated' | 'published'
  draw_type: 'random' | 'weighted'
  winning_numbers: number[]
  jackpot_amount: number | string
  pool_4match: number | string
  pool_3match: number | string
  created_at: string
}

export interface Winner {
  id: string
  draw_id: string
  user_id: string
  match_type: '3match' | '4match' | '5match'
  prize_amount: number | string
  status: 'pending' | 'verified' | 'paid' | 'rejected'
  proof_url: string | null
  created_at: string
  users?: User
}

export interface CharityContribution {
  id: string
  user_id: string
  charity_id: string
  amount: number | string
  contribution_pct: number
  created_at: string
}
