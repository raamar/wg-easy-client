import axios, { AxiosInstance, AxiosResponse } from 'axios'
import dotenv from 'dotenv'
import { WgClient } from './types'

dotenv.config()

export class WgEasyClient {
  private axiosInstance: AxiosInstance
  private baseURL: string
  private password: string
  private sessionCookie: string | null = null // Store session cookie

  /**
   *
   * @param {string?} baseURL
   * @param {string?} password
   */
  constructor(baseURL?: string, password?: string) {
    this.baseURL = baseURL || process.env.WG_EASY_URL || ''
    this.password = password || process.env.PASSWORD || ''

    if (!this.baseURL) {
      throw new Error('⚠️ Missing WG_EASY_URL in .env file!')
    }
    if (!this.password) {
      throw new Error('⚠️ Missing PASSWORD in .env file!')
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  /**
   * Authenticate and store session cookie (`connect.sid`)
   */
  private async authenticate(): Promise<void> {
    try {
      const response: AxiosResponse = await this.axiosInstance.post('/api/session', {
        password: this.password,
        remember: true,
      })

      if (response.data.success) {
        // Extract `connect.sid` cookie
        const setCookieHeader = response.headers['set-cookie']
        if (setCookieHeader) {
          const sessionCookie = setCookieHeader.find((cookie) => cookie.startsWith('connect.sid='))
          if (sessionCookie) {
            this.sessionCookie = sessionCookie.split(';')[0] // Extract only `connect.sid=value`
          }
        }
      } else {
        throw new Error('Authentication failed: Incorrect password or session issue.')
      }
    } catch (error: any) {
      console.error('❌ Authentication error:', error.response?.data?.message || error.message)
      throw new Error('Failed to authenticate. Check your password and server settings.')
    }
  }

  /**
   * Executes a request with authentication handling
   * @template T
   * @param {() => Promise<T>} request - The request function
   * @returns {Promise<T>}
   */
  private async requestWithAuth<T>(request: () => Promise<T>): Promise<T> {
    if (!this.sessionCookie) {
      await this.authenticate() // Ensure authentication before request
    }

    try {
      return await request()
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn('⚠️ Session expired, re-authenticating...')
        await this.authenticate()
        return await request()
      }
      throw error
    }
  }

  /**
   * Create a new WireGuard client
   * @param {string} name - Client name
   * @returns {Promise<string>}
   */
  async createClient(name: string): Promise<string> {
    return this.requestWithAuth(async () => {
      const response = await this.axiosInstance.post(
        '/api/wireguard/client',
        { name },
        { headers: { Cookie: this.sessionCookie } } // Attach session cookie
      )
      return response.data.success ? 'Client created successfully' : 'Error creating client'
    })
  }

  /**
   * Delete a WireGuard client
   * @param {string} clientId - Client ID
   * @returns {Promise<string>}
   */
  async deleteClient(clientId: string): Promise<string> {
    return this.requestWithAuth(async () => {
      const response = await this.axiosInstance.delete(`/api/wireguard/client/${clientId}`, {
        headers: { Cookie: this.sessionCookie },
      })
      return response.data.success ? 'Client deleted successfully' : 'Error deleting client'
    })
  }

  /**
   * Disable a WireGuard client
   * @param {string} clientId - Client ID
   * @returns {Promise<string>}
   */
  async disableClient(clientId: string): Promise<string> {
    return this.requestWithAuth(async () => {
      const response = await this.axiosInstance.post(
        `/api/wireguard/client/${clientId}/disable`,
        {},
        { headers: { Cookie: this.sessionCookie } }
      )
      return response.data.success ? 'Client disabled successfully' : 'Error disabling client'
    })
  }

  /**
   * Disable a WireGuard client
   * @param {string} clientId - Client ID
   * @returns {Promise<string>}
   */
  async enableClient(clientId: string): Promise<string> {
    return this.requestWithAuth(async () => {
      const response = await this.axiosInstance.post(
        `/api/wireguard/client/${clientId}/enable`,
        {},
        { headers: { Cookie: this.sessionCookie } }
      )
      return response.data.success ? 'Client enabled successfully' : 'Error enabling client'
    })
  }

  /**
   * Retrieve all WireGuard clients
   * @returns {Promise<WgClient[]>}
   */
  async getClients(): Promise<WgClient[]> {
    return this.requestWithAuth(async () => {
      const response = await this.axiosInstance.get('/api/wireguard/client', {
        headers: { Cookie: this.sessionCookie },
      })
      return response.data
    })
  }

  /**
   * Get client ID by name
   * @param {string} name - Client name
   * @returns {Promise<string | null>}
   */
  async getClientIdByName(name: string): Promise<string | null> {
    const clients = await this.getClients()
    const client = clients.find((c) => c.name === name)
    return client ? client.id : null
  }
}
