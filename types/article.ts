/**
 * Chanomhub SDK - Article Types
 */

import type { ArticleStatus, GameEngine } from '../config';
import type { Author, Download, OfficialDownloadSource, Mod, NamedEntity, ImageObject } from './common';

/** Full Article type */
export interface Article {
    id: number;
    title: string;
    slug: string;
    description: string;
    body: string;
    ver: string | null;
    creators: NamedEntity[];
    tags: NamedEntity[];
    platforms: NamedEntity[];
    categories: NamedEntity[];
    createdAt: string;
    updatedAt: string;
    status: ArticleStatus;
    engine: GameEngine;
    mainImage: string | null;
    backgroundImage: string | null;
    coverImage: string | null;
    images: ImageObject[];
    author: Author;
    favorited: boolean;
    favoritesCount: number;
    sequentialCode: string | null;
    downloads: Download[];
    mods: Mod[];
    officialDownloadSources: OfficialDownloadSource[];
    version?: string;
}

/** Partial article for list views */
export interface ArticleListItem {
    id: number;
    title: string;
    slug: string;
    description: string;
    ver: string | null;
    createdAt: string;
    updatedAt: string;
    mainImage: string | null;
    coverImage?: string | null;
    favoritesCount: number;
    favorited?: boolean;
    status?: ArticleStatus;
    engine?: GameEngine | { name: string };
    sequentialCode: string | null;
    author: {
        name: string;
        image: string | null;
    };
    tags?: NamedEntity[];
    platforms?: NamedEntity[];
    categories?: NamedEntity[];
    creators?: NamedEntity[];
    images?: ImageObject[];
}

/** Article filter options */
export interface ArticleFilter {
    tag?: string;
    platform?: string;
    category?: string;
    author?: string;
    favorited?: boolean;
}

/** Article list options */
export interface ArticleListOptions {
    limit?: number;
    offset?: number;
    status?: ArticleStatus;
    filter?: ArticleFilter;
}

/** Article with downloads response */
export interface ArticleWithDownloads {
    article: Article | null;
    downloads: Download[] | null;
}
