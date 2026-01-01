import { describe, it, expect } from 'vitest';
import { createChanomhubClient } from '../index';
import { DEFAULT_CONFIG } from '../config';

const CDN_URL = DEFAULT_CONFIG.cdnUrl;

describe('Chanomhub SDK Integration Tests (MSW)', () => {
    it('should fetch and transform articles correctly', async () => {
        const client = createChanomhubClient();
        const articles = await client.articles.getAll();

        expect(articles).toHaveLength(2);

        // Check transformation locally (filename only -> full URL)
        expect(articles[0].mainImage).toBe(`${CDN_URL}/article1.jpg`);

        // Check no double transformation (full URL stays full URL)
        expect(articles[1].mainImage).toBe('https://external.com/image.jpg');
    });

    it('should fetch single article by slug and transform nested fields', async () => {
        const client = createChanomhubClient();
        const article = await client.articles.getBySlug('test-article-1');

        expect(article).not.toBeNull();
        expect(article!.slug).toBe('test-article-1');

        // Check flat field
        expect(article!.mainImage).toBe(`${CDN_URL}/article1.jpg`);

        // Check nested author image
        expect(article!.author.image).toBe(`${CDN_URL}/john.jpg`);

        // Check array of images
        expect(article!.images[0].url).toBe(`${CDN_URL}/img1.jpg`);
        expect(article!.images[1].url).toBe(`${CDN_URL}/img2.jpg`);
    });

    it('should return null when article not found', async () => {
        const client = createChanomhubClient();
        const article = await client.articles.getBySlug('not-found');

        expect(article).toBeNull();
    });

    it('should handle server errors (500)', async () => {
        const client = createChanomhubClient();

        // We use the raw graphql client here to target the specific error handler
        const result = await client.graphql(
            'query ServerErrorQuery { test }',
            {},
            {
                operationName: 'ServerErrorQuery',
            },
        );

        expect(result.data).toBeNull();
        // The SDK converts non-ok status to an error message
        expect(result.errors![0].message).toContain('HTTP 500');
    });

    it('should handle GraphQL errors', async () => {
        const client = createChanomhubClient();

        const result = await client.graphql(
            'query GraphQLErrorQuery { test }',
            {},
            {
                operationName: 'GraphQLErrorQuery',
            },
        );

        expect(result.data).toBeNull();
        expect(result.errors).toHaveLength(1);
        expect(result.errors![0].message).toBe('Something went wrong in GraphQL');
    });
});
