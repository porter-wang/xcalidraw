const API_BASE = '/api'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  username: string
}

class ApiClient {
  private getAuthHeader(token?: string): Record<string, string> {
    if (token) {
      return { Authorization: `Bearer ${token}` }
    }
    return {}
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new Error('Login failed')
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()