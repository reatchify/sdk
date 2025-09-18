# Official Reatchify SDK

[![npm version](https://badge.fury.io/js/%40reatchify%2Fsdk.svg)](https://badge.fury.io/js/%40reatchify%2Fsdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> 🚧 **UNDER DEVELOPMENT** 🚧
>
> This package is currently in active development. APIs may change, and it's not recommended for production use yet. Please report any issues you encounter!

The official SDK for seamless communication with Reatchify CMS inside your applications.

## Features

- **Reatchify CMS Integration**: Seamless communication with Reatchify CMS APIs
- **Fully Configurable**: Every aspect of code generation can be customized
- **TypeScript First**: Generates fully typed APIs with JSDoc comments
- **Plugin System**: Extensible architecture with before/after hooks
- **Multiple HTTP Clients**: Support for Axios, Fetch, and custom clients
- **State Management**: Built-in Zustand/Redux store generation
- **Error Handling**: Custom error classes and response patterns
- **Versioning**: API versioning and multi-environment support

## Installation

> ⚠️ **Development Release**: This is an early development release. Expect breaking changes and incomplete features.

```bash
npm install -g @reatchify/sdk
# or
npx @reatchify/sdk --help
```

## Development Status

### ✅ Currently Supported

- TypeScript SDK generation
- Project type detection (Next.js, React, Vue, etc.)
- HTTP clients (Axios, Fetch)
- State management (Zustand, Redux)
- Plugin system
- CLI interface

### 🚧 In Development

- Additional state management libraries
- Custom template system
- Advanced error handling
- Multi-environment configuration improvements

### 📋 Planned Features

- Multi-language support (Python, Go, etc.)
- Real-time code generation
- VS Code extension
- CI/CD integration

## Quick Start

> 📝 **Note**: This SDK is specifically designed for communicating with Reatchify CMS APIs.

```bash
npx reatchify init
```

2. Configure your Reatchify CMS connection in `reatchify.config.json`:

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

3. Generate your SDK:

```bash
npx reatchify generate
```

## Configuration

### Basic Configuration

```json
{
  "apiKey": "your-reatchify-api-key",
  "apiVersion": "v2",
  "language": "ts",
  "stateManagement": "zustand",
  "httpClient": "axios",
  "outputDir": "./src/generated/reatchify",
  "naming": {
    "clientPrefix": "Reatchify",
    "storePrefix": "use",
    "hookPrefix": "use"
  }
}
```

**Configuration Options:**

- `apiKey`: Your Reatchify CMS API authentication key (can use `${REATCHIFY_API_KEY}` for environment variables)
- `apiVersion`: Reatchify CMS API version to use (`"v1"`, `"v2"`, `"v3"`). Defaults to `"v2"`
- `language`: Output language (`"js"`, `"ts"`, `"auto"`). Defaults to `"auto"`
- `stateManagement`: State management library (`"zustand"`, `"redux"`, `"none"`). Defaults to `"zustand"`
- `httpClient`: HTTP client library (`"axios"`, `"fetch"`, or custom client name). Defaults to `"axios"`
- `outputDir`: Directory where generated files will be placed. Defaults to `"./src/generated/reatchify"`
- `naming`: Custom naming prefixes for generated classes and hooks

### Folder Structure

Customize where generated files are placed:

```json
{
  "folderStructure": {
    "types": "types",
    "api": "api",
    "client": "client",
    "stores": "stores"
  }
}
```

### Client Configuration

Configure the main client class:

```json
{
  "client": {
    "enabled": true,
    "className": "MyAPIClient",
    "exportAsDefault": false,
    "includeUtils": true
  }
}
```

### API Configuration

Control API operation generation:

```json
{
  "api": {
    "enabled": true,
    "namespaceName": "api",
    "groupByResource": true,
    "includeHttpClient": true
  }
}
```

### Response Patterns

Choose between promise-based or result-based responses:

```json
{
  "response": {
    "pattern": "result", // "promise" | "result"
    "includeErrorClasses": true,
    "customErrorTypes": ["AuthError", "RateLimitError"]
  }
}
```

### Plugin System

Enable and configure plugins:

```json
{
  "plugins": {
    "enabled": true,
    "registryClassName": "PluginRegistry",
    "includeDefaultPlugins": false
  }
}
```

### Versioning

Configure API versioning:

```json
{
  "versioning": {
    "enabled": true,
    "headerName": "X-API-Version",
    "defaultVersion": "v1",
    "versionFromPackage": false
  }
}
```

### Error Handling

Customize error classes:

```json
{
  "errorHandling": {
    "enabled": true,
    "includeNetworkErrors": true,
    "includeValidationErrors": true,
    "customErrorClasses": [
      {
        "name": "AuthenticationError",
        "baseClass": "ApiError",
        "properties": ["statusCode", "requiresAuth"]
      }
    ]
  }
}
```

### API Version Configuration

Choose which Reatchify CMS API version to use. The SDK connects to Reatchify CMS with predefined base URLs and endpoints:

```json
{
  "apiVersion": "v2"
}
```

**Options:**

- `apiVersion`: Choose from supported Reatchify CMS versions: `"v1"`, `"v2"`, `"v3"`
- **Default**: `"v2"` (current stable version)
- **Note**: Base URLs, headers, and Reatchify CMS API endpoints are managed internally and cannot be configured by users

### Code Generation Options

Control code generation output:

```json
{
  "generation": {
    "includeComments": true,
    "includeJSDoc": true,
    "minify": false,
    "sourceMap": false,
    "declarationFiles": true
  }
}
```

### Environment Overrides

Configure different settings for different environments. Environment-specific settings override top-level configuration:

```json
{
  "apiVersion": "v2",
  "environments": {
    "dev": {
      "apiVersion": "v1",
      "outputDir": "./src/generated/dev"
    },
    "staging": {
      "apiVersion": "v2",
      "httpClient": "fetch"
    },
    "prod": {
      "apiVersion": "v3",
      "stateManagement": "redux"
    }
  }
}
```

**How it works:**

- Set `NODE_ENV` environment variable to match an environment key (`dev`, `staging`, `prod`)
- Environment-specific settings override top-level settings
- **API Version Precedence**: `environments[env].apiVersion` > `apiVersion` > internal default (`"v2"`)
- **Note**: Reatchify CMS base URLs are automatically selected based on environment (dev/staging/prod)

## Complete Configuration Reference

### Top-Level Options

| Option            | Type     | Default                       | Description                                         |
| ----------------- | -------- | ----------------------------- | --------------------------------------------------- |
| `apiKey`          | `string` | -                             | API authentication key (supports `${VAR}` syntax)   |
| `apiVersion`      | `string` | `"v2"`                        | API version (`"v1"`, `"v2"`, `"v3"`)                |
| `language`        | `string` | `"auto"`                      | Output language (`"js"`, `"ts"`, `"auto"`)          |
| `stateManagement` | `string` | `"zustand"`                   | State management (`"zustand"`, `"redux"`, `"none"`) |
| `httpClient`      | `string` | `"axios"`                     | HTTP client (`"axios"`, `"fetch"`, or custom)       |
| `outputDir`       | `string` | `"./src/generated/reatchify"` | Output directory for generated files                |
| `environments`    | `object` | -                             | Environment-specific overrides                      |

### Naming Configuration

```json
{
  "naming": {
    "clientPrefix": "Reatchify",
    "storePrefix": "use",
    "hookPrefix": "use"
  }
}
```

### Folder Structure

```json
{
  "folderStructure": {
    "types": "types",
    "api": "api",
    "client": "client",
    "stores": "stores"
  }
}
```

### Client Configuration

```json
{
  "client": {
    "enabled": true,
    "className": "ReatchifyClient",
    "exportAsDefault": false,
    "includeUtils": true
  }
}
```

### API Configuration

```json
{
  "api": {
    "enabled": true,
    "namespaceName": "api",
    "groupByResource": true,
    "includeHttpClient": true
  }
}
```

### Response Patterns

```json
{
  "response": {
    "pattern": "result",
    "includeErrorClasses": true,
    "customErrorTypes": ["AuthError", "RateLimitError"]
  }
}
```

### Plugin System

```json
{
  "plugins": {
    "enabled": true,
    "registryClassName": "PluginRegistry",
    "includeDefaultPlugins": false
  }
}
```

### HTTP Configuration

```json
{
  "http": {
    "timeout": 30000,
    "headers": {
      "X-Custom-Header": "value"
    },
    "retry": {
      "enabled": true,
      "maxAttempts": 3,
      "delay": 1000
    },
    "interceptors": {
      "request": true,
      "response": true
    }
  }
}
```

### Error Handling

```json
{
  "errorHandling": {
    "enabled": true,
    "includeNetworkErrors": true,
    "includeValidationErrors": true,
    "customErrorClasses": [
      {
        "name": "AuthenticationError",
        "baseClass": "ApiError",
        "properties": ["statusCode", "requiresAuth"]
      }
    ]
  }
}
```

### Code Generation

```json
{
  "generation": {
    "includeComments": true,
    "includeJSDoc": true,
    "minify": false,
    "sourceMap": false,
    "declarationFiles": true
  }
}
```

### Advanced Options

```json
{
  "advanced": {
    "customTemplates": {
      "client": "path/to/custom/client.template.ts"
    },
    "transformers": [
      {
        "name": "add-logging",
        "transform": "(code) => code.replace('return response', 'console.log(response); return response')"
      }
    ],
    "hooks": {
      "beforeGenerate": () => console.log("Starting generation..."),
      "afterGenerate": () => console.log("Generation completed!"),
      "onError": (error) => console.error("Generation failed:", error)
    }
  }
}
```

## Usage Examples

### Basic Usage

```typescript
import { ReatchifyClient } from "./src/generated/reatchify";

const client = new ReatchifyClient({
  apiKey: "your-reatchify-api-key",
  // apiVersion is configured in reatchify.config.json
});

// Use the Reatchify CMS API
const users = await client.api.users();
const user = await client.api.users__id({ id: "123" });
```

### With Plugins

```typescript
import { ReatchifyClient } from "./src/generated/reatchify";

// Create a logging plugin
const loggingPlugin = {
  name: "logger",
  beforeRequest: (config) => {
    console.log("Making request to Reatchify CMS:", config);
    return config;
  },
  afterResponse: (response) => {
    console.log("Received response from Reatchify CMS:", response);
    return response;
  },
};

const client = new ReatchifyClient({
  apiKey: "your-reatchify-api-key",
  plugins: [loggingPlugin],
});
```

### Result Pattern Responses

```typescript
const response = await client.api.users();

if (response.error) {
  console.error("Error:", response.error);
} else {
  console.log("Users:", response.data);
}
```

### Using Stores (with Zustand)

```typescript
import { useUsersStore, useUsers__idStore } from "./src/generated/reatchify";

// In a React component
function UsersList() {
  const { data: users, loading, error, fetch } = useUsersStore();

  useEffect(() => {
    fetch(); // Fetches users from Reatchify CMS
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

## Advanced Features

### Custom Templates

Override default code generation templates:

```json
{
  "advanced": {
    "customTemplates": {
      "client": "path/to/custom/client.template.ts"
    }
  }
}
```

### Transformers

Apply custom transformations to generated code:

```json
{
  "advanced": {
    "transformers": [
      {
        "name": "add-logging",
        "transform": "(code) => code.replace('return response', 'console.log(response); return response')"
      }
    ]
  }
}
```

### Hooks

Run custom logic during generation:

```json
{
  "advanced": {
    "hooks": {
      "beforeGenerate": () => {
        console.log("Starting code generation...");
      },
      "afterGenerate": () => {
        console.log("Code generation completed!");
      },
      "onError": (error) => {
        console.error("Generation failed:", error);
      }
    }
  }
}
```

## API Reference

### ReatchifyClient

Main client class with plugin support.

#### Constructor

```typescript
new ReatchifyClient(config?: ReatchifyClientConfig)
```

#### Properties

- `api`: Access to generated API methods
- `request<T>(method, url, options)`: Make HTTP requests with plugin processing

### Plugin Interface

```typescript
interface Plugin {
  name: string;
  beforeRequest?: (config: any) => any;
  afterResponse?: (response: any) => any;
  onError?: (error: any) => any;
}
```

### ApiResponse Interface

```typescript
interface ApiResponse<T = any> {
  data: T | null;
  error: Error | null;
}
```

## Contributing

This project is in early development. We welcome contributions, but please note:

- APIs are subject to change
- Documentation may be incomplete
- Tests are still being written

### For Early Adopters

- Report bugs and unexpected behavior
- Suggest improvements and missing features
- Test with different project types and configurations

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/sdk.git`
3. Install dependencies: `npm install`
4. Build the project: `npm run build`
5. Test locally: `npm run dev`

### Reporting Issues

When reporting bugs, please include:

- Your `reatchify.config.json`
- Project type (Next.js, React, etc.)
- Node.js version
- Full error output

## License

MIT - See [LICENSE](LICENSE) file for details.

---

**Disclaimer**: This software is provided "as is" during development. Use at your own risk. Breaking changes may occur without notice until version 1.0.0.
