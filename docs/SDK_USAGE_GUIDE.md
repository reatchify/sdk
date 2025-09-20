# Reatchify SDK - Generated Code Usage Guide

## Overview

The Reatchify SDK generates fully-typed TypeScript client libraries for your APIs. This guide explains how the generated code works, how to use it, and what your backend API must provide.

## What Gets Generated

When you run `npx reatchify generate`, the SDK creates a complete client library with the following structure:

```
generated/
├── types/
│   ├── index.ts          # All type definitions
│   └── [resource].ts     # Resource-specific types
├── api/
│   ├── index.ts          # API function exports
│   └── [resource].ts     # Resource-specific API functions
├── client/
│   ├── index.ts          # Main client class
│   ├── http.ts           # HTTP client implementation
│   ├── errors.ts         # Error classes
│   └── plugins.ts        # Plugin system
├── stores/               # (if state management enabled)
│   ├── index.ts          # Store exports
│   └── [resource].ts     # Resource-specific stores
└── index.ts              # Main SDK export
```

## Backend API Requirements

### 1. RESTful Endpoints

Your API must follow RESTful conventions:

```http
# Standard CRUD operations
GET    /api/v2/users          # List users
GET    /api/v2/users/{id}     # Get specific user
POST   /api/v2/users          # Create user
PUT    /api/v2/users/{id}     # Update user
DELETE /api/v2/users/{id}     # Delete user

# Relationships
GET    /api/v2/users/{id}/posts    # User's posts
POST   /api/v2/posts/{id}/comments # Create comment
```

### 2. JSON Response Format

All responses must be valid JSON with consistent structure:

```json
{
  "data": {
    "id": "123",
    "type": "user",
    "attributes": {
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "relationships": {
      "posts": {
        "data": [{ "id": "456", "type": "post" }]
      }
    }
  }
}
```

### 3. Error Response Format

Errors must follow a consistent structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": {
      "field": "email",
      "value": null
    }
  }
}
```

### 4. Pagination Support

For list endpoints, implement cursor-based pagination:

```json
{
  "data": [...],
  "pagination": {
    "hasNext": true,
    "hasPrev": false,
    "cursor": "eyJpZCI6IjEyMyJ9",
    "limit": 50,
    "total": 1250
  }
}
```

### 5. HTTP Status Codes

Use appropriate HTTP status codes:

- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limited
- `500 Internal Server Error` - Server errors

## Generated Code Architecture

### 1. Type Definitions

The SDK generates TypeScript interfaces for all your API resources:

```typescript
// Generated types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface PaginatedUsersResponse {
  data: User[];
  pagination: {
    hasNext: boolean;
    hasPrev: boolean;
    cursor?: string;
    limit: number;
    total: number;
  };
}
```

### 2. API Functions

Each endpoint becomes a type-safe function:

```typescript
// Generated api/users.ts
export const getUsers = async (params: {
  limit?: number;
  cursor?: string;
  filter?: UserFilter;
}): Promise<PaginatedUsersResponse> => {
  return makeRequest("GET", "/users", { params });
};

export const getUserById = async (params: {
  id: string;
}): Promise<User> => {
  return makeRequest("GET", "/users/{id}", { params });
};

export const createUser = async (params: {
  data: CreateUserRequest;
}): Promise<User> => {
  return makeRequest("POST", "/users", {
    data: params.data
  });
};
```

### 3. HTTP Client

The core HTTP client handles authentication, retries, and error handling:

```typescript
// Generated client/http.ts
export class HttpClient {
  constructor(config: HttpConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
  }

  async request<T>(method: string, url: string, options: RequestOptions): Promise<T> {
    // Handle authentication
    // Make HTTP request
    // Parse response
    // Handle errors
    // Return typed data
  }
}
```

### 4. Main Client Class

The main client provides a clean interface:

```typescript
// Generated client/index.ts
export class ReatchifyClient {
  constructor(config: ClientConfig) {
    this.http = new HttpClient(config);
    this.apiKey = config.apiKey;
  }

  // API endpoints organized by resource
  api = {
    users: {
      getUsers: (params) => getUsers(this.http, params),
      getUserById: (params) => getUserById(this.http, params),
      createUser: (params) => createUser(this.http, params),
      updateUser: (params) => updateUser(this.http, params),
      deleteUser: (params) => deleteUser(this.http, params),
    }
  };
}
```

## How to Use the Generated SDK

### 1. Basic Setup

```typescript
import { ReatchifyClient } from './generated/reatchify';

// Initialize the client
const client = new ReatchifyClient({
  apiKey: process.env.REATCHIFY_API_KEY,
  baseUrl: 'https://api.yourapp.com',
  timeout: 30000,
});
```

### 2. Making API Calls

```typescript
// Get paginated users
const users = await client.api.users.getUsers({
  limit: 50,
  filter: { status: 'active' }
});

// Get specific user
const user = await client.api.users.getUserById({
  id: '123'
});

// Create new user
const newUser = await client.api.users.createUser({
  data: {
    name: 'John Doe',
    email: 'john@example.com'
  }
});

// Update user
const updatedUser = await client.api.users.updateUser({
  id: '123',
  data: {
    name: 'John Smith'
  }
});

// Delete user
await client.api.users.deleteUser({
  id: '123'
});
```

### 3. With State Management (Zustand)

```typescript
import { useUsersStore } from './generated/reatchify/stores';

// In a React component
function UsersList() {
  const {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  } = useUsersStore();

  useEffect(() => {
    fetchUsers({ limit: 20 });
  }, [fetchUsers]);

  const handleCreateUser = async (userData) => {
    await createUser({ data: userData });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
}
```

### 4. Error Handling

```typescript
try {
  const user = await client.api.users.getUserById({ id: '123' });
  console.log('User:', user);
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('User not found');
  } else if (error.code === 'VALIDATION_ERROR') {
    console.log('Validation error:', error.details);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### 5. Advanced Usage

```typescript
// With custom headers
const client = new ReatchifyClient({
  apiKey: 'your-key',
  headers: {
    'X-Custom-Header': 'value'
  }
});

// With plugins
const loggingPlugin = {
  beforeRequest: (config) => {
    console.log(`Making ${config.method} request to ${config.url}`);
    return config;
  },
  afterResponse: (response) => {
    console.log(`Response status: ${response.status}`);
    return response;
  }
};

const clientWithPlugins = new ReatchifyClient({
  apiKey: 'your-key',
  plugins: [loggingPlugin]
});
```

## Configuration Options

### Client Configuration

```typescript
interface ClientConfig {
  // Required
  apiKey: string;

  // Optional
  baseUrl?: string;              // Default: from environment
  timeout?: number;              // Default: 30000ms
  headers?: Record<string, string>; // Additional headers
  plugins?: Plugin[];            // Request/response plugins

  // HTTP client options
  httpClient?: 'axios' | 'fetch'; // Default: 'axios'
  retry?: {
    enabled: boolean;            // Default: true
    maxAttempts: number;         // Default: 3
    delay: number;               // Default: 1000ms
  };
}
```

### Environment-Specific Config

```typescript
// Development
const devClient = new ReatchifyClient({
  apiKey: process.env.DEV_API_KEY,
  baseUrl: 'https://api-dev.yourapp.com',
  timeout: 60000, // Longer timeout for dev
});

// Production
const prodClient = new ReatchifyClient({
  apiKey: process.env.PROD_API_KEY,
  baseUrl: 'https://api.yourapp.com',
  retry: {
    enabled: true,
    maxAttempts: 5,
    delay: 2000
  }
});
```

## API Versioning

The SDK supports multiple API versions:

```typescript
// Specify version in client config
const client = new ReatchifyClient({
  apiKey: 'your-key',
  apiVersion: 'v2'  // or 'v1', 'v3'
});

// Version-specific endpoints are automatically used
const users = await client.api.users.getUsers(); // Calls /api/v2/users
```

## State Management Integration

### Zustand Stores

```typescript
// Generated store structure
interface UsersStore {
  // State
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchUsers: (params?: UsersQuery) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  createUser: (data: CreateUserRequest) => Promise<void>;
  updateUser: (id: string, data: UpdateUserRequest) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  clearError: () => void;
}
```

### React Hooks

```typescript
// Use in components
function UserProfile({ userId }) {
  const { currentUser, loading, error, fetchUserById } = useUsersStore();

  useEffect(() => {
    if (userId) {
      fetchUserById(userId);
    }
  }, [userId, fetchUserById]);

  // Component logic...
}
```

## Plugin System

### Creating Plugins

```typescript
interface Plugin {
  name: string;
  beforeRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  afterResponse?: (response: Response) => Response | Promise<Response>;
  onError?: (error: Error) => Error | Promise<Error>;
}

// Authentication plugin
const authPlugin = {
  name: 'auth',
  beforeRequest: (config) => {
    config.headers.Authorization = `Bearer ${getToken()}`;
    return config;
  }
};

// Logging plugin
const loggingPlugin = {
  name: 'logging',
  beforeRequest: (config) => {
    console.log(`${config.method} ${config.url}`);
    return config;
  },
  afterResponse: (response) => {
    console.log(`Response: ${response.status}`);
    return response;
  }
};
```

### Using Plugins

```typescript
const client = new ReatchifyClient({
  apiKey: 'your-key',
  plugins: [authPlugin, loggingPlugin]
});
```

## Error Types

The SDK generates specific error classes:

```typescript
// Network errors
class NetworkError extends Error {
  code: 'NETWORK_ERROR';
  statusCode?: number;
}

// API errors
class ApiError extends Error {
  code: string;        // API-specific error code
  statusCode: number;  // HTTP status code
  details?: any;       // Additional error details
}

// Validation errors
class ValidationError extends ApiError {
  code: 'VALIDATION_ERROR';
  field?: string;      // Field that failed validation
  value?: any;         // Invalid value
}
```

## Best Practices

### 1. Error Handling

```typescript
// Always wrap API calls in try-catch
try {
  const user = await client.api.users.getUserById({ id: userId });
} catch (error) {
  // Handle specific error types
  switch (error.code) {
    case 'NOT_FOUND':
      showNotFoundPage();
      break;
    case 'VALIDATION_ERROR':
      showValidationErrors(error.details);
      break;
    case 'NETWORK_ERROR':
      showNetworkError();
      break;
    default:
      showGenericError(error.message);
  }
}
```

### 2. Loading States

```typescript
// Use loading states for better UX
const [loading, setLoading] = useState(false);

const handleSubmit = async (data) => {
  setLoading(true);
  try {
    await client.api.users.createUser({ data });
    showSuccessMessage();
  } catch (error) {
    showErrorMessage(error.message);
  } finally {
    setLoading(false);
  }
};
```

### 3. Optimistic Updates

```typescript
// Update UI immediately, then sync with server
const handleLike = async (postId) => {
  // Optimistic update
  setPosts(posts.map(post =>
    post.id === postId
      ? { ...post, likes: post.likes + 1 }
      : post
  ));

  try {
    await client.api.posts.likePost({ id: postId });
  } catch (error) {
    // Revert optimistic update on error
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, likes: post.likes - 1 }
        : post
    ));
  }
};
```

### 4. Caching Strategy

```typescript
// Implement caching for better performance
const cache = new Map();

const getCachedUser = async (id) => {
  if (cache.has(id)) {
    return cache.get(id);
  }

  const user = await client.api.users.getUserById({ id });
  cache.set(id, user);

  // Cache expiration
  setTimeout(() => cache.delete(id), 5 * 60 * 1000); // 5 minutes

  return user;
};
```

### 5. Request Batching

```typescript
// Batch multiple requests when possible
const [users, posts] = await Promise.all([
  client.api.users.getUsers({ limit: 10 }),
  client.api.posts.getPosts({ limit: 10 })
]);
```

## Troubleshooting

### Common Issues

1. **"Type 'X' is not assignable to type 'Y'"**
   - Check that your API response matches the expected interface
   - Verify that your backend returns the correct JSON structure

2. **"Network request failed"**
   - Check network connectivity
   - Verify API endpoint URLs
   - Check CORS configuration

3. **"Authentication failed"**
   - Verify API key is correct and not expired
   - Check that API key has required permissions

4. **"Validation error"**
   - Check request data format
   - Verify required fields are present
   - Check field types and constraints

### Debug Mode

Enable detailed logging:

```typescript
const client = new ReatchifyClient({
  apiKey: 'your-key',
  debug: true  // Enable debug logging
});
```

## Migration Guide

### From Manual API Calls

```typescript
// Before (manual)
const response = await fetch('/api/users', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
const users = await response.json();

// After (generated SDK)
const users = await client.api.users.getUsers();
```

### From Other SDKs

```typescript
// From Axios
// Before
const users = await axios.get('/api/users', { headers: { auth } });

// After
const users = await client.api.users.getUsers();

// From React Query
// Before
const { data: users } = useQuery('users', fetchUsers);

// After
const { users, loading, error } = useUsersStore();
```

## Performance Considerations

### 1. Bundle Size

The generated SDK is tree-shakeable:

```typescript
// Only import what you need
import { ReatchifyClient } from './generated/client';
import { getUsers } from './generated/api/users';
import { User } from './generated/types';
```

### 2. Request Optimization

```typescript
// Use appropriate caching headers
const client = new ReatchifyClient({
  apiKey: 'your-key',
  headers: {
    'Cache-Control': 'max-age=300'
  }
});
```

### 3. Connection Pooling

The HTTP client automatically handles connection pooling and keep-alive connections.

## Security Considerations

### 1. API Key Management

```typescript
// Never expose API keys in client-side code
// Use environment variables or secure key management
const client = new ReatchifyClient({
  apiKey: process.env.REACT_APP_API_KEY  // Only for public keys
});
```

### 2. CORS Configuration

Ensure your backend allows requests from your domains:

```javascript
// Backend CORS configuration
app.use(cors({
  origin: [
    'https://yourapp.com',
    'https://app.yourapp.com'
  ],
  credentials: true
}));
```

### 3. Rate Limiting

The SDK includes built-in retry logic, but respect API rate limits:

```typescript
const client = new ReatchifyClient({
  apiKey: 'your-key',
  retry: {
    enabled: true,
    maxAttempts: 3,
    delay: 1000,  // Exponential backoff
    backoff: 'exponential'
  }
});
```

## Support

For issues with the generated SDK:

1. Check the API response format matches expectations
2. Verify your backend implements the required endpoints
3. Review error messages for specific issues
4. Check network connectivity and CORS settings

For SDK generation issues, ensure:
1. Your API schema is valid and accessible
2. Configuration is correct
3. All dependencies are installed

---

This guide covers everything you need to know about using the Reatchify SDK's generated code. The SDK provides a type-safe, efficient, and maintainable way to interact with your APIs while ensuring consistency and reliability.</content>
<parameter name="filePath">c:\Work\playgroud\reachify\sdk\SDK_USAGE_GUIDE.md