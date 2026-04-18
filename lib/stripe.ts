import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia', // Aligned securely with standard updated module typings
  appInfo: {
    name: 'Next.js App Router project',
    version: '0.1.0',
  },
})
