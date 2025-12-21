/**
 * Chanomhub SDK - Common Types
 */

/** Pagination options */
export interface ListOptions {
    limit?: number;
    offset?: number;
}

/** GraphQL response wrapper */
export interface GraphQLResponse<T> {
    data: T | null;
    errors?: Array<{ message: string; path?: string[] }>;
}

/** Author type */
export interface Author {
    id?: number;
    name: string;
    bio: string | null;
    image: string | null;
    backgroundImage: string | null;
    following?: boolean;
    socialMediaLinks?: Array<{ platform: string; url: string }>;
}

/** Download link type */
export interface Download {
    id: number;
    name: string;
    url: string;
    isActive: boolean;
    vipOnly: boolean;
    createdAt?: string;
}

/** Official download source */
export interface OfficialDownloadSource {
    name: string;
    url: string;
    status: string;
}

/** Mod type */
export interface Mod {
    name: string;
    description: string;
    creditTo: string;
    downloadLink: string;
    version: string;
    status: string;
    categories: Array<{ name: string }>;
    images: Array<{ url: string }>;
}

/** Named entity (tag, category, platform, etc.) */
export interface NamedEntity {
    name: string;
}

/** Image object */
export interface ImageObject {
    url: string;
}
