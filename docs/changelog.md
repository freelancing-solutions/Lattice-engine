# Lattice VSCode Extension - Changelog

All notable changes to the Lattice VSCode Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.2] - 2024-10-09

### Added
- Authentication management with API key support
- Project management features (create, select, sync projects)
- Complete mutation workflows (propose, approve, reject mutations)
- Real-time synchronization with Lattice Engine
- Visual diff tools for mutation reviews
- Status bar integration showing current project and connection status
- Output panel for detailed logging and error reporting
- Automatic file watching and change detection
- Command palette integration for all major operations

### Changed
- Improved connection handling with automatic reconnection
- Enhanced error messaging and user feedback
- Optimized performance for large projects

### Fixed
- File watching reliability issues on Windows
- Authentication token refresh problems
- Visual diff rendering for certain file types

### Security
- Secure API key storage in VSCode secrets storage
- Encrypted communication with Lattice Engine servers
- Automatic token expiration handling

## [1.5.1] - 2024-09-15

### Fixed
- Extension activation issues in certain workspace configurations
- Memory leak when watching large numbers of files
- Status bar not updating correctly after project switches

### Changed
- Reduced extension startup time by 40%
- Improved error messages for network connectivity issues

## [1.5.0] - 2024-08-20

### Added
- Support for multiple workspace configurations
- Batch mutation operations
- Custom mutation templates
- Integration with Lattice Engine v2.0 API

### Changed
- Complete rewrite of the synchronization engine
- Updated UI components for better accessibility
- Migrated to VSCode extension API v1.74.0

### Deprecated
- Legacy configuration format (will be removed in v2.0.0)
- Old authentication method (API keys now required)

### Fixed
- Resolved conflicts with other Git-related extensions
- Fixed file encoding issues for non-UTF8 files

## [1.4.2] - 2024-07-10

### Fixed
- Extension crashes when handling very large files (>10MB)
- Incorrect line ending handling in Windows environments
- Authentication dialog not appearing in some scenarios

### Security
- Updated dependencies to address security vulnerabilities

## [1.4.1] - 2024-06-05

### Fixed
- Status bar showing incorrect project information
- Commands not appearing in command palette after installation
- File watching not working for newly created files

### Changed
- Improved handling of network timeouts
- Better error recovery mechanisms

## [1.4.0] - 2024-05-01

### Added
- Real-time collaboration features
- Live preview of mutations
- Support for external diff tools
- Workspace-specific settings

### Changed
- Redesigned user interface based on user feedback
- Improved performance for projects with 1000+ files
- Enhanced keyboard shortcuts and navigation

### Fixed
- Resolved memory usage issues during long-running sessions
- Fixed problems with symlink handling

## [1.3.0] - 2024-03-15

### Added
- Support for Lattice Engine organizations
- Team collaboration features
- Advanced filtering and search for mutations
- Export functionality for mutation reports

### Changed
- Updated authentication flow for improved security
- Improved synchronization reliability

### Fixed
- Issues with concurrent mutation handling
- Problems with branch switching in Git repositories

## [1.2.1] - 2024-02-01

### Fixed
- Extension not loading in VSCode Insiders build
- Authentication token expiration not being handled properly
- Visual diff viewer showing incorrect changes

## [1.2.0] - 2024-01-10

### Added
- Support for custom mutation workflows
- Integration with popular CI/CD platforms
- Advanced conflict resolution tools
- Mutation history and rollback capabilities

### Changed
- Improved synchronization algorithm for better performance
- Enhanced user onboarding experience

### Fixed
- Issues with file permissions on Unix systems
- Problems with network proxy configurations

## [1.1.0] - 2023-12-01

### Added
- Basic mutation proposal and approval workflow
- File synchronization with Lattice Engine
- Simple authentication system
- Command palette integration

### Changed
- Initial release features
- Basic project management capabilities

---

For detailed documentation on all features, see the [VSCode Extension Guide](docs/vscode-extension-guide.md).

## Support

- 📖 [Documentation](docs/vscode-extension-guide.md)
- 🐛 [Report Issues](https://github.com/freelancing-solutions/Lattice-engine/issues)
- 💬 [Community Discussions](https://github.com/freelancing-solutions/Lattice-engine/discussions)
- 📧 [Support Email](mailto:support@project-lattice.site)