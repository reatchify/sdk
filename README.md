# Official Reatchify SDK

[![npm version](https://badge.fury.io/js/%40reatchify%2Fsdk.svg)](https://badge.fury.io/js/%40reatchify%2Fsdk)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> 🚀 **BETA RELEASE** 🚀
>
> The Reatchify SDK is now in beta! Core features are stable and ready for testing. Please report any issues you encounter.l Reatchify SDK

[![npm version](https://badge.fury.io/js/%40reatchify%2Fsdk.svg)](https://badge.fury.io/js/%40reatchify%2Fsdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> � **BETA RELEASE** �
>
> The Reatchify SDK is now in beta! Core features are stable and ready for testing. Please report any issues you encounter.

The official SDK for seamless communication with Reatchify CMS inside your applications. Generates fully-typed TypeScript client libraries for Reatchify CMS APIs with support for multiple HTTP clients, state management, and plugin architecture.

## Features

- **Reatchify CMS Integration**: Seamless communication with Reatchify CMS APIs
- **Fully Configurable**: Every aspect of code generation can be customized
- **TypeScript First**: Generates fully typed APIs with JSDoc comments
- **Plugin System**: Extensible architecture with before/after hooks
- **Multiple HTTP Clients**: Support for Axios, Fetch, and custom clients
- **State Management**: Built-in Zustand/Redux store generation
- **Error Handling**: Custom error classes and response patterns
- **API Versioning**: Multi-version API support with automatic endpoint management
- **Multi-Environment**: Development, staging, and production environment support

## Installation

> 📦 **Beta Release**: This is a beta release. Core functionality is stable, but some advanced features may still be evolving.

```bash
npm install -g @reatchify/sdk
# or
npx @reatchify/sdk --help
```

## Commercial Use Restrictions

> ⚠️ **IMPORTANT**: This software includes commercial use restrictions

This SDK is licensed under Apache License 2.0 with additional commercial restrictions:

- **No Commercial Use**: May not be used for commercial purposes without explicit permission
- **No Competitive Use**: May not be used to compete with Reatchify's core offerings
- **Attribution Required**: Must include prominent Reatchify attribution
- **Modification Sharing**: Modifications must be shared with the community

For commercial licensing or exceptions, contact licensing@reatchify.com.

## Quick Start

1. **Initialize Configuration**

```bash
npx reatchify init
```

2. **Configure Your API Connection**
   Edit `reatchify.config.json`:

```json
{
  "apiKey": "your-reatchify-api-key",
  "apiVersion": "v2",
  "language": "ts",
  "stateManagement": "zustand",
  "httpClient": "axios",
  "outputDir": "./src/generated/reatchify"
}
```

3. **Generate Your SDK**

```bash
npx reatchify generate
```

4. **Use in Your Code**

```typescript
import { ReatchifyClient } from "./src/generated/reatchify";

const client = new ReatchifyClient({
  apiKey: "your-reatchify-api-key",
});

// Make API calls
const users = await client.api.users();
const user = await client.api.users__id({ id: "123" });
```

## API Versioning

The Reatchify SDK supports multiple API versions with automatic endpoint management and type safety. Reatchify CMS provides different API versions with varying features and breaking changes.

### Supported API Versions

| Version | Status  | Release Date | End of Support |
| ------- | ------- | ------------ | -------------- |
| v1      | Legacy  | 2023-01-01   | 2025-12-31     |
| v2      | Current | 2024-06-01   | 2026-12-31     |
| v3      | Beta    | 2025-01-01   | TBD            |

### Version Configuration

#### Basic Version Selection

```json
{
  "apiVersion": "v2"
}
```

#### Environment-Specific Versioning

```json
{
  "apiVersion": "v2",
  "environments": {
    "dev": {
      "apiVersion": "v3"
    },
    "staging": {
      "apiVersion": "v2"
    },
    "prod": {
      "apiVersion": "v1"
    }
  }
}
```

#### Version Headers

The SDK automatically manages version headers:

```typescript
// v1 API calls include: X-API-Version: v1
// v2 API calls include: X-API-Version: v2
// v3 API calls include: X-API-Version: v3
```

### Version Differences

#### API v1 (Legacy)

- Basic CRUD operations
- Simple authentication
- Limited filtering and sorting
- No advanced features

```typescript
// v1 API calls
const users = await client.api.getUsers();
const user = await client.api.getUser({ id: "123" });
```

#### API v2 (Current)

- Enhanced filtering and sorting
- Pagination support
- Advanced error handling
- Plugin system support
- State management integration

```typescript
// v2 API calls with enhanced features
const users = await client.api.users({
  filter: { status: "active" },
  sort: "createdAt",
  order: "desc",
  limit: 50,
  offset: 0,
});

const user = await client.api.users__id({ id: "123" });
```

#### API v3 (Beta)

- GraphQL-style queries
- Real-time subscriptions
- Advanced caching
- Custom field selection
- Enhanced type safety

```typescript
// v3 API calls with advanced features
const users = await client.api.users({
  fields: ["id", "name", "email", "posts.title"],
  filter: { createdAt: { gte: "2024-01-01" } },
  sort: [{ field: "createdAt", order: "desc" }],
  pagination: { type: "cursor", limit: 50 },
});

// Real-time subscriptions (v3 only)
const subscription = client.api.users.subscribe(
  {
    filter: { status: "active" },
  },
  (update) => {
    console.log("User updated:", update);
  }
);
```

### Version Migration Examples

#### Migrating from v1 to v2

```typescript
// v1 code
const users = await client.api.getUsers();

// v2 equivalent
const users = await client.api.users();

// v1 with basic filtering
const activeUsers = await client.api.getUsers({ status: "active" });

// v2 with enhanced filtering
const activeUsers = await client.api.users({
  filter: { status: "active" },
});
```

#### Migrating from v2 to v3

```typescript
// v2 code
const users = await client.api.users({
  limit: 50,
  offset: 0,
  sort: "createdAt",
  order: "desc",
});

// v3 equivalent with cursor pagination
const users = await client.api.users({
  pagination: { type: "cursor", limit: 50 },
  sort: [{ field: "createdAt", order: "desc" }],
});

// v3 with field selection
const users = await client.api.users({
  fields: ["id", "name", "email"],
  pagination: { type: "cursor", limit: 50 },
});
```

### Version-Specific Features

#### v1 Features

- ✅ Basic CRUD operations
- ✅ Simple authentication
- ✅ JSON responses
- ❌ Advanced filtering
- ❌ Pagination
- ❌ Error classes

#### v2 Features

- ✅ All v1 features
- ✅ Advanced filtering and sorting
- ✅ Cursor and offset pagination
- ✅ Custom error classes
- ✅ Plugin system
- ✅ State management stores
- ❌ Real-time features
- ❌ GraphQL-style queries

#### v3 Features (Beta)

- ✅ All v2 features
- ✅ GraphQL-style field selection
- ✅ Real-time subscriptions
- ✅ Advanced caching
- ✅ Enhanced type safety
- ✅ Custom query builders

### Version Compatibility

The SDK maintains backward compatibility where possible:

```typescript
// This works in all versions
const user = await client.api.users__id({ id: "123" });

// Version-specific features
if (client.apiVersion === "v3") {
  // Use v3-specific features
  const users = await client.api.users({
    fields: ["id", "name"],
    realtime: true,
  });
} else {
  // Use v2/v1 compatible code
  const users = await client.api.users();
}
```

### Environment-Based Version Management

```json
{
  "apiVersion": "v2",
  "environments": {
    "development": {
      "apiVersion": "v3",
      "outputDir": "./src/generated/dev"
    },
    "staging": {
      "apiVersion": "v2",
      "httpClient": "fetch"
    },
    "production": {
      "apiVersion": "v1",
      "stateManagement": "redux"
    }
  }
}
```

```bash
# Development environment (uses v3)
NODE_ENV=development npx reatchify generate

# Production environment (uses v1)
NODE_ENV=production npx reatchify generate
```

### Version Headers and Base URLs

The SDK automatically manages version-specific endpoints:

| Environment | Version | Base URL                               | Headers             |
| ----------- | ------- | -------------------------------------- | ------------------- |
| dev         | v3      | `https://api-dev.reatchify.com/v3`     | `X-API-Version: v3` |
| staging     | v2      | `https://api-staging.reatchify.com/v2` | `X-API-Version: v2` |
| prod        | v1      | `https://api.reatchify.com/v1`         | `X-API-Version: v1` |

## Configuration

### Basic Configuration

```json
{
  "apiKey": "your-reatchify-api-key",
  "apiVersion": "v2",
  "language": "ts",
  "stateManagement": "zustand",
  "httpClient": "axios",
  "outputDir": "./src/generated/reatchify"
}
```

### Advanced Configuration

```json
{
  "apiKey": "${REATCHIFY_API_KEY}",
  "apiVersion": "v2",
  "language": "ts",
  "stateManagement": "zustand",
  "httpClient": "axios",
  "outputDir": "./src/generated/reatchify",

  "auth": {
    "enabled": true
  },

  "services": {
    "include": ["users", "posts", "comments"]
  },

  "naming": {
    "clientPrefix": "Reatchify",
    "storePrefix": "use",
    "hookPrefix": "use"
  },

  "folderStructure": {
    "types": "types",
    "api": "api",
    "client": "client",
    "stores": "stores"
  },

  "client": {
    "enabled": true,
    "className": "ReatchifyClient",
    "exportAsDefault": false,
    "includeUtils": true
  },

  "api": {
    "enabled": true,
    "namespaceName": "api",
    "groupByResource": true,
    "includeHttpClient": true
  },

  "response": {
    "pattern": "result",
    "includeErrorClasses": true
  },

  "plugins": {
    "enabled": true,
    "registryClassName": "PluginRegistry"
  },

  "errorHandling": {
    "enabled": true,
    "includeNetworkErrors": true,
    "includeValidationErrors": true
  },

  "http": {
    "timeout": 30000,
    "headers": {
      "X-Custom-Header": "value"
    },
    "retry": {
      "enabled": true,
      "maxAttempts": 3
    }
  },

  "generation": {
    "includeComments": true,
    "includeJSDoc": true,
    "minify": false
  },

  "environments": {
    "dev": {
      "apiVersion": "v3",
      "outputDir": "./src/generated/dev"
    },
    "staging": {
      "apiVersion": "v2"
    },
    "prod": {
      "apiVersion": "v1"
    }
  }
}
```

### Authentication Configuration

Control whether authentication is enabled for the generated SDK:

```json
{
  "auth": {
    "enabled": true  // Default: true, set to false to disable API key authentication
  }
}
```

When `auth.enabled` is `false`, the generated client will not include authentication headers in requests. This is useful for public APIs that don't require authentication.

### Service Selection Configuration

Select which API services to generate code for:

```json
{
  "services": {
    "include": ["users", "posts", "comments"]  // Only generate these services
  }
}
```

- **Default behavior**: If not specified, all available services from the API schema are generated
- **Selective generation**: Only generate code for the specified services to reduce bundle size
- **Validation**: The SDK validates that specified services exist in the API schema

## CLI Commands

### Initialize Project

```bash
npx reatchify init
```

### Set API Key

```bash
npx reatchify auth set YOUR_API_KEY
```

### Generate SDK

```bash
npx reatchify generate
```

### Generate for Specific Environment

```bash
NODE_ENV=production npx reatchify generate
```

### Show Help

```bash
npx reatchify --help
```

## Usage Examples

### Basic Client Usage

```typescript
import { ReatchifyClient } from "./src/generated/reatchify";

const client = new ReatchifyClient({
  apiKey: "your-api-key",
});

// API calls (version-specific methods available based on configured apiVersion)
const users = await client.api.users();
const user = await client.api.users__id({ id: "123" });
```

### With State Management (Zustand)

```typescript
import { useUsersStore, useUsers__idStore } from "./src/generated/reatchify";

// In a React component
function UsersList() {
  const { data: users, loading, error, fetch } = useUsersStore();

  useEffect(() => {
    fetch(); // Automatically calls the appropriate versioned API
  }, [fetch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Plugin System

```typescript
import { ReatchifyClient } from "./src/generated/reatchify";

// Logging plugin
const loggingPlugin = {
  name: "logger",
  beforeRequest: (config) => {
    console.log(`[${config.method}] ${config.url}`);
    return config;
  },
  afterResponse: (response) => {
    console.log(`Response: ${response.status}`);
    return response;
  },
};

const client = new ReatchifyClient({
  apiKey: "your-api-key",
  plugins: [loggingPlugin],
});
```

### Version-Specific Usage

```typescript
// The same client automatically uses the configured API version
const client = new ReatchifyClient({
  apiKey: "your-api-key",
});

// v1, v2, v3 compatible
const users = await client.api.users();

// v2+ features
if (client.apiVersion >= "v2") {
  const filteredUsers = await client.api.users({
    filter: { status: "active" },
    sort: "createdAt",
    limit: 50,
  });
}

// v3+ features
if (client.apiVersion >= "v3") {
  const users = await client.api.users({
    fields: ["id", "name", "email"],
    realtime: true,
  });
}
```

## SDK Usage Guide

For detailed information on how the generated SDK works, how to use it, and what your backend API must provide, see the [SDK Usage Guide](docs/SDK_USAGE_GUIDE.md).

This guide covers:

- How the generated code works internally
- Backend API requirements and expectations
- Complete usage examples with different patterns
- Error handling and best practices
- State management integration
- Plugin system usage
- Performance optimization tips
- Troubleshooting common issues

## Backend Implementation Specification

For the internal backend team implementing the API that this SDK communicates with, see the [API Implementation Specification](docs/API_IMPLEMENTATION_SPEC.md).

This specification details:

- Exact endpoint requirements and response formats
- Authentication and authorization rules
- Data validation specifications
- Error response structures
- Pagination implementation details
- Database schema requirements
- Testing and deployment checklists

## Development Status

### ✅ Currently Supported

- TypeScript SDK generation with full type safety
- Project type detection (Next.js, React, Vue, Svelte, Angular, etc.)
- HTTP clients (Axios, Fetch) with automatic configuration
- State management (Zustand, Redux) with React hooks
- Plugin system with before/after hooks
- CLI interface with init and generate commands
- API versioning (v1, v2, v3) with automatic endpoint management
- Multi-environment support (dev, staging, production)
- Smart output directory defaults with fallback logic
- Comprehensive configuration system
- Unit tests with Jest and TypeScript support

### 🚧 In Development

- Additional state management libraries
- Custom template system enhancements
- Advanced error handling improvements

### 📋 Planned Features

- Multi-language support (Python, Go, etc.)
- Real-time code generation with watch mode
- VS Code extension integration
- CI/CD pipeline integration
- GraphQL client generation
- WebSocket/real-time subscriptions

## Troubleshooting

### Common Issues

1. **"Cannot find name 'generateTypes'"**

   - Make sure all imports are correct in `generate.ts`
   - Check that the modular files exist

2. **Build fails with duplicate function errors**

   - Remove duplicate function definitions from `generate.ts`
   - Ensure functions are only defined in their respective modules

3. **API calls fail with authentication errors**

   - Verify API key is set correctly
   - Check environment variables
   - Ensure API key has proper permissions

4. **Type errors in generated code**
   - Validate your API schema structure
   - Check TypeScript type definitions
   - Ensure parameter types match API expectations

### Debug Mode

Enable debug logging:

```bash
DEBUG=reatchify:* npx reatchify generate
```

## Contributing

This project is in beta release. We welcome contributions, but please note:

- Core APIs are stable, but some advanced features may still evolve
- Breaking changes will be clearly communicated in release notes
- Beta releases may contain minor bugs that will be addressed quickly

### For Beta Testers

- Test the SDK with your real-world APIs and report issues
- Suggest improvements and missing features
- Help improve documentation and examples
- Participate in beta testing programs

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/sdk.git`
3. Install dependencies: `npm install`
4. Build the project: `npm run build`
5. Test locally: `npm run dev`
6. Run tests: `npm test`

### Reporting Issues

When reporting bugs, please include:

- Your `reatchify.config.json`
- Project type (Next.js, React, Vue, etc.)
- Node.js version
- Full error output

## License

Apache License 2.0 with additional commercial restrictions - See [LICENSE](LICENSE) file for details.

### Commercial Use

This software includes commercial use restrictions. For commercial licensing or to discuss exceptions to these restrictions, please contact Reatchify at licensing@reatchify.com.

---

**Disclaimer**: This software is in beta release. Core functionality is stable and well-tested, but some advanced features may still be evolving. Breaking changes will be clearly communicated. Use in production at your own discretion, but please report any issues you encounter.
