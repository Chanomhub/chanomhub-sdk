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
    NativeOAuthConfig,
    NativeOAuthOptions,
    NativeOAuthResult,
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

    /** Sign in with Google OAuth - redirects to Google login page (Web only) */
    signInWithGoogle(options?: OAuthOptions): Promise<void>;

    /** Sign in with any supported OAuth provider (Web only) */
    signInWithProvider(provider: OAuthProvider, options?: OAuthOptions): Promise<void>;

    /**
     * Sign in with Google OAuth for React Native apps.
     * Uses react-native-app-auth under the hood.
     * @param nativeConfig - Native OAuth configuration with client IDs and redirect URI
     * @param options - Additional options like scopes
     * @returns Login response with user and tokens from backend
     */
    signInWithGoogleNative(
        nativeConfig: NativeOAuthConfig,
        options?: NativeOAuthOptions,
    ): Promise<LoginResponse | null>;

    /**
     * Sign in with any OAuth provider for React Native apps.
     * Uses react-native-app-auth under the hood.
     * @param provider - OAuth provider (google, discord, github)
     * @param nativeConfig - Native OAuth configuration
     * @param options - Additional options
     * @returns Login response with user and tokens from backend
     */
    signInWithProviderNative(
        provider: OAuthProvider,
        nativeConfig: NativeOAuthConfig,
        options?: NativeOAuthOptions,
    ): Promise<LoginResponse | null>;

    /**
     * Exchange OAuth token from react-native-app-auth with backend.
     * Use this if you handle the OAuth flow yourself.
     * @param oauthResult - Result from react-native-app-auth authorize()
     * @returns Login response with user and backend tokens
     */
    exchangeOAuthToken(oauthResult: NativeOAuthResult): Promise<LoginResponse | null>;

    /**
     * Handle OAuth callback after redirect back from provider.
     * Exchanges Supabase access token for backend JWT.
     * Call this on your OAuth callback page (Web only).
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

    // ============================================
    // React Native OAuth Methods
    // ============================================

    /** OAuth provider configurations */
    const OAUTH_CONFIGS: Record<
        OAuthProvider,
        { issuer: string; serviceConfiguration?: { authorizationEndpoint: string; tokenEndpoint: string }; defaultScopes: string[] }
    > = {
        google: {
            issuer: 'https://accounts.google.com',
            defaultScopes: ['openid', 'email', 'profile'],
        },
        discord: {
            serviceConfiguration: {
                authorizationEndpoint: 'https://discord.com/api/oauth2/authorize',
                tokenEndpoint: 'https://discord.com/api/oauth2/token',
            },
            issuer: '',
            defaultScopes: ['identify', 'email'],
        },
        github: {
            serviceConfiguration: {
                authorizationEndpoint: 'https://github.com/login/oauth/authorize',
                tokenEndpoint: 'https://github.com/login/oauth/access_token',
            },
            issuer: '',
            defaultScopes: ['read:user', 'user:email'],
        },
        facebook: {
            serviceConfiguration: {
                authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
                tokenEndpoint: 'https://graph.facebook.com/v18.0/oauth/access_token',
            },
            issuer: '',
            defaultScopes: ['email', 'public_profile'],
        },
    };

    function getClientIdForProvider(provider: OAuthProvider, nativeConfig: NativeOAuthConfig): string {
        switch (provider) {
            case 'google':
                return nativeConfig.googleClientId || '';
            case 'discord':
                return nativeConfig.discordClientId || '';
            case 'github':
                return nativeConfig.githubClientId || '';
            default:
                return '';
        }
    }

    async function signInWithProviderNative(
        provider: OAuthProvider,
        nativeConfig: NativeOAuthConfig,
        options: NativeOAuthOptions = {},
    ): Promise<LoginResponse | null> {
        const clientId = getClientIdForProvider(provider, nativeConfig);

        if (!clientId) {
            throw new Error(
                `Missing client ID for ${provider}. Please provide ${provider}ClientId in nativeConfig.`,
            );
        }

        if (!nativeConfig.redirectUri) {
            throw new Error('Missing redirectUri in nativeConfig.');
        }

        // Try to dynamically import react-native-app-auth
        let authorize: (config: Record<string, unknown>) => Promise<NativeOAuthResult>;
        try {
            const appAuth = await import('react-native-app-auth');
            authorize = appAuth.authorize;
        } catch {
            throw new Error(
                'react-native-app-auth is not installed. Please install it: npm install react-native-app-auth',
            );
        }

        const providerConfig = OAUTH_CONFIGS[provider];
        const scopes = options.scopes || providerConfig.defaultScopes;

        const authConfig: Record<string, unknown> = {
            clientId,
            redirectUrl: nativeConfig.redirectUri,
            scopes,
            usePKCE: options.usePKCE !== false, // Default to true
        };

        // Use issuer or serviceConfiguration
        if (providerConfig.issuer) {
            authConfig.issuer = providerConfig.issuer;
        } else if (providerConfig.serviceConfiguration) {
            authConfig.serviceConfiguration = providerConfig.serviceConfiguration;
        }

        // For Google iOS, use clientId specific config
        if (provider === 'google' && nativeConfig.googleIosClientId) {
            // iOS uses different clientId format
            authConfig.clientId = nativeConfig.googleIosClientId;
        }

        try {
            const result = await authorize(authConfig);
            return exchangeOAuthToken(result);
        } catch (error) {
            console.error(`Native OAuth error (${provider}):`, error);
            throw error;
        }
    }

    async function signInWithGoogleNative(
        nativeConfig: NativeOAuthConfig,
        options: NativeOAuthOptions = {},
    ): Promise<LoginResponse | null> {
        return signInWithProviderNative('google', nativeConfig, options);
    }

    async function exchangeOAuthToken(oauthResult: NativeOAuthResult): Promise<LoginResponse | null> {
        // Use idToken for Google (OpenID Connect) or accessToken for others
        const tokenToExchange = oauthResult.idToken || oauthResult.accessToken;

        if (!tokenToExchange) {
            console.error('No token available to exchange with backend');
            return null;
        }

        // Exchange OAuth token for backend JWT
        const { data, error } = await fetcher<LoginResponse>('/api/users/login-oauth', {
            method: 'POST',
            body: {
                accessToken: tokenToExchange,
                provider: oauthResult.idToken ? 'google' : 'oauth', // Backend needs to know provider
            },
        });

        if (error) {
            console.error('Failed to exchange OAuth token with backend:', error);
            return null;
        }

        return data;
    }

    return {
        isOAuthEnabled,
        signInWithGoogle,
        signInWithProvider,
        signInWithGoogleNative,
        signInWithProviderNative,
        exchangeOAuthToken,
        handleCallback,
        signOut,
        refreshToken,
        getSupabaseSession,
    };
}
