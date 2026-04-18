export function randomDraw(): number[] {
  const numbers = new Set<number>()
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1)
  }
  return Array.from(numbers).sort((a, b) => a - b)
}

export function weightedDraw(allUserScores: number[]): number[] {
  const counts: Record<number, number> = {}
  
  // Base weight of 1 applies to all possible numbers to ensure anything can be picked
  for (let i = 1; i <= 45; i++) counts[i] = 1

  // Increase weights based on user frequency
  for (const s of allUserScores) {
    if (s >= 1 && s <= 45) counts[s]++
  }

  const numbers = new Set<number>()
  while (numbers.size < 5) {
    const totalWeight = Object.entries(counts)
      .filter(([num]) => !numbers.has(Number(num))) // Exclude already picked specific numbers
      .reduce((sum, [, weight]) => sum + weight, 0)

    let random = Math.random() * totalWeight
    for (const [numStr, weight] of Object.entries(counts)) {
      const num = Number(numStr)
      if (numbers.has(num)) continue
      random -= weight
      if (random <= 0) {
        numbers.add(num)
        break
      }
    }
  }
  return Array.from(numbers).sort((a, b) => a - b)
}

export function calculateMatches(winningNumbers: number[], entryNumbers: number[]): number {
  const winSet = new Set(winningNumbers)
  let matches = 0
  for (const n of entryNumbers) {
    if (winSet.has(n)) matches++
  }
  return matches
}

export function calculatePrizes(
  totalRevenue: number,
  previousJackpot: number,
  winnerCounts: { match5: number; match4: number; match3: number }
) {
  // Pool math
  const jackpotAmount = (totalRevenue * 0.40) + previousJackpot
  const pool4Match = totalRevenue * 0.35
  const pool3Match = totalRevenue * 0.25

  let nextJackpot = 0

  if (winnerCounts.match5 === 0) {
    // Exact match failed, jackpot rolls over!
    nextJackpot = jackpotAmount
  }

  return {
    jackpotAmount, 
    pool4Match,
    pool3Match,
    nextJackpot,
    payoutPerMatch5: winnerCounts.match5 > 0 ? jackpotAmount / winnerCounts.match5 : 0,
    payoutPerMatch4: winnerCounts.match4 > 0 ? pool4Match / winnerCounts.match4 : 0,
    payoutPerMatch3: winnerCounts.match3 > 0 ? pool3Match / winnerCounts.match3 : 0,
  }
}
