import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendSubscriptionConfirmedEmail } from '@/lib/email'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 })
  }

  const session = event.data.object

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = session as Stripe.Checkout.Session
        const subscriptionId = checkoutSession.subscription as string
        const customerId = checkoutSession.customer as string
        const clientReferenceId = checkoutSession.client_reference_id

        if (!clientReferenceId) throw new Error('Missing user_id in client_reference_id')

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const planId = subscription.items.data[0].price.id
        const isYearly = planId === process.env.STRIPE_YEARLY_PRICE_ID
        const currentPeriodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null

        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('user_id', clientReferenceId)
          .maybeSingle()

        if (existingSub) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              plan: isYearly ? 'yearly' : 'monthly',
              status: 'active',
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              current_period_end: currentPeriodEnd,
            })
            .eq('id', existingSub.id)
        } else {
          await supabaseAdmin.from('subscriptions').insert({
            user_id: clientReferenceId,
            plan: isYearly ? 'yearly' : 'monthly',
            status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            current_period_end: currentPeriodEnd,
          })
        }

        // Send subscription confirmation email
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('email, full_name')
          .eq('id', clientReferenceId)
          .single()

        if (user?.email) {
          const renewal = currentPeriodEnd
            ? new Date(currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'N/A'
          await sendSubscriptionConfirmedEmail(user.email, {
            name: user.full_name || '',
            plan: isYearly ? 'yearly' : 'monthly',
            renewalDate: renewal,
          })
        }
        break
      }
      case 'customer.subscription.updated': {
        const subscription = session as Stripe.Subscription
        let status = subscription.status
        if (status === 'past_due' || status === 'unpaid') status = 'lapsed'

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: status === 'active' ? 'active' : (status === 'lapsed' ? 'lapsed' : 'cancelled'),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = session as Stripe.Subscription
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }
      default:
        console.log(`Unhandled event type ${event.type}`)
    }
  } catch (error) {
    console.error('Error handling webhook', error)
    return new NextResponse('Webhook handler failed', { status: 500 })
  }

  return new NextResponse('Webhook processed successfully', { status: 200 })
}
