import { http, graphql, HttpResponse } from 'msw';

export const handlers = [
    // Happy path: Get Articles
    graphql.query('GetArticles', () => {
        return HttpResponse.json({
            data: {
                articles: [
                    {
                        id: 1,
                        title: 'Test Article 1',
                        slug: 'test-article-1',
                        mainImage: 'article1.jpg',
                        status: 'PUBLISHED',
                        engine: { id: 'ng1', name: 'RenPy' },
                        author: { name: 'Author 1', image: 'auth1.jpg' },
                        creators: [],
                        tags: [],
                        platforms: [],
                        categories: [],
                        images: []
                    },
                    {
                        id: 2,
                        title: 'Test Article 2',
                        slug: 'test-article-2',
                        mainImage: 'https://external.com/image.jpg',
                        status: 'PUBLISHED',
                        engine: { id: 'ng2', name: 'Unity' },
                        author: { name: 'Author 2', image: 'auth2.jpg' },
                        creators: [],
                        tags: [],
                        platforms: [],
                        categories: [],
                        images: []
                    },
                ],
            },
        });
    }),

    // Happy path: Get Article By Slug
    graphql.query('GetArticleBySlug', ({ variables }) => {
        const { slug } = variables;

        if (slug === 'not-found') {
            return HttpResponse.json({
                data: { article: null },
            });
        }

        return HttpResponse.json({
            data: {
                article: {
                    id: 1,
                    title: 'Test Article 1',
                    slug: slug as string,
                    description: 'A test article',
                    body: 'This is the body content',
                    ver: '1.0',
                    createdAt: '2023-01-01',
                    updatedAt: '2023-01-02',
                    status: 'PUBLISHED',
                    engine: { id: 'ng1', name: 'RenPy' },
                    mainImage: 'article1.jpg',
                    backgroundImage: 'bg.jpg',
                    coverImage: 'cover.jpg',
                    favorited: false,
                    favoritesCount: 10,
                    sequentialCode: '001',
                    author: {
                        name: 'John Doe',
                        bio: 'Bio',
                        image: 'john.jpg',
                        backgroundImage: 'auth_bg.jpg',
                        following: false,
                        socialMediaLinks: []
                    },
                    images: [
                        { id: 'img1', url: 'img1.jpg' },
                        { id: 'img2', url: 'img2.jpg' }
                    ],
                    creators: [],
                    tags: [],
                    platforms: [],
                    categories: [],
                    mods: [],
                },
            },
        });
    }),

    // Error path: Internal Server Error simulation
    graphql.query('ServerErrorQuery', () => {
        return new HttpResponse(null, { status: 500 });
    }),

    // Error path: GraphQL Error simulation
    graphql.query('GraphQLErrorQuery', () => {
        return HttpResponse.json({
            errors: [
                { message: 'Something went wrong in GraphQL' }
            ]
        });
    }),
];
