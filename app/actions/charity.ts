'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function selectCharity(charityId: string, percentage: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')
  
  // Clear any existing active selection to ensure 1-to-1 relationship is mocked via 1-to-M table
  await supabase.from('user_charities').delete().eq('user_id', user.id)

  const { error } = await supabase.from('user_charities').insert({
    user_id: user.id,
    charity_id: charityId,
    contribution_pct: percentage,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/onboarding')
  revalidatePath('/dashboard')
}
