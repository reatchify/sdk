/**
 * @fileoverview Unit tests for selective service generation
 * @description Tests the service filtering and validation logic
 */

import { generateApiFiles } from "../src/core/generation/api/files";

describe("Selective Service Generation", () => {
  const mockSchema = {
    endpoints: [
      {
        path: "/users",
        method: "GET",
        description: "Get all users",
        response: { type: "User[]" },
      },
      {
        path: "/users/{id}",
        method: "GET",
        description: "Get user by ID",
        parameters: [{ name: "id", type: "string", required: true }],
        response: { type: "User" },
      },
      {
        path: "/posts",
        method: "GET",
        description: "Get all posts",
        response: { type: "Post[]" },
      },
      {
        path: "/comments",
        method: "GET",
        description: "Get all comments",
        response: { type: "Comment[]" },
      },
    ],
    types: {
      User: { id: "string", name: "string" },
      Post: { id: "string", title: "string" },
      Comment: { id: "string", text: "string" },
    },
  };

  const mockConfig = {
    generation: { includeComments: false },
    api: { groupByResource: true, includeHttpClient: false },
  };

  it("should generate all services when no services.include is specified", () => {
    const result = generateApiFiles(mockSchema, mockConfig);
    expect(Object.keys(result)).toContain("users.ts");
    expect(Object.keys(result)).toContain("posts.ts");
    expect(Object.keys(result)).toContain("comments.ts");
    expect(Object.keys(result)).toContain("index.ts");
  });

  it("should generate only selected services when services.include is specified", () => {
    const configWithSelection = {
      ...mockConfig,
      services: { include: ["users", "posts"] },
    };

    const result = generateApiFiles(mockSchema, configWithSelection);
    expect(Object.keys(result)).toContain("users.ts");
    expect(Object.keys(result)).toContain("posts.ts");
    expect(Object.keys(result)).not.toContain("comments.ts");
    expect(Object.keys(result)).toContain("index.ts");
  });

  it("should handle empty services array", () => {
    const configWithEmptySelection = {
      ...mockConfig,
      services: { include: [] },
    };

    const result = generateApiFiles(mockSchema, configWithEmptySelection);
    // Should generate index.ts but no service files
    expect(Object.keys(result)).toEqual(["index.ts"]);
  });

  it("should warn about non-existent services", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

    const configWithInvalidSelection = {
      ...mockConfig,
      services: { include: ["users", "nonexistent"] },
    };

    generateApiFiles(mockSchema, configWithInvalidSelection);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("nonexistent")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Available services")
    );

    consoleSpy.mockRestore();
  });
});
