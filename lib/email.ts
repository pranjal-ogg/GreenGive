import { Resend } from 'resend'
import { render } from '@react-email/render'
import {
  WelcomeEmail,
  SubscriptionConfirmedEmail,
  DrawResultsEmail,
  WinnerNotificationEmail,
  RenewalReminderEmail,
} from '@/emails/templates'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Digital Horse <noreply@digitalhorse.golf>'

// ——————————————————————————————————————————————————
// Helper: send with graceful fallback (won't crash app if email fails)
// ——————————————————————————————————————————————————
async function sendEmail({ to, subject, template }: { to: string; subject: string; template: React.ReactElement }) {
  try {
    const html = await render(template)
    const { error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) console.error('[Email] Send error:', error)
    else console.log('[Email] Sent to', to, ':', subject)
  } catch (err) {
    console.error('[Email] Unexpected error:', err)
  }
}

// ——————————————————————————————————————————————————
// 1. Welcome Email
// ——————————————————————————————————————————————————
export async function sendWelcomeEmail(to: string, name: string) {
  await sendEmail({
    to,
    subject: 'Welcome to Digital Horse 🏌️',
    template: WelcomeEmail({ name }) as React.ReactElement,
  })
}

// ——————————————————————————————————————————————————
// 2. Subscription Confirmed
// ——————————————————————————————————————————————————
export async function sendSubscriptionConfirmedEmail(to: string, { name, plan, renewalDate }: { name: string; plan: string; renewalDate: string }) {
  await sendEmail({
    to,
    subject: '🎉 Subscription Confirmed — You\'re in the draw!',
    template: SubscriptionConfirmedEmail({ name, plan, renewalDate }) as React.ReactElement,
  })
}

// ——————————————————————————————————————————————————
// 3. Draw Results — call for each participant
// ——————————————————————————————————————————————————
export async function sendDrawResultsEmail(
  to: string,
  params: {
    name: string
    month: string
    winningNumbers: number[]
    userNumbers: number[]
    matchCount: number
    prizeAmount: number | null
  }
) {
  const isWinner = params.matchCount >= 3
  await sendEmail({
    to,
    subject: isWinner
      ? `🏆 You matched ${params.matchCount} numbers in the ${params.month} draw!`
      : `${params.month} Draw Results — See how you did`,
    template: DrawResultsEmail(params) as React.ReactElement,
  })
}

// ——————————————————————————————————————————————————
// 4. Winner Notification
// ——————————————————————————————————————————————————
export async function sendWinnerNotificationEmail(
  to: string,
  params: { name: string; matchType: string; prizeAmount: number; proofUploadUrl: string }
) {
  await sendEmail({
    to,
    subject: `🏆 You've won £${params.prizeAmount.toFixed(2)} — claim your prize`,
    template: WinnerNotificationEmail(params) as React.ReactElement,
  })
}

// ——————————————————————————————————————————————————
// 5. Renewal Reminder
// ——————————————————————————————————————————————————
export async function sendRenewalReminderEmail(to: string, { name, plan, renewalDate }: { name: string; plan: string; renewalDate: string }) {
  await sendEmail({
    to,
    subject: '📅 Your Digital Horse subscription renews in 3 days',
    template: RenewalReminderEmail({ name, plan, renewalDate }) as React.ReactElement,
  })
}
