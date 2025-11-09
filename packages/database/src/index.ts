import { PrismaClient } from './generated/index.js'

export const db = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
})

export * from './generated/index.js' 
export type { User, Room, RoomMember, Session } from './generated/index.js'