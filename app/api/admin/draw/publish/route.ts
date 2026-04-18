import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendDrawResultsEmail, sendWinnerNotificationEmail } from '@/lib/email'
import { calculateMatches } from '@/lib/drawEngine'
import { Draw, User } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const { drawId } = await req.json()

    if (!drawId) {
      return NextResponse.json({ error: 'drawId required' }, { status: 400 })
    }

    // Fetch the draw
    const { data: draw, error: drawError } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single()

    consttypedDraw = draw as Draw | null

    if (drawError || !typedDraw) {
      return NextResponse.json({ error: 'Draw not found' }, { status: 404 })
    }

    if (typedDraw.status === 'published') {
      return NextResponse.json({ error: 'Draw already published' }, { status: 400 })
    }

    // Get all active subscribers with their scores and user details
    const { data: activeSubs } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, plan, users(email, full_name)')
      .eq('status', 'active')

    // Get scores for all active users
    const { data: allScores } = await supabaseAdmin
      .from('scores')
      .select('user_id, score')

    // Group scores by user
    const scoresByUser: Record<string, number[]> = {}
    allScores?.forEach((s) => {
      if (!scoresByUser[s.user_id]) scoresByUser[s.user_id] = []
      scoresByUser[s.user_id].push(s.score)
    })

    const winningNumbers: number[] = typedDraw.winning_numbers
    const month = new Date(typedDraw.month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

    const winnerInserts: { draw_id: string; user_id: string; match_type: string; prize_amount: number; status: string }[] = []
    const emailPromises: Promise<void>[] = []

    for (const sub of (activeSubs || [])) {
      const user = (sub as unknown as { users: User }).users
      const userNumbers = scoresByUser[sub.user_id] || []
      const matchCount = calculateMatches(winningNumbers, userNumbers)

      const prizeAmount = matchCount >= 5 ? Number(typedDraw.jackpot_amount) :
                          matchCount >= 4 ? Number(typedDraw.pool_4match) :
                          matchCount >= 3 ? Number(typedDraw.pool_3match) : null

      // Send draw results email to all participants
      if (user?.email && userNumbers.length > 0) {
        emailPromises.push(
          sendDrawResultsEmail(user.email, {
            name: user.full_name || '',
            month,
            winningNumbers,
            userNumbers,
            matchCount,
            prizeAmount,
          })
        )
      }

      // Register winner + send winner notification
      if (matchCount >= 3 && prizeAmount !== null) {
        const matchType = `${matchCount}match`
        winnerInserts.push({
          draw_id: drawId,
          user_id: sub.user_id,
          match_type: matchType,
          prize_amount: prizeAmount,
          status: 'pending',
        })

        if (user?.email) {
          const proofUploadUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
          emailPromises.push(
            sendWinnerNotificationEmail(user.email, {
              name: user.full_name || '',
              matchType,
              prizeAmount,
              proofUploadUrl,
            })
          )
        }
      }
    }

    // Insert winners
    if (winnerInserts.length > 0) {
      await supabaseAdmin.from('winners').insert(winnerInserts)
    }

    // Publish the draw
    await supabaseAdmin
      .from('draws')
      .update({ status: 'published' })
      .eq('id', drawId)

    // Fire all emails (non-blocking — errors are caught inside sendEmail)
    await Promise.allSettled(emailPromises)

    return NextResponse.json({
      ok: true,
      drawId,
      winnersCount: winnerInserts.length,
      emailsSent: emailPromises.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Publish draw error]', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
