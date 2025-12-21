/**
 * Chanomhub SDK - GraphQL Client
 * 
 * Framework-agnostic GraphQL client using standard fetch API.
 * Works with any JavaScript runtime that supports fetch.
 */

import type { ChanomhubConfig } from './config';
import type { GraphQLResponse } from './types/common';
import { transformImageUrlsDeep } from './transforms/imageUrl';

export interface FetchOptions {
    /** GraphQL operation name */
    operationName?: string;
    /** Cache duration in seconds (0 = no cache) */
    cacheSeconds?: number;
    /** Skip cache entirely */
    noCache?: boolean;
}

/**
 * Creates a GraphQL fetcher function with automatic image URL transformation
 * 
 * @param config - SDK configuration
 * @returns GraphQL fetch function
 */
export function createGraphQLClient(config: ChanomhubConfig) {
    return async function graphqlFetch<T>(
        query: string,
        variables: Record<string, unknown> = {},
        options: FetchOptions = {}
    ): Promise<GraphQLResponse<T>> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (config.token) {
            headers['Authorization'] = `Bearer ${config.token}`;
        }

        // Build fetch options - framework agnostic
        const fetchOptions: RequestInit = {
            method: 'POST',
            headers,
            body: JSON.stringify({
                query,
                variables,
                ...(options.operationName && { operationName: options.operationName }),
            }),
        };

        // Handle caching - use standard Cache-Control header approach
        // Note: Next.js and some other frameworks may extend RequestInit with 'next' property
        // We use a type-safe approach that works everywhere
        const useCache = !options.noCache && !config.token;
        const cacheSeconds = options.cacheSeconds ?? config.defaultCacheSeconds ?? 3600;

        if (!useCache || cacheSeconds === 0) {
            fetchOptions.cache = 'no-store';
        }

        try {
            const res = await fetch(`${config.apiUrl}/api/graphql`, fetchOptions);

            if (!res.ok) {
                const errorText = await res.text();
                console.error('GraphQL fetch error:', res.status, errorText);
                return {
                    data: null,
                    errors: [{ message: `HTTP ${res.status}: ${res.statusText}` }],
                };
            }

            const json = await res.json();

            if (json.errors) {
                console.error('GraphQL errors:', json.errors);
                return { data: null, errors: json.errors };
            }

            // Auto-transform all image URLs in the response
            const transformedData = transformImageUrlsDeep(json.data, config.cdnUrl) as T;

            return { data: transformedData };
        } catch (error) {
            console.error('GraphQL fetch exception:', error);
            return {
                data: null,
                errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }],
            };
        }
    };
}

export type GraphQLFetcher = ReturnType<typeof createGraphQLClient>;
