import { FastifyPluginAsync } from 'fastify'
import { roomManager } from '../services/simple-room-manager.js'

export const roomRoutes: FastifyPluginAsync = async (fastify) => {
  // WebSocket endpoint for tldraw sync
  fastify.register(async function (fastify) {
    fastify.get('/rooms/:roomId/connect', { websocket: true }, (connection, req) => {
      const { roomId } = req.params as { roomId: string }
      
      if (!roomId) {
        connection.socket.close(1003, 'Room ID required')
        return
      }
      
      console.log(`Client connecting to room: ${roomId}`)
      
      const room = roomManager.getOrCreateRoom(roomId)
      
      // Add client to room
      room.addClient(connection.socket)
      
      connection.socket.on('close', () => {
        console.log(`Client disconnected from room: ${roomId}`)
        room.removeClient(connection.socket)
      })
      
      connection.socket.on('error', (error) => {
        console.error(`WebSocket error in room ${roomId}:`, error)
      })
    })
  })

  // REST endpoints for room management
  fastify.get('/rooms/:roomId', async (request, reply) => {
    const { roomId } = request.params as { roomId: string }
    const room = roomManager.getOrCreateRoom(roomId)
    
    return {
      roomId,
      clientCount: room.getClientCount(),
      // snapshot: room.getCurrentSnapshot(), // Commented out for now
    }
  })

  fastify.get('/admin/rooms', async (request, reply) => {
    return {
      totalRooms: roomManager.getRoomCount(),
      activeRooms: roomManager.getActiveRooms(),
    }
  })
}