/**
 * Chanomhub SDK - Article Repository
 */

import type { GraphQLFetcher, FetchOptions } from '../client';
import type { Article, ArticleListItem, ArticleListOptions, ArticleWithDownloads } from '../types/article';
import type { ArticleStatus } from '../config';

// GraphQL Fragments for reuse
const ARTICLE_LIST_FIELDS = `
  id
  title
  slug
  description
  ver
  createdAt
  updatedAt
  mainImage
  coverImage
  favoritesCount
  favorited
  status
  sequentialCode
  engine {
    name
  }
  author {
    name
    image
  }
  creators {
    name
  }
  tags {
    name
  }
  platforms {
    name
  }
  categories {
    name
  }
  images {
    url
  }
`;

const ARTICLE_FULL_FIELDS = `
  id
  title
  slug
  description
  body
  ver
  createdAt
  updatedAt
  status
  engine
  mainImage
  backgroundImage
  coverImage
  favorited
  favoritesCount
  sequentialCode
  images {
    url
  }
  author {
    name
    bio
    image
    backgroundImage
    following
    socialMediaLinks {
      platform
      url
    }
  }
  creators {
    name
  }
  tags {
    name
  }
  platforms {
    name
  }
  categories {
    name
  }
  downloads {
    id
    name
    url
    isActive
    vipOnly
  }
  mods {
    name
    description
    creditTo
    downloadLink
    version
    status
    categories {
      name
    }
    images {
      url
    }
  }
  officialDownloadSources {
    name
    url
    status
  }
`;

export interface ArticleRepository {
    /** Get paginated list of articles */
    getAll(options?: ArticleListOptions): Promise<ArticleListItem[]>;

    /** Get articles by tag */
    getByTag(tag: string, options?: { limit?: number }): Promise<ArticleListItem[]>;

    /** Get articles by platform */
    getByPlatform(platform: string, options?: { limit?: number }): Promise<ArticleListItem[]>;

    /** Get articles by category */
    getByCategory(category: string, options?: { limit?: number }): Promise<ArticleListItem[]>;

    /** Get single article by slug */
    getBySlug(slug: string, language?: string): Promise<Article | null>;

    /** Get article with downloads */
    getWithDownloads(slug: string, language?: string): Promise<ArticleWithDownloads>;
}

/**
 * Creates an article repository with the given GraphQL client
 */
export function createArticleRepository(fetcher: GraphQLFetcher): ArticleRepository {

    async function getAll(options: ArticleListOptions = {}): Promise<ArticleListItem[]> {
        const { limit = 12, offset = 0, status = 'PUBLISHED', filter = {} } = options;

        // Build filter string
        const filterParts: string[] = [];
        if (filter.tag) filterParts.push(`tag: "${filter.tag}"`);
        if (filter.platform) filterParts.push(`platform: "${filter.platform}"`);
        if (filter.category) filterParts.push(`category: "${filter.category}"`);
        if (filter.author) filterParts.push(`author: "${filter.author}"`);
        if (filter.favorited !== undefined) filterParts.push(`favorited: ${filter.favorited}`);

        const filterArg = filterParts.length > 0 ? `filter: { ${filterParts.join(', ')} }, ` : '';

        const query = `query GetArticles {
      articles(${filterArg}limit: ${limit}, offset: ${offset}, status: ${status}) {
        ${ARTICLE_LIST_FIELDS}
      }
    }`;

        const { data, errors } = await fetcher<{ articles: ArticleListItem[] }>(query, {}, {
            operationName: 'GetArticles',
        });

        if (errors || !data) {
            console.error('Failed to fetch articles:', errors);
            return [];
        }

        return data.articles || [];
    }

    async function getByTag(tag: string, options: { limit?: number } = {}): Promise<ArticleListItem[]> {
        const { limit = 50 } = options;

        const query = `query GetArticlesByTag($tag: String!) {
      articles(filter: { tag: $tag }, status: PUBLISHED, limit: ${limit}) {
        ${ARTICLE_LIST_FIELDS}
      }
    }`;

        const { data, errors } = await fetcher<{ articles: ArticleListItem[] }>(query, { tag }, {
            operationName: 'GetArticlesByTag',
        });

        if (errors || !data) {
            console.error('Failed to fetch articles by tag:', errors);
            return [];
        }

        return data.articles || [];
    }

    async function getByPlatform(platform: string, options: { limit?: number } = {}): Promise<ArticleListItem[]> {
        const { limit = 50 } = options;

        const query = `query GetArticlesByPlatform($platform: String!) {
      articles(filter: { platform: $platform }, status: PUBLISHED, limit: ${limit}) {
        ${ARTICLE_LIST_FIELDS}
      }
    }`;

        const { data, errors } = await fetcher<{ articles: ArticleListItem[] }>(query, { platform }, {
            operationName: 'GetArticlesByPlatform',
        });

        if (errors || !data) {
            console.error('Failed to fetch articles by platform:', errors);
            return [];
        }

        return data.articles || [];
    }

    async function getByCategory(category: string, options: { limit?: number } = {}): Promise<ArticleListItem[]> {
        const { limit = 50 } = options;

        const query = `query GetArticlesByCategory($category: String!) {
      articles(filter: { category: $category }, status: PUBLISHED, limit: ${limit}) {
        ${ARTICLE_LIST_FIELDS}
      }
    }`;

        const { data, errors } = await fetcher<{ articles: ArticleListItem[] }>(query, { category }, {
            operationName: 'GetArticlesByCategory',
        });

        if (errors || !data) {
            console.error('Failed to fetch articles by category:', errors);
            return [];
        }

        return data.articles || [];
    }

    async function getBySlug(slug: string, language?: string): Promise<Article | null> {
        const query = `query GetArticleBySlug($slug: String!, $language: String) {
      article(slug: $slug, language: $language) {
        ${ARTICLE_FULL_FIELDS}
      }
    }`;

        const { data, errors } = await fetcher<{ article: Article }>(query, { slug, language }, {
            operationName: 'GetArticleBySlug',
        });

        if (errors || !data) {
            console.error('Failed to fetch article by slug:', errors);
            return null;
        }

        return data.article || null;
    }

    async function getWithDownloads(slug: string, language?: string): Promise<ArticleWithDownloads> {
        const query = `query GetArticleWithDownloads($slug: String!, $language: String, $downloadsArticleId: Int) {
      article(slug: $slug, language: $language) {
        ${ARTICLE_FULL_FIELDS}
      }
      downloads(articleId: $downloadsArticleId) {
        id
        name
        url
        isActive
        vipOnly
        createdAt
      }
    }`;

        // First get article to get its ID
        const articleResult = await getBySlug(slug, language);
        if (!articleResult) {
            return { article: null, downloads: null };
        }

        const { data, errors } = await fetcher<{ article: Article; downloads: Article['downloads'] }>(
            query,
            { slug, language, downloadsArticleId: articleResult.id },
            { operationName: 'GetArticleWithDownloads' }
        );

        if (errors || !data) {
            console.error('Failed to fetch article with downloads:', errors);
            return { article: articleResult, downloads: null };
        }

        return {
            article: data.article || articleResult,
            downloads: data.downloads || null,
        };
    }

    return {
        getAll,
        getByTag,
        getByPlatform,
        getByCategory,
        getBySlug,
        getWithDownloads,
    };
}
