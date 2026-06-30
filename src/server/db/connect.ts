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

  const promise = mongoose.connect(env.MONGODB_URI, {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })

  // Don't cache a rejected promise — next call will retry
  promise.catch(() => {
    global._mongooseConn = undefined
  })

  global._mongooseConn = promise
  return promise
}
