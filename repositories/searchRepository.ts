/**
 * Chanomhub SDK - Search Repository
 */

import type { GraphQLFetcher } from '../client';
import type { ArticleListItem } from '../types/article';
import type { PaginatedResponse } from '../types/common';

/** Search options */
export interface SearchOptions {
    /** Filter by tag */
    tag?: string;
    /** Filter by platform */
    platform?: string;
    /** Filter by category */
    category?: string;
    /** Filter by engine */
    engine?: string;
    /** Filter by sequential code */
    sequentialCode?: string;
    /** Filter by author name */
    author?: string;
    /** Results per page */
    limit?: number;
    /** Page offset */
    offset?: number;
}

export interface SearchRepository {
    /** Search articles by query string */
    articles(query: string, options?: SearchOptions): Promise<PaginatedResponse<ArticleListItem>>;
}

/**
 * Field query for search results (minimal for performance)
 */
const SEARCH_FIELDS = `
    id
    title
    slug
    description
    ver
    mainImage
    coverImage
    createdAt
    updatedAt
    favoritesCount
    sequentialCode
    author {
        name
        image
    }
    tags {
        id
        name
    }
    engine {
        id
        name
    }
`;

/**
 * Creates a search repository with the given GraphQL client
 */
export function createSearchRepository(fetcher: GraphQLFetcher): SearchRepository {
    async function articles(
        query: string,
        options: SearchOptions = {},
    ): Promise<PaginatedResponse<ArticleListItem>> {
        const { limit = 12, offset = 0, tag, platform, category, engine, sequentialCode, author } = options;

        // Build filter parts
        const filterParts: string[] = [];
        filterParts.push(`q: "${query.replace(/"/g, '\\"')}"`);
        if (tag) filterParts.push(`tag: "${tag}"`);
        if (platform) filterParts.push(`platform: "${platform}"`);
        if (category) filterParts.push(`category: "${category}"`);
        if (engine) filterParts.push(`engine: "${engine}"`);
        if (sequentialCode) filterParts.push(`sequentialCode: "${sequentialCode}"`);
        if (author) filterParts.push(`author: "${author}"`);

        const filterArg = `filter: { ${filterParts.join(', ')} }`;

        const graphqlQuery = `query SearchArticles {
            articles(${filterArg}, limit: ${limit}, offset: ${offset}, status: PUBLISHED) {
                ${SEARCH_FIELDS}
            }
            articlesCount(${filterArg})
        }`;

        const { data, errors } = await fetcher<{
            articles: ArticleListItem[];
            articlesCount: number;
        }>(graphqlQuery, {}, { operationName: 'SearchArticles' });

        if (errors || !data) {
            console.error('Failed to search articles:', errors);
            return { items: [], total: 0, page: 1, pageSize: limit };
        }

        const page = Math.floor(offset / limit) + 1;

        return {
            items: data.articles || [],
            total: data.articlesCount || 0,
            page,
            pageSize: limit,
        };
    }

    return {
        articles,
    };
}
