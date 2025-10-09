/**
 * Authentication Manager for Lattice MCP SDK
 * 
 * Handles API key authentication and token management.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { AuthenticationError } from './exceptions';

export interface AuthInfo {
  has_api_key: boolean;
  has_token: boolean;
  token_expired: boolean | null;
  token_expires_at: string | null;
  is_authenticated: boolean;
}

export interface CredentialsData {
  api_key?: string;
  token?: string;
  token_expires_at?: string;
}

/**
 * Manages authentication for the Lattice MCP SDK
 * 
 * Supports:
 * - API key authentication
 * - Token caching and refresh
 * - Credential storage
 */
export class AuthManager {
  private apiKey?: string;
  private token?: string;
  private tokenExpiresAt?: Date;
  private credentialsPath: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.LATTICE_API_KEY;
    
    // Credential storage path
    const homeDir = os.homedir();
    const latticeDir = path.join(homeDir, '.lattice');
    this.credentialsPath = path.join(latticeDir, 'credentials.json');
    
    // Ensure .lattice directory exists
    if (!fs.existsSync(latticeDir)) {
      fs.mkdirSync(latticeDir, { recursive: true });
    }
    
    // Load stored credentials
    this.loadCredentials();
  }

  /**
   * Set the API key for authentication
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.saveCredentials();
  }

  /**
   * Get the current API key
   */
  getApiKey(): string | undefined {
    return this.apiKey;
  }

  /**
   * Get authentication headers for API requests
   */
  async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    } else if (this.token && !this.isTokenExpired()) {
      headers['Authorization'] = `Bearer ${this.token}`;
    } else {
      throw new AuthenticationError('No valid authentication credentials available');
    }

    return headers;
  }

  /**
   * Set JWT token with optional expiration
   */
  setToken(token: string, expiresIn?: number): void {
    this.token = token;

    if (expiresIn) {
      this.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
    } else {
      // Default to 1 hour if no expiration provided
      this.tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    }

    this.saveCredentials();
  }

  /**
   * Clear the current token
   */
  clearToken(): void {
    this.token = undefined;
    this.tokenExpiresAt = undefined;
    this.saveCredentials();
  }

  /**
   * Check if the current token is expired
   */
  private isTokenExpired(): boolean {
    if (!this.tokenExpiresAt) {
      return true;
    }

    // Add 5 minute buffer for token refresh
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() >= (this.tokenExpiresAt.getTime() - bufferTime);
  }

  /**
   * Load credentials from storage
   */
  private loadCredentials(): void {
    try {
      if (fs.existsSync(this.credentialsPath)) {
        const data = fs.readFileSync(this.credentialsPath, 'utf8');
        const credentials: CredentialsData = JSON.parse(data);

        this.apiKey = this.apiKey || credentials.api_key;
        this.token = credentials.token;

        if (credentials.token_expires_at) {
          this.tokenExpiresAt = new Date(credentials.token_expires_at);
        }
      }
    } catch (error) {
      console.warn(`Failed to load credentials: ${error}`);
    }
  }

  /**
   * Save credentials to storage
   */
  private saveCredentials(): void {
    try {
      const data: CredentialsData = {
        api_key: this.apiKey,
        token: this.token,
        token_expires_at: this.tokenExpiresAt?.toISOString()
      };

      fs.writeFileSync(this.credentialsPath, JSON.stringify(data, null, 2));

      // Set secure permissions (readable only by owner) - Unix/Linux only
      if (process.platform !== 'win32') {
        fs.chmodSync(this.credentialsPath, 0o600);
      }
    } catch (error) {
      console.warn(`Failed to save credentials: ${error}`);
    }
  }

  /**
   * Check if we have valid authentication credentials
   */
  isAuthenticated(): boolean {
    return !!(
      this.apiKey || 
      (this.token && !this.isTokenExpired())
    );
  }

  /**
   * Get information about current authentication state
   */
  getAuthInfo(): AuthInfo {
    return {
      has_api_key: !!this.apiKey,
      has_token: !!this.token,
      token_expired: this.token ? this.isTokenExpired() : null,
      token_expires_at: this.tokenExpiresAt?.toISOString() || null,
      is_authenticated: this.isAuthenticated()
    };
  }

  /**
   * Get the current token
   */
  getToken(): string | undefined {
    return this.token;
  }

  /**
   * Get token expiration date
   */
  getTokenExpiresAt(): Date | undefined {
    return this.tokenExpiresAt;
  }
}