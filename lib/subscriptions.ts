import { createClient } from '@/lib/supabase/server'

export async function checkSubscription(userId: string) {
  const supabase = createClient()
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !subscription) return null
  return subscription
}
