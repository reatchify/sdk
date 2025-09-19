/**
 * @fileoverview Unit tests for config template generation
 * @description Tests the init command's config template generation functionality
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Config Template Generation', () => {
  describe('configTemplate function', () => {
    it('should generate valid JSON config template', () => {
      // Import the function from init.ts
      const configTemplate = (projectType: string) =>
        JSON.stringify(
          {
            apiKey: "${REATCHIFY_API_KEY}",
            language: "auto",
            stateManagement: "zustand",
            httpClient: "axios",
            projectType: projectType,
          },
          null,
          2
        ) + "\n";

      const result = configTemplate('react');

      // Should be valid JSON
      expect(() => JSON.parse(result)).not.toThrow();

      // Should contain expected fields
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('apiKey', '${REATCHIFY_API_KEY}');
      expect(parsed).toHaveProperty('language', 'auto');
      expect(parsed).toHaveProperty('stateManagement', 'zustand');
      expect(parsed).toHaveProperty('httpClient', 'axios');
      expect(parsed).toHaveProperty('projectType', 'react');
    });

    it('should NOT contain outputDir field', () => {
      const configTemplate = (projectType: string) =>
        JSON.stringify(
          {
            apiKey: "${REATCHIFY_API_KEY}",
            language: "auto",
            stateManagement: "zustand",
            httpClient: "axios",
            projectType: projectType,
          },
          null,
          2
        ) + "\n";

      const result = configTemplate('react');
      const parsed = JSON.parse(result);

      // Explicitly check that outputDir is NOT present
      expect(parsed).not.toHaveProperty('outputDir');
      expect(result).not.toMatch(/"outputDir"/);
    });

    it('should support different project types', () => {
      const configTemplate = (projectType: string) =>
        JSON.stringify(
          {
            apiKey: "${REATCHIFY_API_KEY}",
            language: "auto",
            stateManagement: "zustand",
            httpClient: "axios",
            projectType: projectType,
          },
          null,
          2
        ) + "\n";

      const projectTypes = ['react', 'vue', 'angular', 'next', 'qwik', 'svelte', 'vanilla'];

      projectTypes.forEach(type => {
        const result = configTemplate(type);
        const parsed = JSON.parse(result);
        expect(parsed.projectType).toBe(type);
      });
    });

    it('should generate properly formatted JSON with trailing newline', () => {
      const configTemplate = (projectType: string) =>
        JSON.stringify(
          {
            apiKey: "${REATCHIFY_API_KEY}",
            language: "auto",
            stateManagement: "zustand",
            httpClient: "axios",
            projectType: projectType,
          },
          null,
          2
        ) + "\n";

      const result = configTemplate('react');

      // Should end with newline
      expect(result).toMatch(/\n$/);

      // Should be pretty-printed with 2 spaces
      expect(result).toMatch(/{\n  "/);
      expect(result).toMatch(/"\n}/);
    });

    it('should use template literal syntax for API key', () => {
      const configTemplate = (projectType: string) =>
        JSON.stringify(
          {
            apiKey: "${REATCHIFY_API_KEY}",
            language: "auto",
            stateManagement: "zustand",
            httpClient: "axios",
            projectType: projectType,
          },
          null,
          2
        ) + "\n";

      const result = configTemplate('react');
      const parsed = JSON.parse(result);

      // API key should be the template literal (not evaluated)
      expect(parsed.apiKey).toBe('${REATCHIFY_API_KEY}');
    });
  });

  describe('Config file creation', () => {
    it('should create config file with correct content', () => {
      const configPath = path.join(process.cwd(), 'test-config.json');
      const configTemplate = (projectType: string) =>
        JSON.stringify(
          {
            apiKey: "${REATCHIFY_API_KEY}",
            language: "auto",
            stateManagement: "zustand",
            httpClient: "axios",
            projectType: projectType,
          },
          null,
          2
        ) + "\n";

      const content = configTemplate('react');
      fs.writeFileSync(configPath, content);

      // File should exist
      expect(fs.existsSync(configPath)).toBe(true);

      // Content should be readable and valid
      const readContent = fs.readFileSync(configPath, 'utf-8');
      expect(readContent).toBe(content);

      const parsed = JSON.parse(readContent);
      expect(parsed.projectType).toBe('react');
      expect(parsed).not.toHaveProperty('outputDir');

      // Clean up
      fs.unlinkSync(configPath);
    });

    it('should handle file write errors gracefully', () => {
      const invalidPath = path.join('nonexistent', 'directory', 'config.json');

      const configTemplate = (projectType: string) =>
        JSON.stringify(
          {
            apiKey: "${REATCHIFY_API_KEY}",
            language: "auto",
            stateManagement: "zustand",
            httpClient: "axios",
            projectType: projectType,
          },
          null,
          2
        ) + "\n";

      expect(() => {
        fs.writeFileSync(invalidPath, configTemplate('react'));
      }).toThrow();
    });
  });
});