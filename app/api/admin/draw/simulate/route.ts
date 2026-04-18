import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { randomDraw, weightedDraw, calculateMatches, calculatePrizes } from '@/lib/drawEngine'

export async function POST(req: Request) {
  try {
    const { drawType } = await req.json()

    // 1. Get active subscriptions and calculate revenue
    const { data: subs, error: subsError } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, plan')
      .eq('status', 'active')
      
    if (subsError) throw subsError

    const activeUserIds = new Set((subs || []).map(s => s.user_id))
    let totalRevenue = 0
    for (const sub of (subs || [])) {
      if (sub.plan === 'yearly') totalRevenue += 100 / 12 // Prorated yearly impact to monthly pool
      else totalRevenue += 10 // Exact monthly cost
    }

    // 2. Load and filter scores exclusively for active subscribers 
    const { data: scores } = await supabaseAdmin
      .from('scores')
      .select('user_id, score')

    const userEntries: Record<string, number[]> = {}
    const allScores: number[] = []

    for (const s of scores || []) {
      if (activeUserIds.has(s.user_id)) {
        if (!userEntries[s.user_id]) userEntries[s.user_id] = []
        if (userEntries[s.user_id].length < 5) {
          userEntries[s.user_id].push(s.score)
        }
        allScores.push(s.score)
      }
    }

    // Filter down to valid entries
    const validEntries = Object.entries(userEntries).filter(([, nums]) => nums.length > 0)

    // 3. Initiate engine simulation mechanics
    const winningNumbers = drawType === 'weighted' 
      ? weightedDraw(allScores) 
      : randomDraw()

    let match5 = 0
    let match4 = 0
    let match3 = 0

    const userMatches: Record<string, number> = {}

    for (const [userId, nums] of validEntries) {
      const matches = calculateMatches(winningNumbers, nums)
      userMatches[userId] = matches
      if (matches === 5) match5++
      else if (matches === 4) match4++
      else if (matches === 3) match3++
    }

    // 4. Trace the rollover logic
    let previousJackpot = 0
    const { data: lastDraw } = await supabaseAdmin
      .from('draws')
      .select('id, jackpot_amount')
      .eq('status', 'published')
      .order('month', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastDraw) {
      const { count } = await supabaseAdmin
        .from('winners')
        .select('*', { count: 'exact', head: true })
        .eq('draw_id', lastDraw.id)
        .eq('match_type', '5match')
        
      if (count === 0) previousJackpot = Number(lastDraw.jackpot_amount)
    }

    // 5. Structure payload via Engine algorithm
    const prizes = calculatePrizes(totalRevenue, previousJackpot, { match5, match4, match3 })

    const thisMonth = new Date()
    thisMonth.setDate(1) 
    
    // 6. Deposit to architecture as 'simulated'
    const { data: newDraw, error: drawError } = await supabaseAdmin
      .from('draws')
      .insert({
        month: thisMonth.toISOString().split('T')[0],
        status: 'simulated',
        draw_type: drawType,
        winning_numbers: winningNumbers,
        jackpot_amount: prizes.jackpotAmount,
        pool_4match: prizes.pool4Match,
        pool_3match: prizes.pool3Match
      })
      .select()
      .single()

    if (drawError) throw drawError

    const drawEntriesToInsert = validEntries.map(([userId, nums]) => ({
      draw_id: newDraw.id,
      user_id: userId,
      numbers: nums
    }))

    if (drawEntriesToInsert.length > 0) {
      await supabaseAdmin.from('draw_entries').insert(drawEntriesToInsert)
    }
    
    return NextResponse.json({
      draw: newDraw,
      stats: {
        totalRevenue,
        ...prizes,
        match5Winners: match5,
        match4Winners: match4,
        match3Winners: match3
      }
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
