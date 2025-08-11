import { TLSocketRoom } from '@tldraw/sync-core'
import { createTLSchema, defaultShapeSchemas, defaultBindingSchemas } from '@tldraw/tlschema'

// Simple in-memory room management (no Redis needed)
export class SimpleRoomManager {
  private rooms = new Map<string, TLSocketRoom>()
  private schema = createTLSchema({
    shapes: defaultShapeSchemas,
    bindings: defaultBindingSchemas,
  })

  getOrCreateRoom(roomId: string): TLSocketRoom {
    if (!this.rooms.has(roomId)) {
      const room = new TLSocketRoom({
        schema: this.schema,
        onDocumentChange: (snapshot) => {
          // TODO: Save to database periodically
          console.log(`Room ${roomId} changed, should save snapshot...`)
        },
        onUserPresenceChange: (presence) => {
          console.log(`User presence changed in room ${roomId}:`, presence)
        },
      })
      
      this.rooms.set(roomId, room)
      console.log(`Created new room: ${roomId}`)
    }
    
    return this.rooms.get(roomId)!
  }

  getRoomCount(): number {
    return this.rooms.size
  }

  getActiveRooms(): string[] {
    return Array.from(this.rooms.keys())
  }

  // Cleanup inactive rooms (call periodically)
  cleanupInactiveRooms() {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.getClientCount() === 0) {
        console.log(`Cleaning up empty room: ${roomId}`)
        this.rooms.delete(roomId)
      }
    }
  }
}

// Global instance
export const roomManager = new SimpleRoomManager()

// Cleanup every 5 minutes
setInterval(() => {
  roomManager.cleanupInactiveRooms()
}, 5 * 60 * 1000)