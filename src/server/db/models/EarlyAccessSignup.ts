import 'server-only'
import mongoose, { Schema, type Document, type Model } from 'mongoose'

/**
 * Landing-page early-access email capture. Payments aren't accepted yet
 * (see docs/archive/payment-integration.md) — every "Get early access"
 * button on the landing page writes here instead of starting a checkout.
 *
 * To view signups: query this collection directly (mongosh / MongoDB
 * Compass / Atlas UI) — `db.earlyaccesssignups.find().sort({ createdAt: -1 })`.
 * No admin UI was built for this; add one if the list grows past what's
 * comfortable to check via a DB client.
 */
export interface IEarlyAccessSignup extends Document {
  email: string
  firstName?: string
  source: string
  createdAt: Date
  updatedAt: Date
}

const earlyAccessSignupSchema = new Schema<IEarlyAccessSignup>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    firstName: { type: String, trim: true, maxlength: 100 },
    // Where on the page the signup happened (navbar / pricing / cta / steps) —
    // useful later for seeing which CTA actually converts
    source: { type: String, default: 'unknown' },
  },
  { timestamps: true },
)

export const EarlyAccessSignup: Model<IEarlyAccessSignup> =
  mongoose.models.EarlyAccessSignup ?? mongoose.model<IEarlyAccessSignup>('EarlyAccessSignup', earlyAccessSignupSchema)
