/**
 * Auth Repository Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuthRepository } from '../repositories/authRepository';
import type { ChanomhubConfig } from '../config';
import type { RestFetcher } from '../client';

describe('authRepository', () => {
    let mockFetcher: ReturnType<typeof vi.fn>;
    let config: ChanomhubConfig;

    beforeEach(() => {
        mockFetcher = vi.fn();
        config = {
            apiUrl: 'https://api.chanomhub.com',
            cdnUrl: 'https://cdn.chanomhub.com',
        };
    });

    describe('isOAuthEnabled', () => {
        it('should return false when Supabase is not configured', () => {
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);
            expect(auth.isOAuthEnabled()).toBe(false);
        });

        it('should return true when Supabase URL and key are provided', () => {
            config.supabaseUrl = 'https://test.supabase.co';
            config.supabaseAnonKey = 'test-anon-key';
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);
            expect(auth.isOAuthEnabled()).toBe(true);
        });

        it('should return false when only URL is provided', () => {
            config.supabaseUrl = 'https://test.supabase.co';
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);
            expect(auth.isOAuthEnabled()).toBe(false);
        });
    });

    describe('signInWithProvider', () => {
        it('should throw error when Supabase is not configured', async () => {
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);

            await expect(auth.signInWithProvider('google')).rejects.toThrow(
                'Supabase is not configured',
            );
        });
    });

    describe('signInWithGoogle', () => {
        it('should throw error when Supabase is not configured', async () => {
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);

            await expect(auth.signInWithGoogle()).rejects.toThrow('Supabase is not configured');
        });
    });

    describe('refreshToken', () => {
        it('should call refresh token endpoint with correct body', async () => {
            mockFetcher.mockResolvedValue({
                data: { token: 'new-token', refreshToken: 'new-refresh-token' },
                error: undefined,
            });

            const auth = createAuthRepository(mockFetcher as RestFetcher, config);
            const result = await auth.refreshToken('old-refresh-token');

            expect(mockFetcher).toHaveBeenCalledWith('/api/users/refresh-token', {
                method: 'POST',
                body: { refreshToken: 'old-refresh-token' },
            });
            expect(result).toEqual({ token: 'new-token', refreshToken: 'new-refresh-token' });
        });

        it('should return null when refresh fails', async () => {
            mockFetcher.mockResolvedValue({
                data: null,
                error: 'Token expired',
            });

            const auth = createAuthRepository(mockFetcher as RestFetcher, config);
            const result = await auth.refreshToken('expired-token');

            expect(result).toBeNull();
        });
    });

    describe('getSupabaseSession', () => {
        it('should return null when Supabase is not configured', async () => {
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);
            const session = await auth.getSupabaseSession();

            expect(session).toBeNull();
        });
    });

    // ============================================
    // React Native OAuth Tests
    // ============================================

    describe('signInWithGoogleNative', () => {
        it('should throw error when googleClientId is not provided', async () => {
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);

            await expect(
                auth.signInWithGoogleNative({ redirectUri: 'com.app://oauth' }),
            ).rejects.toThrow('Missing client ID for google');
        });

        it('should throw error when redirectUri is not provided', async () => {
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);

            await expect(
                auth.signInWithGoogleNative({
                    googleClientId: 'test-client-id',
                    redirectUri: '',
                }),
            ).rejects.toThrow('Missing redirectUri');
        });
    });

    describe('signInWithProviderNative', () => {
        it('should throw error when discordClientId is missing for discord', async () => {
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);

            await expect(
                auth.signInWithProviderNative('discord', { redirectUri: 'com.app://oauth' }),
            ).rejects.toThrow('Missing client ID for discord');
        });

        it('should throw error when githubClientId is missing for github', async () => {
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);

            await expect(
                auth.signInWithProviderNative('github', { redirectUri: 'com.app://oauth' }),
            ).rejects.toThrow('Missing client ID for github');
        });
    });

    describe('exchangeOAuthToken', () => {
        it('should exchange OAuth token with backend', async () => {
            mockFetcher.mockResolvedValue({
                data: {
                    user: { id: 1, username: 'test' },
                    token: 'backend-token',
                    refreshToken: 'backend-refresh',
                },
                error: undefined,
            });

            const auth = createAuthRepository(mockFetcher as RestFetcher, config);
            const result = await auth.exchangeOAuthToken({
                accessToken: 'oauth-access-token',
                idToken: 'google-id-token',
            });

            expect(mockFetcher).toHaveBeenCalledWith('/api/users/login-oauth', {
                method: 'POST',
                body: {
                    accessToken: 'google-id-token', // Uses idToken when available
                    provider: 'google',
                },
            });
            expect(result).toEqual({
                user: { id: 1, username: 'test' },
                token: 'backend-token',
                refreshToken: 'backend-refresh',
            });
        });

        it('should use accessToken when idToken is not available', async () => {
            mockFetcher.mockResolvedValue({
                data: { user: { id: 1 }, token: 'token', refreshToken: 'refresh' },
                error: undefined,
            });

            const auth = createAuthRepository(mockFetcher as RestFetcher, config);
            await auth.exchangeOAuthToken({ accessToken: 'discord-token' });

            expect(mockFetcher).toHaveBeenCalledWith('/api/users/login-oauth', {
                method: 'POST',
                body: {
                    accessToken: 'discord-token',
                    provider: 'oauth',
                },
            });
        });

        it('should return null when no token available', async () => {
            const auth = createAuthRepository(mockFetcher as RestFetcher, config);
            const result = await auth.exchangeOAuthToken({ accessToken: '' });

            expect(result).toBeNull();
        });
    });
});
