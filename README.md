# ⛳ GreenGive

> Golf that gives back — every round funds a charity you love.

GreenGive is a full-stack subscription platform where golfers log Stableford scores, enter monthly prize draws, and automatically contribute to charities they care about.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Framer Motion |
| **Database** | Supabase (PostgreSQL + RLS) |
| **Auth** | Supabase Auth |
| **Payments** | Stripe (Subscriptions) |
| **Email** | Resend + React Email |
| **Hosting** | Vercel |

---

## ✨ Features

### For Members
- 🎯 Submit up to 5 Stableford scores per month — each score = a draw number
- 🏆 Automatic entry into monthly prize draws (3-match, 4-match, 5-match jackpot)
- 💚 Choose a charity and set your contribution percentage (10–100%)
- 📊 Personal dashboard: scores, draw entries, winnings history, charity impact

### For Admins
- 🎰 Run random or weighted monthly draws
- 👥 User management: search, view subscriptions, suspend accounts
- 🏛️ Full charity CMS: add/edit/delete, upload images, toggle featured
- 🏆 Winners management: approve proofs, mark paid
- 📈 Reports: live subscriber stats, prize pool, charity contributions

### Platform
- ⚡ Transactional emails for all key events (Resend)
- 🔔 Renewal reminders via Vercel Cron (3 days before renewal)
- 🔒 Row-Level Security on all Supabase tables
- 📱 Fully responsive, mobile-first design

---

## 🏗️ Project Structure

```
GreenGive/
├── app/
│   ├── (auth)/          # Login, signup pages + server actions
│   ├── (dashboard)/     # Authenticated user dashboard
│   ├── (public)/        # Homepage, charities, onboarding, subscribe
│   ├── (admin)/         # Admin panel (role-gated)
│   └── api/             # Stripe webhook, draw engine, cron endpoints
├── components/
│   ├── dashboard/       # SubscriptionStatus, ScoreManager, CharityWidget...
│   ├── home/            # HeroSection, HowItWorks, ImpactSection...
│   └── admin/           # AdminSidebar
├── emails/              # React Email templates
├── lib/
│   ├── supabase/        # Server, client, admin, middleware clients
│   ├── drawEngine.ts    # Random/weighted draw logic + prize math
│   ├── email.ts         # Resend send wrappers
│   └── stripe.ts        # Stripe client
└── supabase/
    └── migrations/      # SQL schema + RLS policies
```

---

## 🛠️ Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/pranjal-ogg/GreenGive.git
cd GreenGive
npm install
```

### 2. Configure Environment
```bash
cp .env.local.example .env.local
```

Fill in your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
RESEND_API_KEY=re_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CRON_SECRET=your_random_secret
```

### 3. Run Database Migrations

Open your [Supabase SQL Editor](https://supabase.com/dashboard) and run these files in order:
1. `supabase/migrations/00000000000000_init.sql`
2. `supabase/migrations/00000000000001_charities.sql`
3. `supabase/migrations/00000000000002_admin_role.sql`
4. `supabase/migrations/00000000000003_subscription_reminder.sql`

Grant yourself admin access:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### 4. Run Locally
```bash
npm run dev
```

App runs at `http://localhost:3000`

---

## 🌍 Deployment (Vercel)

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel Dashboard
4. Set `NEXT_PUBLIC_SITE_URL` to your live domain
5. Update your Stripe webhook to `https://yourdomain.com/api/stripe/webhook`

> **Note:** Vercel Cron Jobs require the **Pro plan** ($20/mo) for the renewal reminder feature.

---

## 📧 Draw Prize Pool

| Match | Pool Share | Notes |
|---|---|---|
| 5 numbers | 40% | Jackpot — rolls over if unclaimed |
| 4 numbers | 35% | Split among all 4-match winners |
| 3 numbers | 25% | Split among all 3-match winners |

Pool = active subscribers × monthly fee equivalent

---

## 📄 License

MIT © 2026 Digital Horse
