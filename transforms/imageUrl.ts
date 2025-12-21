/**
 * Image URL Transformation
 * 
 * Transforms filename-only URLs to full CDN URLs
 */

/**
 * Resolves an image URL.
 * - If it's just a filename (e.g., "abc.jpg"), prepends the CDN base URL
 * - If it's already a full URL, returns it as-is
 * - Handles null/undefined gracefully
 */
export function resolveImageUrl(imageUrl: string | null | undefined, cdnUrl: string): string | null {
    if (!imageUrl) return null;

    // Already a full URL - return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Filename only - prepend CDN base URL
    return `${cdnUrl}/${imageUrl}`;
}

/** Known image field names */
const IMAGE_FIELDS = new Set([
    'mainImage',
    'backgroundImage',
    'coverImage',
    'image',
]);

/**
 * Deep transforms all image URLs in an object/array recursively.
 */
export function transformImageUrlsDeep<T>(data: T, cdnUrl: string): T {
    if (data === null || data === undefined) return data;

    if (Array.isArray(data)) {
        return data.map(item => transformImageUrlsDeep(item, cdnUrl)) as T;
    }

    if (typeof data === 'object') {
        const result: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
            // Transform known image URL fields
            if (IMAGE_FIELDS.has(key) && typeof value === 'string') {
                result[key] = resolveImageUrl(value, cdnUrl);
            }
            // Transform image objects with url property (e.g., images: [{ url: 'abc.jpg' }])
            else if (key === 'images' && Array.isArray(value)) {
                result[key] = value.map(img => {
                    if (img && typeof img === 'object' && 'url' in img) {
                        return { ...img, url: resolveImageUrl(img.url as string, cdnUrl) };
                    }
                    return img;
                });
            }
            // Recursively transform nested objects
            else if (value !== null && typeof value === 'object') {
                result[key] = transformImageUrlsDeep(value, cdnUrl);
            }
            else {
                result[key] = value;
            }
        }

        return result as T;
    }

    return data;
}
