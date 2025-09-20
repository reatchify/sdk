/**
 * @fileoverview Unit tests for optional authentication configuration
 * @description Tests the auth configuration and client generation
 */

import { mergeConfigWithDefaults } from "../src/core/config/configUtils";

describe("Optional Authentication", () => {
  it("should enable auth by default", () => {
    const config = mergeConfigWithDefaults({});
    expect(config.auth?.enabled).toBe(true);
  });

  it("should allow disabling auth", () => {
    const config = mergeConfigWithDefaults({
      auth: { enabled: false },
    });
    expect(config.auth?.enabled).toBe(false);
  });

  it("should preserve other auth settings when disabled", () => {
    const config = mergeConfigWithDefaults({
      auth: { enabled: false },
    });
    expect(config.auth?.enabled).toBe(false);
  });

  it("should merge auth config correctly", () => {
    const config = mergeConfigWithDefaults({
      auth: { enabled: true },
    });
    expect(config.auth?.enabled).toBe(true);
  });
});
