import Link from 'next/link'

const links = {
  Platform: [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Charities', href: '/charities' },
    { label: 'Prize draws', href: '/#prizes' },
    { label: 'Pricing', href: '/#pricing' },
  ],
  Account: [
    { label: 'Sign up', href: '/signup' },
    { label: 'Sign in', href: '/login' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/60">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-black text-white tracking-tight">⛳ Digital Horse</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-[220px]">
              Golf that gives back. Every subscription directly supports charities that matter.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{section}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} Digital Horse Ltd. All rights reserved.
          </p>
          <p className="text-slate-700 text-xs">
            Not affiliated with any golf governing body. Prize draws subject to eligibility.
          </p>
        </div>
      </div>
    </footer>
  )
}
