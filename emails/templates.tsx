import {
  Body, Button, Container, Head, Heading, Hr,
  Html, Preview, Section, Text,
} from '@react-email/components'
import * as React from 'react'

const base = {
  backgroundColor: '#0B0F19',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}
const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '580px',
}
const logo = {
  fontSize: '20px',
  fontWeight: '800',
  color: '#10b981',
  letterSpacing: '-0.5px',
  marginBottom: '32px',
}
const card = {
  backgroundColor: '#111827',
  borderRadius: '16px',
  border: '1px solid #1f2937',
  padding: '32px',
}
const h1 = { color: '#f9fafb', fontSize: '26px', fontWeight: '700', margin: '0 0 12px' }
const p = { color: '#9ca3af', fontSize: '15px', lineHeight: '1.7', margin: '0 0 16px' }
const btn = {
  backgroundColor: '#10b981',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
}
const muted = { color: '#4b5563', fontSize: '12px', lineHeight: '1.6', margin: '16px 0 0' }

// ——————————————————————————————————————————————————
// 1. Welcome Email
// ——————————————————————————————————————————————————
export function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to GreenGive — your impact starts now.</Preview>
      <Body style={base}>
        <Container style={container}>
          <Text style={logo}>⛳ GreenGive</Text>
          <Section style={card}>
            <Heading style={h1}>Welcome, {name || 'Golfer'} 👋</Heading>
            <Text style={p}>
              You've joined a community that turns golf scores into real-world charity impact. Every month, your Stableford scores enter you into a prize draw — and a share of every subscription goes directly to causes you care about.
            </Text>
            <Text style={p}>Here's what to do next:</Text>
            <Text style={{ ...p, color: '#e5e7eb' }}>
              1. Select your charity<br />
              2. Submit your first score<br />
              3. Watch the draw results each month
            </Text>
            <Button style={btn} href={`${process.env.NEXT_PUBLIC_SITE_URL}/onboarding`}>
              Set Up Your Account
            </Button>
          </Section>
          <Text style={muted}>You're receiving this because you signed up at GreenGive. Questions? Reply to this email.</Text>
        </Container>
      </Body>
    </Html>
  )
}

// ——————————————————————————————————————————————————
// 2. Subscription Confirmed Email
// ——————————————————————————————————————————————————
export function SubscriptionConfirmedEmail({ name, plan, renewalDate }: { name: string; plan: string; renewalDate: string }) {
  return (
    <Html>
      <Head />
      <Preview>Your GreenGive subscription is active.</Preview>
      <Body style={base}>
        <Container style={container}>
          <Text style={logo}>⛳ GreenGive</Text>
          <Section style={card}>
            <Heading style={h1}>You're in! 🎉</Heading>
            <Text style={p}>
              Your <strong style={{ color: '#10b981' }}>{plan === 'yearly' ? 'Yearly' : 'Monthly'}</strong> subscription is now active. You're automatically entered into this month's draw — just keep submitting your scores.
            </Text>
            <Hr style={{ borderColor: '#1f2937', margin: '20px 0' }} />
            <Text style={{ ...p, margin: '0' }}>
              <span style={{ color: '#6b7280' }}>Next renewal: </span>
              <strong style={{ color: '#f9fafb' }}>{renewalDate}</strong>
            </Text>
            <Hr style={{ borderColor: '#1f2937', margin: '20px 0' }} />
            <Button style={btn} href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`}>
              Go to Dashboard
            </Button>
          </Section>
          <Text style={muted}>Manage your subscription at any time from your dashboard.</Text>
        </Container>
      </Body>
    </Html>
  )
}

// ——————————————————————————————————————————————————
// 3. Draw Results Email (sent to all participants)
// ——————————————————————————————————————————————————
export function DrawResultsEmail({
  name, month, winningNumbers, userNumbers, matchCount, prizeAmount,
}: {
  name: string; month: string; winningNumbers: number[]; userNumbers: number[]; matchCount: number; prizeAmount: number | null;
}) {
  const isWinner = matchCount >= 3

  return (
    <Html>
      <Head />
      <Preview>{isWinner ? `🏆 You won £${prizeAmount} in the ${month} draw!` : `${month} draw results are in.`}</Preview>
      <Body style={base}>
        <Container style={container}>
          <Text style={logo}>⛳ GreenGive</Text>
          <Section style={card}>
            <Heading style={h1}>{isWinner ? `You matched ${matchCount}! 🏆` : `${month} Draw Results`}</Heading>
            <Text style={p}>Hi {name || 'there'}, the {month} monthly draw has been published.</Text>

            <Section style={{ backgroundColor: '#0f172a', borderRadius: '12px', padding: '20px', margin: '20px 0' }}>
              <Text style={{ ...p, margin: '0 0 10px', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Winning Numbers</Text>
              <Text style={{ fontSize: '28px', fontWeight: '800', color: '#10b981', letterSpacing: '8px', margin: '0' }}>
                {winningNumbers.join('  ')}
              </Text>
            </Section>

            <Section style={{ backgroundColor: '#0f172a', borderRadius: '12px', padding: '20px', margin: '20px 0' }}>
              <Text style={{ ...p, margin: '0 0 10px', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Numbers</Text>
              <Text style={{ fontSize: '28px', fontWeight: '800', color: '#818cf8', letterSpacing: '8px', margin: '0' }}>
                {userNumbers.join('  ')}
              </Text>
            </Section>

            {isWinner ? (
              <>
                <Text style={{ ...p, color: '#fbbf24', fontWeight: '600' }}>
                  🎉 Congratulations! You matched {matchCount} numbers and won <strong>£{prizeAmount}</strong>.
                </Text>
                <Text style={p}>A separate email with payment instructions is on its way. Check your winners dashboard to upload your proof.</Text>
                <Button style={btn} href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`}>View Winnings</Button>
              </>
            ) : (
              <>
                <Text style={p}>You matched {matchCount} number{matchCount !== 1 ? 's' : ''} this month. Keep playing — next month's draw is already open!</Text>
                <Button style={{ ...btn, backgroundColor: '#4f46e5' }} href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`}>Submit New Scores</Button>
              </>
            )}
          </Section>
          <Text style={muted}>Draw results are final. For questions, reply to this email.</Text>
        </Container>
      </Body>
    </Html>
  )
}

// ——————————————————————————————————————————————————
// 4. Winner Notification Email
// ——————————————————————————————————————————————————
export function WinnerNotificationEmail({
  name, matchType, prizeAmount, proofUploadUrl,
}: {
  name: string; matchType: string; prizeAmount: number; proofUploadUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>🏆 You've won £{prizeAmount} — claim your prize now.</Preview>
      <Body style={base}>
        <Container style={container}>
          <Text style={logo}>⛳ GreenGive</Text>
          <Section style={card}>
            <Heading style={h1}>Prize Confirmed 🏆</Heading>
            <Text style={p}>
              Congratulations {name || 'Champion'}! Your <strong style={{ color: '#fbbf24' }}>{matchType}</strong> win has been confirmed. Here are your payment details:
            </Text>
            <Section style={{ backgroundColor: '#0f172a', borderRadius: '12px', padding: '24px', margin: '20px 0', textAlign: 'center' as const }}>
              <Text style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '1px', margin: '0 0 8px' }}>Prize Amount</Text>
              <Text style={{ color: '#10b981', fontSize: '48px', fontWeight: '800', margin: '0', letterSpacing: '-1px' }}>£{prizeAmount.toFixed(2)}</Text>
            </Section>
            <Text style={p}>
              To claim your prize, please upload proof of your golf score (scorecard photo) using the button below. Our team will review and process payment within 5 business days.
            </Text>
            <Button style={{ ...btn, backgroundColor: '#fbbf24', color: '#000' }} href={proofUploadUrl}>
              Upload Proof & Claim Prize
            </Button>
            <Hr style={{ borderColor: '#1f2937', margin: '24px 0' }} />
            <Text style={{ ...p, fontSize: '13px' }}>
              <strong style={{ color: '#f9fafb' }}>Payment method:</strong> Bank transfer. You'll be contacted for banking details once proof is verified.
            </Text>
          </Section>
          <Text style={muted}>If you believe this is an error, please reply to this email immediately.</Text>
        </Container>
      </Body>
    </Html>
  )
}

// ——————————————————————————————————————————————————
// 5. Renewal Reminder Email
// ——————————————————————————————————————————————————
export function RenewalReminderEmail({ name, plan, renewalDate }: { name: string; plan: string; renewalDate: string }) {
  return (
    <Html>
      <Head />
      <Preview>Your GreenGive subscription renews in 3 days.</Preview>
      <Body style={base}>
        <Container style={container}>
          <Text style={logo}>⛳ GreenGive</Text>
          <Section style={card}>
            <Heading style={h1}>Renewal Reminder 📅</Heading>
            <Text style={p}>
              Hi {name || 'there'}, your <strong style={{ color: '#10b981' }}>{plan === 'yearly' ? 'Yearly' : 'Monthly'}</strong> GreenGive subscription renews on <strong style={{ color: '#f9fafb' }}>{renewalDate}</strong>.
            </Text>
            <Text style={p}>
              Your payment method on file will be charged automatically. If you'd like to make any changes before renewal, visit your dashboard now.
            </Text>
            <Button style={btn} href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings`}>
              Manage Subscription
            </Button>
          </Section>
          <Text style={muted}>You're receiving this reminder because your subscription renews within 3 days. To cancel, visit your dashboard settings.</Text>
        </Container>
      </Body>
    </Html>
  )
}
