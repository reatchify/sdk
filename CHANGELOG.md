# Changelog

All notable changes to the Reatchify SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-beta.2] - 2025-09-20

### Added

- **Optional Authentication**: New `auth.enabled` config option to disable API key authentication for public APIs
- **Selective Service Generation**: New `services.include` config option to generate only specific API services, reducing bundle size
- **Interactive CLI Setup**: Enhanced `reatchify init` command with prompts for authentication preference and service selection
- **Service Validation**: Automatic validation of selected services against API schema with helpful error messages
- **Conditional Client Generation**: Authentication headers are conditionally included based on config settings

### Changed

- **CLI User Experience**: Improved init command with guided setup for new configuration options
- **Code Generation Logic**: Enhanced API file generation to filter services based on user selection
- **Client Header Logic**: Authentication headers are now optional and configurable per client instance

### Technical Details

- **New Config Options**: `auth.enabled` (boolean) and `services.include` (string array)
- **Backward Compatibility**: All existing configurations continue to work unchanged
- **Test Coverage**: Added comprehensive tests for optional auth and selective service features
- **Documentation**: Updated README.md with new configuration examples and usage patterns

## [1.0.0-beta.1] - 2025-09-19

### Added

- **Smart output directory defaults**: Automatically detects existing `./src/services` directory and falls back to `./src/services/reatchify` if needed
- **Comprehensive unit tests**: Full test coverage for config generation, smart defaults, and config loading with Jest and TypeScript
- **Enhanced configuration system**: Improved config merging with nested object support and environment-specific overrides
- **TypeScript-first development**: Complete TypeScript support with proper type definitions and JSDoc comments
- **Plugin architecture**: Extensible plugin system for customizing HTTP requests and responses
- **Multi-environment support**: Environment-specific configuration for dev, staging, and production
- **API versioning**: Support for multiple API versions (v1, v2, v3) with automatic endpoint management
- **State management integration**: Built-in Zustand and Redux store generation with React hooks
- **Project type detection**: Automatic detection of Next.js, React, Vue, Svelte, Angular, and other frameworks
- **CLI improvements**: Enhanced command-line interface with better error handling and user experience

### Changed

- **Version bump**: Moved from development (0.0.2-beta.1) to beta release (1.0.0-beta.1)
- **Documentation updates**: Comprehensive README and API building guide with real-world examples
- **Configuration validation**: Improved config validation with better error messages
- **Build system**: Enhanced build pipeline with proper TypeScript compilation and bundling

### Fixed

- **Config template generation**: Fixed outputDir exclusion from generated config templates
- **Smart defaults logic**: Corrected fallback behavior for output directory detection
- **Test coverage**: Resolved all test failures and improved test reliability
- **Type safety**: Enhanced TypeScript definitions throughout the codebase

### Technical Details

- **Test Coverage**: 30%+ coverage of core utilities with comprehensive unit tests
- **Dependencies**: Updated to latest stable versions of axios, zustand, commander, and other dependencies
- **Build Output**: ESM and CommonJS builds with proper TypeScript declarations
- **Performance**: Optimized code generation pipeline with improved file output efficiency

## [0.0.2-beta.1] - 2025-09-01

### Added

- Initial beta release with core SDK functionality
- Basic TypeScript client generation
- CLI commands (init, generate, auth)
- Configuration system with reatchify.config.json
- HTTP client support (Axios, Fetch)
- Basic state management (Zustand)
- API versioning support (v1, v2)
- Project type detection

### Changed

- Improved error handling and user feedback
- Enhanced configuration validation

### Fixed

- Various bugs in code generation
- Configuration loading issues
- CLI command stability

## [0.0.1-alpha] - 2025-08-01

### Added

- Initial alpha release
- Basic code generation functionality
- CLI framework setup
- Core configuration system
- Basic TypeScript support

---

## Versioning Policy

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

### Beta Releases

- Beta releases (1.0.0-beta.x) may contain minor breaking changes
- Breaking changes will be clearly documented in release notes
- Beta releases are not recommended for production use without thorough testing

### Release Schedule

- Beta releases: As needed for testing and feedback
- Stable releases: Quarterly or as major features are completed
- Patch releases: As needed for critical bug fixes

### Support Policy

- Latest beta release: Full support with bug fixes and minor enhancements
- Previous beta releases: Critical security fixes only
- Stable releases: 12 months of support from release date

---

## Contributing to Changelog

When contributing to this project, please:

1. Add entries to the "Unreleased" section above
2. Follow the existing format and categorization
3. Use present tense for changes ("Add feature" not "Added feature")
4. Reference issue/PR numbers when applicable
5. Test changes thoroughly before release

### Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security-related changes</content>
  <parameter name="filePath">c:\Work\playgroud\reachify\sdk\CHANGELOG.md
