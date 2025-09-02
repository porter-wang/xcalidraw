// packages/shared/src/types/index.ts

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

// Core entity: Personal board
export interface Board {
  id: string
  name: string
  description?: string
  ownerId: string
  isTemplate: boolean
  createdAt: string
  updatedAt: string
  
  // Relations (when populated)
  owner?: User
  shares?: BoardShare[]
  isShared?: boolean  // Computed field
  collaboratorCount?: number  // Computed field
}

// Optional: When board is shared
export interface BoardShare {
  id: string
  boardId: string
  userId: string
  role: 'VIEWER' | 'EDITOR' | 'ADMIN'
  canEdit: boolean
  canShare: boolean
  expiresAt?: string
  createdAt: string
  
  // Relations
  board?: Board
  user?: User
}

// Optional: Active collaboration session
export interface CollabSession {
  id: string
  boardId: string
  isActive: boolean
  connectedUsers?: {
    userId: string
    name: string
    cursor?: { x: number; y: number }
    color: string
  }[]
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  userId: string
  expiresAt: string
  createdAt: string
}

// API Request/Response types
export interface CreateBoardRequest {
  name: string
  description?: string
  isTemplate?: boolean
}

export interface ShareBoardRequest {
  email: string
  role: 'VIEWER' | 'EDITOR' | 'ADMIN'
  canEdit?: boolean
  canShare?: boolean
  expiresAt?: string
}

export interface BoardListResponse {
  boards: Board[]
  total: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}