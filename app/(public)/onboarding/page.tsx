import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CharitySelector from '@/components/charity-selector'

export default async function OnboardingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: charities } = await supabase.from('charities').select('*')

  return (
    <div className="min-h-screen bg-slate-900 p-8 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Select Your Charity</h1>
        <p className="mt-4 text-xl text-slate-400 mb-10">
          Before entering the dashboard, please select the charity that will receive your contribution if you win!
        </p>
        <CharitySelector charities={charities || []} />
      </div>
    </div>
  )
}
