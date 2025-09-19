/**
 * @fileoverview Unit tests for config loading functionality
 * @description Tests the configLoader.ts and configUtils.ts modules
 */

describe("Config Loading", () => {
  describe("mergeConfigWithDefaults function", () => {
    it("should merge user config with comprehensive defaults", () => {
      const {
        mergeConfigWithDefaults,
      } = require("../src/core/config/configUtils");

      const userConfig = {
        apiKey: "user-key",
        httpClient: "fetch",
        projectType: "next",
      };

      const result = mergeConfigWithDefaults(userConfig);

      // User values should be preserved
      expect(result.apiKey).toBe("user-key");
      expect(result.httpClient).toBe("fetch");
      expect(result.projectType).toBe("next");

      // Defaults should be applied
      expect(result.language).toBe("ts");
      expect(result.stateManagement).toBe("zustand");
      expect(result.outputDir).toBe("./src/services");

      // Complex defaults should be present
      expect(result.folderStructure).toEqual({
        types: "types",
        api: "api",
        client: "client",
        stores: "stores",
      });

      expect(result.client).toEqual({
        enabled: true,
        className: "ReatchifyClient",
        exportAsDefault: false,
        includeUtils: true,
      });
    });

    it("should handle empty user config", () => {
      const {
        mergeConfigWithDefaults,
      } = require("../src/core/config/configUtils");

      const result = mergeConfigWithDefaults({});

      // Should have all defaults
      expect(result.language).toBe("ts");
      expect(result.stateManagement).toBe("zustand");
      expect(result.httpClient).toBe("axios");
      expect(result.outputDir).toBe("./src/services");
      expect(result.projectType).toBe("auto");
    });

    it("should merge nested objects correctly", () => {
      const {
        mergeConfigWithDefaults,
      } = require("../src/core/config/configUtils");

      const userConfig = {
        client: {
          className: "CustomClient",
          includeUtils: false,
        },
        folderStructure: {
          types: "custom-types",
        },
      };

      const result = mergeConfigWithDefaults(userConfig);

      // Should merge nested objects
      expect(result.client.className).toBe("CustomClient");
      expect(result.client.includeUtils).toBe(false);
      // Should preserve other defaults
      expect(result.client.enabled).toBe(true);
      expect(result.client.exportAsDefault).toBe(false);

      expect(result.folderStructure.types).toBe("custom-types");
      expect(result.folderStructure.api).toBe("api"); // default preserved
    });
  });
});
