import 'server-only'
import mongoose from 'mongoose'
import { env } from '@/lib/env'

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: Promise<typeof mongoose> | undefined
}

export async function connectDB(): Promise<typeof mongoose> {
  if (global._mongooseConn) {
    return global._mongooseConn
  }

  global._mongooseConn = mongoose.connect(env.MONGODB_URI, {
    bufferCommands: false,
  })

  return global._mongooseConn
}
