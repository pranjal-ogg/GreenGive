'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addScore(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const score = parseInt(formData.get('score') as string, 10)
  const date = formData.get('date') as string

  if (isNaN(score) || score < 1 || score > 45) {
    return { error: 'Score must be between 1 and 45' }
  }

  const { count } = await supabase
    .from('scores')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: existing } = await supabase
    .from('scores')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', date)
    .single()

  let isReplacing = false

  if (existing) {
    // duplicate date = update, not insert
    const { error } = await supabase
      .from('scores')
      .update({ score })
      .eq('id', existing.id)
    if (error) return { error: error.message }
  } else {
    // Ensure we know if the latest trigger drops the oldest
    if (count && count >= 5) isReplacing = true
    const { error } = await supabase
      .from('scores')
      .insert({ user_id: user.id, score, date })
    if (error) return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, replaced: isReplacing }
}

export async function updateScore(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const id = formData.get('id') as string
  const score = parseInt(formData.get('score') as string, 10)
  const date = formData.get('date') as string

  if (isNaN(score) || score < 1 || score > 45) {
    return { error: 'Score must be between 1 and 45' }
  }

  // Prevent updating a score to a date that already exists elsewhere
  const { data: existingDate } = await supabase
    .from('scores')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', date)
    .neq('id', id)
    .single()

  if (existingDate) {
    return { error: 'A score for this date already exists. You cannot overwrite a different entry.' }
  }

  const { error } = await supabase
    .from('scores')
    .update({ score, date })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteScore(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('scores')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
}
