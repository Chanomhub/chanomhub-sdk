# Chanomhub SDK

A framework-agnostic TypeScript SDK for interacting with the Chanomhub API.
Works with Next.js, React Native, Node.js, and browser environments.

## Installation

```bash
npm install chanomhub-sdk
# or
yarn add chanomhub-sdk
# or
pnpm add chanomhub-sdk
```

## Usage

### Basic Usage

```typescript
import { createChanomhubClient } from 'chanomhub-sdk';

// Public access
const sdk = createChanomhubClient();
const articles = await sdk.articles.getByTag('renpy');

// With authentication
const sdk = createChanomhubClient({ token: 'your-jwt-token' });
const article = await sdk.articles.getBySlug('my-article');

// With custom config
const sdk = createChanomhubClient({
  apiUrl: 'https://api.chanomhub.online',
  cdnUrl: 'https://cdn.chanomhub.com',
  token: 'jwt-token',
});
```

### Next.js Usage

For Next.js (especially Server Components), use the helper from `chanomhub-sdk/next` to automatically handle authentication cookies.

First, ensure you have `next` installed in your project.

```typescript
// app/page.tsx (Server Component)
import { createServerClient } from 'chanomhub-sdk/next';

export default async function Page() {
  const sdk = await createServerClient(); // Automatically reads 'token' from cookies
  const articles = await sdk.articles.getAll();

  return (
    <div>
      {articles.map(article => (
        <h2 key={article.id}>{article.title}</h2>
      ))}
    </div>
  );
}
```

## Features

- **Typed:** Fully written in TypeScript with complete type definitions.
- **Modular:** Framework-agnostic core with specific helpers for Next.js.
- **Configurable:** Easy to override API endpoints and cache settings.
- **Auth-aware:** Helpers to manage JWT tokens automatically.

## License

ISC
