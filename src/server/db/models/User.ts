import 'server-only'
import mongoose, { Schema, type Document, type Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  settings: {
    baseCurrency: string
    theme: 'light' | 'dark' | 'system'
    locale: string
  }
  subscription: {
    status: 'pending' | 'active' | 'cancelled'
    activatedAt?: Date
    expiresAt?: Date
    plan?: string
    paymentRef?: string
  }
  refreshTokenHash?: string
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    settings: {
      baseCurrency: { type: String, default: 'MAD' },
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      locale: { type: String, default: 'en' },
    },
    subscription: {
      status: { type: String, enum: ['pending', 'active', 'cancelled'], default: 'pending' },
      activatedAt: { type: Date },
      expiresAt: { type: Date },
      plan: { type: String },
      paymentRef: { type: String },
    },
    refreshTokenHash: { type: String, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
)

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', userSchema)
