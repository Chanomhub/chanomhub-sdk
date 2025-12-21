/**
 * Chanomhub SDK Configuration
 */

export interface ChanomhubConfig {
    /** API base URL */
    apiUrl: string;
    /** CDN base URL for images */
    cdnUrl: string;
    /** Authentication token (optional) */
    token?: string;
    /** Default cache duration in seconds (0 = no cache) */
    defaultCacheSeconds?: number;
}

export const DEFAULT_CONFIG: ChanomhubConfig = {
    apiUrl: 'https://api.chanomhub.online',
    cdnUrl: 'https://cdn.chanomhub.com',
    defaultCacheSeconds: 3600,
};

/** Article status enum */
export type ArticleStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED' | 'NOT_APPROVED' | 'NEEDS_REVISION';

/** Game engine enum */
export type GameEngine = 'RENPY' | 'RPGM' | 'UNITY' | 'UNREAL' | 'GODOT' | 'TyranoBuilder' | 'WOLFRPG' | 'KIRIKIRI' | 'FLASH' | 'BakinPlayer';
