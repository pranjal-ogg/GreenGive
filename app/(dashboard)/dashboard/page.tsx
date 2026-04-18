import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Subscription, Score, Winner, Charity } from '@/lib/types'

import ScoreManager from '@/components/score-manager'
import SubscriptionStatus from '@/components/dashboard/SubscriptionStatus'
import CharityWidget from '@/components/dashboard/CharityWidget'
import DrawParticipation from '@/components/dashboard/DrawParticipation'
import WinningsOverview from '@/components/dashboard/WinningsOverview'

interface CharityAllocation {
  contribution_pct: number
  charities: Charity | null
}

export default async function DashboardPage({ searchParams }: { searchParams?: { session_id?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Next.js Fallback: Catch checkout redirects and forcefully sync Stripe data instantly
  if (searchParams?.session_id) {
    try {
      const checkoutSession = await stripe.checkout.sessions.retrieve(searchParams.session_id)
      
      if (checkoutSession.payment_status === 'paid' && checkoutSession.subscription) {
        const subscriptionId = checkoutSession.subscription as string
        const customerId = checkoutSession.customer as string
        const subData = await stripe.subscriptions.retrieve(subscriptionId)
        
        const isYearly = subData.items.data[0].price.id === process.env.STRIPE_YEARLY_PRICE_ID
        const currentPeriodEnd = subData.current_period_end
          ? new Date(subData.current_period_end * 1000).toISOString()
          : null

        const { data: existingSub } = await supabaseAdmin.from('subscriptions').select('id').eq('user_id', user.id).maybeSingle()

        if (existingSub) {
          await supabaseAdmin.from('subscriptions').update({
            plan: isYearly ? 'yearly' : 'monthly',
            status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            current_period_end: currentPeriodEnd,
          }).eq('id', existingSub.id)
        } else {
          await supabaseAdmin.from('subscriptions').insert({
            user_id: user.id,
            plan: isYearly ? 'yearly' : 'monthly',
            status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            current_period_end: currentPeriodEnd,
          })
        }
      }
      redirect('/dashboard') 
    } catch (e) {
      console.error('Session sync error:', e)
    }
  }

  const { data: subscription } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle()
  const { data: scores } = await supabase.from('scores').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(5)
  const { data: allocation } = await supabase.from('user_charities').select('contribution_pct, charities(*)').eq('user_id', user.id).maybeSingle()
  const { data: winnings } = await supabase.from('winners').select('*, draws(*)').eq('user_id', user.id).order('created_at', { ascending: false })
  const { count: drawCount } = await supabase.from('draw_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id)

  const typedSubscription = subscription as Subscription | null
  const typedScores = scores as Score[] | null
  const typedAllocation = allocation as unknown as CharityAllocation | null
  const typedWinnings = winnings as (Winner & { draws: { month: string } | null })[] | null

  return (
    <div className="bg-[#0B0F19] min-h-screen">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">Dashboard</h1>
          <p className="text-slate-400 text-lg">Manage your impact, track your odds, and submit numbers.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CharityWidget allocation={typedAllocation} />
          <SubscriptionStatus subscription={typedSubscription} />
          <div className="md:col-span-2 lg:col-span-1 border border-slate-800 rounded-3xl p-6 bg-slate-900 shadow-xl relative overflow-hidden flex flex-col h-full">
            <h3 className="text-xl font-bold text-white mb-6 relative z-10">Submit Scores</h3>
            <div className="relative z-10 flex-grow">
               <ScoreManager initialScores={typedScores || []} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
          <div className="lg:col-span-2">
            <DrawParticipation scores={typedScores || []} drawsEntered={drawCount || 0} />
          </div>
          <div className="lg:col-span-3">
            <WinningsOverview winnings={typedWinnings || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
