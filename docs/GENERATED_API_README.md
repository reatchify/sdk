# Generated API — How the Reatchify SDK produces and uses files

This document explains how the SDK generation pipeline creates code, what files it emits, and how to use the generated artifacts in an application.

## Overview

The generator reads a schema (OpenAPI-like or Reatchify schema) and produces a TypeScript client. It produces:

- types/ — TypeScript interfaces and type aliases for API request/response shapes
- api/ — Functions for each endpoint (grouped by resource or flattened depending on `groupByResource`)
- client/ — A small HTTP client wrapper (ReatchifyClient) and helpers
- stores/ — Optional Zustand/Redux store hooks for each resource
- index.ts — Barrel export that re-exports client, api, types and stores

The generation is driven by `src/core/generation/generate.ts` which coordinates the following steps:

1. Validate the config and schema
2. Generate type files (types/files.ts)
3. Generate API files (api/files.ts)
4. Generate client files (client template inside generate.ts)
5. Generate store files (stores/files.ts)
6. Create index files (utils/exports.ts → generateIndexFile & generateMainIndexFile)
7. Write files to `outputDir`

## File layout examples

When `outputDir` is `./src/generated/reatchify` and `folderStructure` is the default, the output looks like:

```
src/generated/reatchify/
  types/
    index.ts
    users.ts
    posts.ts
  api/
    index.ts
    users.ts
    posts.ts
  client/
    index.ts
    http.ts
    errors.ts
  stores/
    index.ts
    users.ts
    posts.ts
  index.ts
```

## How files are generated (short contract)

- Inputs: schema (endpoints, parameters, request/response shapes), `reatchify.config.json` (naming, folderStructure, outputDir)
- Outputs: one or more TypeScript files under `outputDir` matching the folder structure
- Error modes: invalid schema (throws), file write errors (I/O exceptions), naming collisions (generator sanitizes names but will warn)
- Success criteria: files written to disk and an `index.ts` barrel that re-exports expected modules

## Key generator utilities and responsibilities

- generateApiFiles (src/core/generation/api/files.ts)
  - Builds function signatures for each endpoint
  - Optionally groups endpoints by resource and emits one file per resource
  - Calls generateMethodName and generateParams to produce safe identifiers

- generateTypesFiles (src/core/generation/types/files.ts)
  - Emits interfaces and unions for request/response payloads
  - Produces a `types/index.ts` which re-exports all type modules

- generateClientFiles (inline in src/core/generation/generate.ts)
  - Creates the `ReatchifyClient` class, HTTP adapters (axios/fetch), and error classes
  - Includes `http.ts` helpers: buildQueryString, buildHeaders, serializeParams

- generateStoreFiles (src/core/generation/stores/files.ts)
  - Emits Zustand stores or Redux slices per resource when stateManagement enabled
  - Each store exposes `fetch`/`mutate` helpers wired to client.api functions

- exports utilities (src/core/generation/utils/exports.ts)
  - `generateIndexFile` creates a folder-level index.ts exporting file modules
  - `generateMainIndexFile` creates the root `index.ts` re-exporting client/api/types/stores

## Example generated code snippets

- Generated API function (users.ts)

```ts
export async function users(params?: { limit?: number; offset?: number }) {
  const res = await client.request({ method: 'GET', url: '/users', params });
  return res.data as User[];
}

export async function users__id({ id }: { id: string }) {
  const res = await client.request({ method: 'GET', url: `/users/${id}` });
  return res.data as User;
}
```

- Generated Type (types/users.ts)

```ts
export interface User {
  id: string;
  name: string;
  email?: string;
}
```

- Generated client/index.ts (simplified)

```ts
export class ReatchifyClient {
  constructor(private opts: { apiKey: string, baseUrl?: string }) {}

  api = {
    users,
    users__id,
  };

  request(config) {
    // uses axios or fetch adapter
  }
}
```

## Using the generated SDK

Import the client from the generated root and instantiate it:

```ts
import { ReatchifyClient } from "./src/generated/reatchify";

const client = new ReatchifyClient({ apiKey: process.env.REATCHIFY_KEY });

const users = await client.api.users({ limit: 10 });
```

For Zustand stores (if generated):

```tsx
import { useUsersStore } from "./src/generated/reatchify/stores";

function UsersList() {
  const { data, fetch } = useUsersStore();
  useEffect(() => { fetch(); }, []);
  return <div>{JSON.stringify(data)}</div>;
}
```

## Common pitfalls and tips

- Ensure unique operationIds or stable paths in the schema to avoid naming collisions
- If `groupByResource` is false, the generator emits a single `api/index.ts` containing all functions
- When switching HTTP clients, re-run generation so helper adapters are updated
- Check `reatchify.config.json` for `naming` rules to control prefixes and generated identifiers

## Where to look in the repo

- Generation entrypoint: `src/core/generation/generate.ts`
- API generation: `src/core/generation/api/files.ts`
- Types generation: `src/core/generation/types/files.ts`
- Stores generation: `src/core/generation/stores/files.ts`
- Utilities: `src/core/generation/utils/*`

## Next steps you can take

- Run `npx reatchify generate` in a project configured with `reatchify.config.json` pointing to your outputDir
- Inspect `src/generated/reatchify` to validate naming conventions
- Add custom templates by extending the generation code in `src/core/generation`

---

This document was generated by the Reatchify SDK development assistant. If you'd like this copied to the root README or a different filename, tell me where to place it.
