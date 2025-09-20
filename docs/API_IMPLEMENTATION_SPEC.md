# Backend API Implementation Guide for Reatchify SDK

## Overview

This guide is for the backend/API development team. It specifies exactly what API endpoints, response formats, and behaviors your backend must implement to work with the Reatchify SDK. The SDK generates type-safe client code, so your API must match these specifications exactly.

## API Architecture Requirements

### 1. Base URL Structure

Your API must be accessible at predictable base URLs:

```
Production:  https://api.reatchify.com
Staging:     https://api-staging.reatchify.com
Development: https://api-dev.reatchify.com
```

### 2. Versioning Structure

All endpoints must include API versioning:

```
/api/v1/...
/api/v2/...
/api/v3/...
```

The SDK will automatically append the version based on client configuration.

### 3. Authentication

All endpoints require API key authentication:

**Header**: `Authorization: Bearer {api_key}`

**OR**

**Header**: `X-API-Key: {api_key}`

API keys must be validated on every request. Return `401 Unauthorized` for invalid/missing keys.

## Required Endpoints

### Users Resource

#### 1. List Users
```
GET /api/v2/users
```

**Query Parameters:**
- `limit` (optional): number, default 50, max 100
- `cursor` (optional): string, for pagination
- `filter[status]` (optional): string, "active" | "inactive"
- `filter[email]` (optional): string, email search
- `sort` (optional): string, "createdAt" | "name" | "email"
- `order` (optional): string, "asc" | "desc", default "desc"

**Response Format:**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "status": "active" | "inactive",
      "createdAt": "ISO8601 string",
      "updatedAt": "ISO8601 string",
      "avatar": "string (optional)"
    }
  ],
  "pagination": {
    "hasNext": true,
    "hasPrev": false,
    "cursor": "base64 encoded cursor",
    "limit": 50,
    "total": 1250
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid parameters
- `401`: Invalid API key
- `500`: Server error

#### 2. Get User by ID
```
GET /api/v2/users/{id}
```

**Path Parameters:**
- `id`: string (UUID format)

**Response Format:**
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "status": "active" | "inactive",
    "createdAt": "ISO8601 string",
    "updatedAt": "ISO8601 string",
    "avatar": "string (optional)",
    "lastLoginAt": "ISO8601 string (optional)"
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Invalid API key
- `404`: User not found
- `500`: Server error

#### 3. Create User
```
POST /api/v2/users
```

**Request Body:**
```json
{
  "name": "string (required, 2-100 chars)",
  "email": "string (required, valid email)",
  "password": "string (optional, if not provided, send welcome email)",
  "status": "active" | "inactive" (optional, default "active")
}
```

**Response Format:**
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "status": "active" | "inactive",
    "createdAt": "ISO8601 string",
    "updatedAt": "ISO8601 string"
  }
}
```

**Validation Rules:**
- `name`: Required, 2-100 characters, no special chars except spaces
- `email`: Required, valid email format, unique across all users
- `password`: Optional, if provided: 8+ chars, 1 uppercase, 1 lowercase, 1 number

**Status Codes:**
- `201`: Created successfully
- `400`: Validation error
- `401`: Invalid API key
- `409`: Email already exists
- `500`: Server error

#### 4. Update User
```
PUT /api/v2/users/{id}
```

**Path Parameters:**
- `id`: string (UUID)

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "status": "active" | "inactive" (optional)"
}
```

**Response Format:**
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "status": "active" | "inactive",
    "createdAt": "ISO8601 string",
    "updatedAt": "ISO8601 string"
  }
}
```

**Status Codes:**
- `200`: Updated successfully
- `400`: Validation error
- `401`: Invalid API key
- `404`: User not found
- `409`: Email already exists
- `500`: Server error

#### 5. Delete User
```
DELETE /api/v2/users/{id}
```

**Path Parameters:**
- `id`: string (UUID)

**Response Format:**
```json
{
  "data": {
    "id": "string",
    "deleted": true,
    "deletedAt": "ISO8601 string"
  }
}
```

**Status Codes:**
- `200`: Deleted successfully
- `401`: Invalid API key
- `404`: User not found
- `500`: Server error

## Error Response Format

All errors must follow this exact format:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {
      "field": "string (optional)",
      "value": "any (optional)",
      "constraint": "string (optional)"
    }
  }
}
```

### Error Codes

**Authentication Errors:**
- `UNAUTHORIZED`: Invalid or missing API key
- `FORBIDDEN`: API key lacks required permissions

**Validation Errors:**
- `VALIDATION_ERROR`: Invalid request data
- `REQUIRED_FIELD`: Missing required field
- `INVALID_FORMAT`: Field format is invalid
- `DUPLICATE_VALUE`: Unique constraint violation

**Resource Errors:**
- `NOT_FOUND`: Resource doesn't exist
- `ALREADY_EXISTS`: Resource already exists
- `CONFLICT`: Operation conflicts with current state

**System Errors:**
- `INTERNAL_ERROR`: Unexpected server error
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable
- `RATE_LIMITED`: Too many requests

### Error Examples

```json
// Validation error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email format is invalid",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "constraint": "email"
    }
  }
}

// Not found error
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "details": {
      "resource": "user",
      "id": "123"
    }
  }
}

// Duplicate error
{
  "error": {
    "code": "DUPLICATE_VALUE",
    "message": "Email already exists",
    "details": {
      "field": "email",
      "value": "user@example.com",
      "constraint": "unique"
    }
  }
}
```

## Pagination Implementation

### Cursor-Based Pagination

Use base64-encoded cursors for efficient pagination:

```javascript
// Encoding cursor (server-side)
const cursor = Buffer.from(JSON.stringify({
  id: lastItemId,
  createdAt: lastItemCreatedAt
})).toString('base64');

// Decoding cursor (server-side)
const decoded = JSON.parse(
  Buffer.from(cursor, 'base64').toString()
);
```

### Pagination Response Structure

```json
{
  "data": [...],
  "pagination": {
    "hasNext": true,      // Boolean: more items available
    "hasPrev": false,     // Boolean: previous page exists
    "cursor": "eyJpZCI6IjEyMyJ9", // Base64 cursor for next page
    "limit": 50,          // Number of items per page
    "total": 1250         // Total items available (optional)
  }
}
```

### Pagination Query Logic

```sql
-- Example SQL for cursor pagination
SELECT * FROM users
WHERE (created_at, id) > ($cursor_created_at, $cursor_id)
ORDER BY created_at ASC, id ASC
LIMIT $limit + 1;
```

## Rate Limiting

Implement rate limiting to prevent abuse:

- **Per API Key**: 1000 requests per 15 minutes
- **Per IP**: 100 requests per minute
- **Burst Limit**: 50 requests per second

Return `429 Too Many Requests` with:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "details": {
      "retryAfter": 60,
      "limit": 1000,
      "remaining": 0,
      "resetTime": "2024-01-01T12:00:00Z"
    }
  }
}
```

## CORS Configuration

Allow requests from web applications:

```javascript
// Allow these origins
const allowedOrigins = [
  'https://app.reatchify.com',
  'https://dashboard.reatchify.com',
  'http://localhost:3000',     // Development
  'http://localhost:3001'      // Development
];

// CORS headers
Access-Control-Allow-Origin: {origin}
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, X-API-Key
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

## Content Types

### Request Content Types
- `application/json`: All POST/PUT requests
- `application/x-www-form-urlencoded`: Alternative for simple requests

### Response Content Types
- `application/json`: All responses
- `Content-Type: application/json; charset=utf-8`

## Request/Response Headers

### Required Request Headers
```
Authorization: Bearer {api_key}
Content-Type: application/json
User-Agent: Reatchify-SDK/{version}
```

### Response Headers
```
Content-Type: application/json; charset=utf-8
X-API-Version: v2
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1640995200
```

## Data Validation Rules

### User Fields

**ID:**
- Format: UUID v4
- Required: Yes
- Read-only: Yes

**Name:**
- Type: String
- Min length: 2
- Max length: 100
- Pattern: `^[a-zA-Z\s'-]+$`
- Required: Yes

**Email:**
- Type: String
- Format: RFC 5322 compliant
- Max length: 254
- Unique: Yes
- Required: Yes

**Status:**
- Type: Enum
- Values: `active`, `inactive`
- Default: `active`
- Required: Yes

**Timestamps:**
- Format: ISO 8601
- Example: `2024-01-01T12:00:00.000Z`
- UTC timezone required
- Read-only: Yes

## Database Schema Requirements

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Indexes
  INDEX idx_users_email (email),
  INDEX idx_users_status (status),
  INDEX idx_users_created_at (created_at)
);
```

### Required Triggers

```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## API Schema Endpoint

Your API must provide a schema endpoint for SDK generation:

```
GET /api/v2/schema
```

**Response Format:**
```json
{
  "version": "2.0",
  "baseUrl": "https://api.reatchify.com/api/v2",
  "resources": {
    "users": {
      "endpoints": [
        {
          "method": "GET",
          "path": "/users",
          "description": "List users",
          "parameters": [
            {
              "name": "limit",
              "type": "number",
              "required": false,
              "default": 50
            }
          ],
          "response": {
            "type": "PaginatedResponse",
            "items": "User"
          }
        }
      ]
    }
  },
  "types": {
    "User": {
      "id": "string",
      "name": "string",
      "email": "string",
      "status": "string",
      "createdAt": "string",
      "updatedAt": "string"
    },
    "PaginatedResponse": {
      "data": "T[]",
      "pagination": "Pagination"
    },
    "Pagination": {
      "hasNext": "boolean",
      "hasPrev": "boolean",
      "cursor": "string?",
      "limit": "number",
      "total": "number"
    }
  }
}
```

## Testing Requirements

### Unit Tests

Test each endpoint with various scenarios:

```javascript
// Required test cases for GET /users
- Valid request with default parameters
- Valid request with custom limit
- Valid request with cursor pagination
- Invalid API key (401)
- Invalid parameters (400)
- Database connection error (500)

// Required test cases for POST /users
- Valid user creation (201)
- Missing required fields (400)
- Invalid email format (400)
- Duplicate email (409)
- Invalid API key (401)
```

### Integration Tests

Test complete user workflows:

```javascript
// User lifecycle test
1. Create user (POST /users)
2. Get user by ID (GET /users/{id})
3. Update user (PUT /users/{id})
4. List users (GET /users) - verify user appears
5. Delete user (DELETE /users/{id})
6. Verify deletion (GET /users/{id} returns 404)
```

### Load Testing

Test performance under load:

- **Concurrent Requests**: 100 simultaneous requests
- **Rate Limiting**: Verify 429 responses when exceeded
- **Response Time**: < 200ms for simple queries
- **Memory Usage**: Monitor for memory leaks

## Monitoring & Logging

### Required Logs

Log all API requests:

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "method": "GET",
  "path": "/api/v2/users",
  "statusCode": 200,
  "responseTime": 45,
  "apiKey": "ak_****1234",
  "userAgent": "Reatchify-SDK/1.0.0",
  "ip": "192.168.1.1",
  "requestId": "req_123456"
}
```

### Error Logs

Log all errors with context:

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "error",
  "method": "POST",
  "path": "/api/v2/users",
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email format is invalid",
    "field": "email"
  },
  "apiKey": "ak_****1234",
  "requestBody": {"name": "John", "email": "invalid"},
  "requestId": "req_123456"
}
```

## Deployment Checklist

Before deploying to production:

- [ ] All endpoints implemented and tested
- [ ] Authentication working correctly
- [ ] Validation rules enforced
- [ ] Error responses follow specification
- [ ] Pagination implemented correctly
- [ ] Rate limiting configured
- [ ] CORS headers set
- [ ] SSL/TLS enabled
- [ ] Monitoring and logging active
- [ ] Load testing completed
- [ ] Schema endpoint accessible
- [ ] API documentation updated

## Support

For questions about this specification:

1. Check this document first
2. Review the SDK source code for expected behavior
3. Test with the SDK to identify issues
4. Contact the backend team lead

Remember: The SDK generates client code based on these specifications. Any deviation will break the generated client libraries.</content>
<parameter name="filePath">c:\Work\playgroud\reachify\sdk\API_IMPLEMENTATION_SPEC.md