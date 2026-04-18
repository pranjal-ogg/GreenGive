import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { Charity, CharityContribution } from '@/lib/types'

import HeroSection from '@/components/home/HeroSection'
import HowItWorks from '@/components/home/HowItWorks'
import ImpactSection from '@/components/home/ImpactSection'
import PrizePool from '@/components/home/PrizePool'
import CharityPreview from '@/components/home/CharityPreview'
import PricingSection from '@/components/home/PricingSection'
import Footer from '@/components/home/Footer'

export const metadata = {
  title: 'GreenGive — Golf that gives back',
  description: 'Submit your Stableford scores, enter monthly prize draws, and support the charities you love. Every subscription directly funds charitable causes.',
}

export default async function HomePage() {
  const supabase = createClient()

  // Fetch data in parallel
  const [
    { data: featuredCharities },
    contributionsResult,
    featuredCharityResult,
  ] = await Promise.all([
    supabase.from('charities').select('*').eq('featured', true).limit(3),
    supabase.from('charity_contributions').select('amount'),
    supabase.from('charities').select('*').eq('featured', true).limit(1).maybeSingle(),
  ])

  const typedFeaturedCharities = featuredCharities as Charity[] | null
  const contributions = contributionsResult.data as CharityContribution[] | null
  const featuredCharity = featuredCharityResult.data as Charity | null
  const totalContributions = contributions?.reduce((sum: number, c) => sum + Number(c.amount), 0) ?? 0

  return (
    <main className="bg-[#080B14]">
      {/* 1. Hero — immediate, above fold */}
      <HeroSection />

      {/* 2. How it works */}
      <Suspense>
        <HowItWorks />
      </Suspense>

      {/* 3. Impact — DB-driven */}
      <Suspense>
        <ImpactSection
          totalContributions={totalContributions}
          featuredCharity={featuredCharity}
        />
      </Suspense>

      {/* 4. Prize pool explainer */}
      <Suspense>
        <PrizePool />
      </Suspense>

      {/* 5. Charity directory preview */}
      <Suspense>
        <CharityPreview charities={typedFeaturedCharities || []} />
      </Suspense>

      {/* 6. Pricing */}
      <Suspense>
        <PricingSection />
      </Suspense>

      {/* 7. Footer */}
      <Footer />
    </main>
  )
}
