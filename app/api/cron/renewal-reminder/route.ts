import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendRenewalReminderEmail } from '@/lib/email'
import { User } from '@/lib/types'

export async function GET(req: Request) {
  // Protect from public access — Vercel sets this header on cron invocations
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  // Find active subscriptions renewing in the next 3 days, with no reminder sent yet
  const { data: subs, error } = await supabaseAdmin
    .from('subscriptions')
    .select('id, plan, current_period_end, user_id, users(email, full_name)')
    .eq('status', 'active')
    .is('reminder_sent_at', null)
    .lte('current_period_end', threeDaysFromNow.toISOString())
    .gte('current_period_end', now.toISOString())

  if (error) {
    console.error('[Cron] Renewal reminder query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let sent = 0

  for (const sub of (subs || [])) {
    const user = (sub as unknown as { users: User }).users
    if (!user?.email || !sub.current_period_end) continue

    const renewalDate = new Date(sub.current_period_end).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    })

    await sendRenewalReminderEmail(user.email, {
      name: user.full_name || '',
      plan: sub.plan,
      renewalDate,
    })

    // Mark so we don't resend
    await supabaseAdmin
      .from('subscriptions')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('id', sub.id)

    sent++
  }

  console.log(`[Cron] Renewal reminders sent: ${sent}`)
  return NextResponse.json({ ok: true, sent })
}
