/**
 * Chanomhub SDK - Auth Repository
 *
 * Handles OAuth authentication via Supabase and token exchange with backend.
 */

import type { ChanomhubConfig } from '../config';
import type { RestFetcher } from '../client';
import type {
    OAuthProvider,
    OAuthOptions,
    LoginResponse,
    RefreshResponse,
    SupabaseSession,
    LoginSupabaseRequest,
    RefreshTokenRequest,
} from '../types/auth';

// Type for Supabase client (optional dependency)
type SupabaseClient = {
    auth: {
        signInWithOAuth: (options: {
            provider: OAuthProvider;
            options?: { redirectTo?: string; scopes?: string };
        }) => Promise<{ data: unknown; error: Error | null }>;
        signOut: () => Promise<{ error: Error | null }>;
        getSession: () => Promise<{
            data: { session: SupabaseSession | null };
            error: Error | null;
        }>;
    };
};

export interface AuthRepository {
    /** Check if Supabase OAuth is configured and available */
    isOAuthEnabled(): boolean;

    /** Sign in with Google OAuth - redirects to Google login page */
    signInWithGoogle(options?: OAuthOptions): Promise<void>;

    /** Sign in with any supported OAuth provider */
    signInWithProvider(provider: OAuthProvider, options?: OAuthOptions): Promise<void>;

    /**
     * Handle OAuth callback after redirect back from provider.
     * Exchanges Supabase access token for backend JWT.
     * Call this on your OAuth callback page.
     */
    handleCallback(): Promise<LoginResponse | null>;

    /** Sign out from Supabase (clears Supabase session only) */
    signOut(): Promise<void>;

    /** Refresh the backend access token using refresh token */
    refreshToken(refreshToken: string): Promise<RefreshResponse | null>;

    /** Get current Supabase session (if any) */
    getSupabaseSession(): Promise<SupabaseSession | null>;
}

/**
 * Try to dynamically import @supabase/supabase-js
 * Returns null if not installed
 */
async function tryGetSupabaseClient(config: ChanomhubConfig): Promise<SupabaseClient | null> {
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
        return null;
    }

    try {
        // Dynamic import to handle optional dependency
        const { createClient } = await import('@supabase/supabase-js');
        return createClient(config.supabaseUrl, config.supabaseAnonKey) as unknown as SupabaseClient;
    } catch {
        console.warn(
            'Supabase client not available. Install @supabase/supabase-js to enable OAuth.',
        );
        return null;
    }
}

/**
 * Creates an auth repository for OAuth operations
 *
 * @param fetcher - REST API fetcher
 * @param config - SDK configuration with optional Supabase settings
 */
export function createAuthRepository(fetcher: RestFetcher, config: ChanomhubConfig): AuthRepository {
    // Cache the Supabase client promise
    let supabaseClientPromise: Promise<SupabaseClient | null> | null = null;

    async function getSupabaseClient(): Promise<SupabaseClient | null> {
        if (!supabaseClientPromise) {
            supabaseClientPromise = tryGetSupabaseClient(config);
        }
        return supabaseClientPromise;
    }

    function isOAuthEnabled(): boolean {
        return Boolean(config.supabaseUrl && config.supabaseAnonKey);
    }

    async function signInWithProvider(
        provider: OAuthProvider,
        options: OAuthOptions = {},
    ): Promise<void> {
        const client = await getSupabaseClient();

        if (!client) {
            throw new Error(
                'Supabase is not configured. Please provide supabaseUrl and supabaseAnonKey in config, ' +
                'and install @supabase/supabase-js package.',
            );
        }

        const { error } = await client.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: options.redirectTo,
                scopes: options.scopes,
            },
        });

        if (error) {
            console.error(`OAuth sign-in error (${provider}):`, error.message);
            throw error;
        }

        // Browser will redirect to OAuth provider
    }

    async function signInWithGoogle(options: OAuthOptions = {}): Promise<void> {
        return signInWithProvider('google', options);
    }

    async function handleCallback(): Promise<LoginResponse | null> {
        const client = await getSupabaseClient();

        if (!client) {
            throw new Error('Supabase is not configured for OAuth callback handling.');
        }

        // Get the session that Supabase created from the OAuth callback
        const { data, error } = await client.auth.getSession();

        if (error) {
            console.error('Failed to get Supabase session:', error.message);
            return null;
        }

        if (!data.session) {
            console.error('No Supabase session found. User may not have completed OAuth flow.');
            return null;
        }

        // Exchange Supabase token for backend JWT
        const { data: loginData, error: loginError } = await fetcher<LoginResponse>(
            '/api/users/login-supabase',
            {
                method: 'POST',
                body: {
                    accessToken: data.session.access_token,
                },
            },
        );

        if (loginError) {
            console.error('Failed to exchange token with backend:', loginError);
            return null;
        }

        return loginData;
    }

    async function signOut(): Promise<void> {
        const client = await getSupabaseClient();

        if (client) {
            const { error } = await client.auth.signOut();
            if (error) {
                console.error('Supabase sign-out error:', error.message);
            }
        }

        // Note: This only clears Supabase session.
        // The frontend is responsible for clearing backend tokens from cookies/storage.
    }

    async function refreshToken(refreshToken: string): Promise<RefreshResponse | null> {
        const { data, error } = await fetcher<RefreshResponse>('/api/users/refresh-token', {
            method: 'POST',
            body: { refreshToken },
        });

        if (error) {
            console.error('Failed to refresh token:', error);
            return null;
        }

        return data;
    }

    async function getSupabaseSession(): Promise<SupabaseSession | null> {
        const client = await getSupabaseClient();

        if (!client) {
            return null;
        }

        const { data, error } = await client.auth.getSession();

        if (error) {
            console.error('Failed to get Supabase session:', error.message);
            return null;
        }

        return data.session;
    }

    return {
        isOAuthEnabled,
        signInWithGoogle,
        signInWithProvider,
        handleCallback,
        signOut,
        refreshToken,
        getSupabaseSession,
    };
}
