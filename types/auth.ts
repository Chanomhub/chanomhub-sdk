/**
 * Chanomhub SDK - Auth Types
 */

import type { User } from './user';

/** Supported OAuth providers */
export type OAuthProvider = 'google' | 'discord' | 'github' | 'facebook';

/** OAuth redirect options */
export interface OAuthOptions {
    /** URL to redirect to after OAuth */
    redirectTo?: string;
    /** Additional scopes to request */
    scopes?: string;
}

/** Login response from backend after token exchange */
export interface LoginResponse {
    user: User;
    token: string;
    refreshToken: string;
}

/** Token refresh response from backend */
export interface RefreshResponse {
    token: string;
    refreshToken?: string;
}

/** Auth session state */
export interface AuthSession {
    user: User;
    token: string;
    refreshToken: string;
    expiresAt?: number;
}

/** Supabase session (minimal type for SDK use) */
export interface SupabaseSession {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
    user: {
        id: string;
        email?: string;
    };
}

/** Backend login request */
export interface LoginSupabaseRequest {
    accessToken: string;
}

/** Backend refresh token request */
export interface RefreshTokenRequest {
    refreshToken: string;
}
