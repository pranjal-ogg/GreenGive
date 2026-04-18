'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

type Subscription = {
  status: 'active' | 'cancelled' | 'lapsed'
  plan: 'monthly' | 'yearly'
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function getUser() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('subscriptions')
          .select('status, plan')
          .eq('user_id', user.id)
          .single()
        
        setSubscription(data as Subscription | null)
      } else {
        setSubscription(null)
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null
        setUser(currentUser)
        
        if (currentUser) {
          const { data } = await supabase
            .from('subscriptions')
            .select('status, plan')
            .eq('user_id', currentUser.id)
            .single()
          setSubscription(data as Subscription | null)
        } else {
          setSubscription(null)
        }
      }
    )

    return () => {
      authListener.unsubscribe()
    }
  }, [])

  return { user, subscription, loading }
}
