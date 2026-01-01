import { describe, it, expect } from 'vitest';
import { resolveImageUrl, transformImageUrlsDeep } from '../transforms/imageUrl';

const CDN_URL = 'https://cdn.chanomhub.com';

describe('resolveImageUrl', () => {
    it('should return null for null input', () => {
        expect(resolveImageUrl(null, CDN_URL)).toBeNull();
    });

    it('should return null for undefined input', () => {
        expect(resolveImageUrl(undefined, CDN_URL)).toBeNull();
    });

    it('should return full URL as-is for http URLs', () => {
        const url = 'http://example.com/image.jpg';
        expect(resolveImageUrl(url, CDN_URL)).toBe(url);
    });

    it('should return full URL as-is for https URLs', () => {
        const url = 'https://example.com/image.jpg';
        expect(resolveImageUrl(url, CDN_URL)).toBe(url);
    });

    it('should prepend CDN URL for filename only', () => {
        expect(resolveImageUrl('abc.jpg', CDN_URL)).toBe('https://cdn.chanomhub.com/abc.jpg');
    });

    it('should handle filenames with paths', () => {
        expect(resolveImageUrl('uploads/abc.jpg', CDN_URL)).toBe(
            'https://cdn.chanomhub.com/uploads/abc.jpg',
        );
    });
});

describe('transformImageUrlsDeep', () => {
    it('should return null/undefined as-is', () => {
        expect(transformImageUrlsDeep(null, CDN_URL)).toBeNull();
        expect(transformImageUrlsDeep(undefined, CDN_URL)).toBeUndefined();
    });

    it('should transform known image fields', () => {
        const data = {
            mainImage: 'main.jpg',
            coverImage: 'cover.jpg',
            backgroundImage: 'bg.jpg',
            image: 'profile.jpg',
            title: 'Test Article',
        };

        const result = transformImageUrlsDeep(data, CDN_URL);

        expect(result.mainImage).toBe('https://cdn.chanomhub.com/main.jpg');
        expect(result.coverImage).toBe('https://cdn.chanomhub.com/cover.jpg');
        expect(result.backgroundImage).toBe('https://cdn.chanomhub.com/bg.jpg');
        expect(result.image).toBe('https://cdn.chanomhub.com/profile.jpg');
        expect(result.title).toBe('Test Article'); // Non-image field unchanged
    });

    it('should not transform already full URLs', () => {
        const data = {
            mainImage: 'https://existing.com/image.jpg',
        };

        const result = transformImageUrlsDeep(data, CDN_URL);
        expect(result.mainImage).toBe('https://existing.com/image.jpg');
    });

    it('should transform images array with url property', () => {
        const data = {
            images: [{ url: 'image1.jpg' }, { url: 'image2.jpg' }],
        };

        const result = transformImageUrlsDeep(data, CDN_URL);

        expect(result.images[0].url).toBe('https://cdn.chanomhub.com/image1.jpg');
        expect(result.images[1].url).toBe('https://cdn.chanomhub.com/image2.jpg');
    });

    it('should recursively transform nested objects', () => {
        const data = {
            article: {
                mainImage: 'article.jpg',
                author: {
                    image: 'author.jpg',
                },
            },
        };

        const result = transformImageUrlsDeep(data, CDN_URL);

        expect(result.article.mainImage).toBe('https://cdn.chanomhub.com/article.jpg');
        expect(result.article.author.image).toBe('https://cdn.chanomhub.com/author.jpg');
    });

    it('should handle arrays at root level', () => {
        const data = [{ mainImage: 'img1.jpg' }, { mainImage: 'img2.jpg' }];

        const result = transformImageUrlsDeep(data, CDN_URL);

        expect(result[0].mainImage).toBe('https://cdn.chanomhub.com/img1.jpg');
        expect(result[1].mainImage).toBe('https://cdn.chanomhub.com/img2.jpg');
    });
});
