'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function login(formData: FormData) {
  const supabase = createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('mockproject')) {
    redirect('/login?error=Missing Real Supabase Keys in .env.local')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Sign-in error:", error)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('mockproject')) {
    redirect('/signup?error=Missing Real Supabase Keys in .env.local')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error("Sign-up error:", error)
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  // Fire welcome email — errors are swallowed so they don't block redirect
  if (data?.user?.email) {
    sendWelcomeEmail(data.user.email, '').catch(console.error)
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}
