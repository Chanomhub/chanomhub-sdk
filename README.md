```markdown
# Chanomhub SDK 🚀

**A fully-typed, framework-agnostic TypeScript SDK for interacting with the Chanomhub API**

[![npm version](https://img.shields.io/npm/v/@chanomhub/sdk?style=flat-square)](https://www.npmjs.com/package/@chanomhub/sdk)
[![TypeScript](https://img.shields.io/badge/types-TypeScript-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-v20.9.0+-green.svg?style=flat-square)](https://nodejs.org/)
[![License: ISC](https://img.shields.io/badge/license-ISC-blue.svg?style=flat-square)](https://opensource.org/licenses/ISC)
[![CI Status](https://img.shields.io/github/actions/workflow/status/Chanomhub/chanomhub-sdk/ci.yml?branch=main&style=flat-square)](https://github.com/Chanomhub/chanomhub-sdk/actions)

---

## 🌟 Overview

The **Chanomhub SDK** is a comprehensive, type-safe TypeScript library designed to simplify interactions with the Chanomhub API. Whether you're building a web application with Next.js, a mobile app with React Native, or a server-side application, this SDK provides a consistent, well-typed interface to access all Chanomhub features.

### Key Features

✅ **Framework-Agnostic** – Works seamlessly with Next.js, React Native, Node.js, and browser environments
✅ **TypeScript First** – Complete type definitions for all API endpoints and responses
✅ **Modular Design** – Organized repositories for articles, users, favorites, and search
✅ **Automatic Image Transformation** – Converts filename-only URLs to full CDN URLs
✅ **Authentication Support** – Built-in JWT token handling with Next.js cookie integration
✅ **Caching** – Configurable cache settings for better performance
✅ **Error Handling** – Custom error classes for robust error management
✅ **Next.js Optimized** – Special helpers for Server Components and client-side usage

---

## 🛠️ Tech Stack

- **Language:** TypeScript
- **Build Tool:** TypeScript Compiler
- **Testing:** Vitest
- **Mocking:** MSW (Mock Service Worker)
- **Linter:** ESLint with Prettier
- **Peer Dependency:** Next.js (optional, for Next.js-specific features)

---

## 📦 Installation

### Prerequisites

- Node.js **v20.9.0+**
- npm, yarn, or pnpm

### Quick Start

```bash
npm install @chanomhub/sdk
# or
yarn add @chanomhub/sdk
# or
pnpm add @chanomhub/sdk
```

### Next.js Integration

If you're using Next.js, install the peer dependency:

```bash
npm install next@latest
# or
yarn add next@latest
# or
pnpm add next@latest
```

---

## 🎯 Usage

### Basic Usage

```typescript
import { createChanomhubClient } from '@chanomhub/sdk';

// Create a public client
const sdk = createChanomhubClient();

// Fetch articles by tag
const articles = await sdk.articles.getByTag('renpy');
console.log(articles);

// Fetch a single article by slug
const article = await sdk.articles.getBySlug('my-article');
console.log(article);
```

### With Authentication

```typescript
import { createChanomhubClient } from '@chanomhub/sdk';

// Create a client with JWT token
const sdk = createChanomhubClient({
  token: 'your-jwt-token',
});

// Now you can access authenticated endpoints
const myArticles = await sdk.articles.getByUser('my-username');
```

### Custom Configuration

```typescript
import { createChanomhubClient } from '@chanomhub/sdk';

// Custom API and CDN URLs
const sdk = createChanomhubClient({
  apiUrl: 'https://api.chanomhub.online',
  cdnUrl: 'https://cdn.chanomhub.com',
  token: 'your-jwt-token',
  defaultCacheSeconds: 300, // 5 minutes cache
});
```

### Next.js Server Components

For Next.js Server Components, use the special helper:

```typescript
// app/page.tsx
import { createServerClient } from '@chanomhub/sdk/next';

export default async function Page() {
  const sdk = await createServerClient(); // Automatically reads token from cookies
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

---

## 📁 Project Structure

```
.
├── dist/                  # Compiled TypeScript files
├── src/
│   ├── client.ts          # GraphQL and REST client implementations
│   ├── config.ts          # Configuration types and defaults
│   ├── errors/            # Custom error classes
│   ├── repositories/      # Repository implementations
│   │   ├── articleRepository.ts
│   │   ├── favoritesRepository.ts
│   │   ├── searchRepository.ts
│   │   └── usersRepository.ts
│   ├── transforms/        # Utility functions (e.g., image URL transformation)
│   ├── types/             # TypeScript type definitions
│   │   ├── article.ts
│   │   ├── common.ts
│   │   └── user.ts
│   ├── index.ts           # Main SDK entry point
│   └── next.ts            # Next.js-specific helpers
├── __tests__/             # Test files
├── examples/              # Example usage files
├── .gitignore             # Git ignore rules
├── package.json           # Project metadata and dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file!
```

---

## 🔧 Configuration

### Environment Variables

The SDK uses configuration through the `createChanomhubClient` function. You can override the following defaults:

```typescript
{
  apiUrl: 'https://api.chanomhub.com',          // Base API URL
  cdnUrl: 'https://cdn.chanomhub.com',          // Base CDN URL for images
  token: 'your-jwt-token',                      // Authentication token
  defaultCacheSeconds: 3600                     // Default cache duration in seconds
}
```

### Field Presets

The SDK provides field presets for article queries to optimize performance:

```typescript
// Available presets
type ArticlePreset = 'minimal' | 'standard' | 'full';

// Example usage with custom fields
const articles = await sdk.articles.getAll({
  limit: 10,
  fields: ['id', 'title', 'slug', 'mainImage'] // Custom field selection
});
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Chanomhub/chanomhub-sdk.git
   cd chanomhub-sdk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run tests:
   ```bash
   npm test
   ```

### Code Style Guidelines

- Use **TypeScript** for all code
- Follow the **existing code style** (ESLint and Prettier are configured)
- Write **comprehensive tests** for new features
- Keep **commit messages** clear and descriptive

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors & Contributors

**Maintainers:**
- [Your Name](https://github.com/yourusername) - Initial work and ongoing maintenance

**Contributors:**
- [Contributor Name](https://github.com/contributor) - [Contribution Description]
- [Another Contributor](https://github.com/another) - [Contribution Description]

---

## 🐛 Issues & Support

### Reporting Issues

If you encounter a bug or have a feature request, please:
1. Check if it's already reported in the [Issues](https://github.com/Chanomhub/chanomhub-sdk/issues) section
2. If not, open a new issue with:
   - A clear title
   - Detailed description
   - Steps to reproduce (if applicable)
   - Any relevant code snippets

### Getting Help

- **Discussions:** [Chanomhub Community Forum](https://community.chanomhub.com)
- **Chat:** [Chanomhub Discord](https://discord.chanomhub.com)

---

## 🗺️ Roadmap

### Planned Features

- [ ] Add support for WebSockets
- [ ] Implement batch requests
- [ ] Add more detailed analytics
- [ ] Improve TypeScript type coverage
- [ ] Add React hooks for client-side usage

### Known Issues

- [Issue #123](https://github.com/Chanomhub/chanomhub-sdk/issues/123) - Cache invalidation in authenticated sessions
- [Issue #456](https://github.com/Chanomhub/chanomhub-sdk/issues/456) - Edge case handling for large responses

---

## 🎉 Get Started Today!

The Chanomhub SDK is ready to help you build amazing applications with ease. Whether you're creating a content platform, a game development tool, or any other Chanomhub-powered application, this SDK provides the tools you need to succeed.

👉 **[Install Now](https://www.npmjs.com/package/@chanomhub/sdk)** and start building!

---

### 📢 Star and Follow

If you find this SDK useful, please consider **starring** the repository to show your support. Your star helps us track the project's popularity and motivates us to continue improving it.

🌟 **[Star on GitHub](https://github.com/Chanomhub/chanomhub-sdk)**
```

This README.md provides a comprehensive and engaging overview of the Chanomhub SDK, making it easy for developers to understand, install, and start using the library. It includes practical examples, clear instructions, and a roadmap for future development, encouraging contributions and community engagement.