# Change Log

All notable changes to the "lattice-mutation-engine" extension will be documented in this file.

## [1.0.0] - 2024-01-01

### Added
- Initial release of Lattice Mutation Engine VSCode extension
- Real-time approval workflow integration
- Visual decorations for pending, approved, and rejected changes
- Approval Queue tree view for managing pending requests
- Change History tree view for tracking approved/rejected changes
- WebSocket connection for real-time updates
- Conflict detection and resolution
- Validation against spec compliance
- Auto-approval for trusted changes
- Comprehensive notification system
- Command palette integration
- Configurable settings and preferences
- Status bar integration
- Context menu actions
- Keyboard shortcuts for common actions

### Features
- **Connection Management**: Automatic connection to Lattice Engine with retry logic
- **Workflow Management**: Start/stop approval workflows with state synchronization
- **Visual Feedback**: Editor decorations for different change states
- **Real-time Updates**: WebSocket integration for instant notifications
- **History Tracking**: Complete audit trail of all changes
- **Validation**: Real-time spec validation and error reporting
- **Conflict Resolution**: Automatic conflict detection and resolution assistance

### Commands
- `lattice.startApprovalWorkflow` - Start the approval workflow
- `lattice.stopApprovalWorkflow` - Stop the approval workflow
- `lattice.connectToEngine` - Connect to Lattice Engine
- `lattice.disconnectFromEngine` - Disconnect from Lattice Engine
- `lattice.approveChange` - Approve a pending change
- `lattice.rejectChange` - Reject a pending change
- `lattice.validateCurrentFile` - Validate current file
- `lattice.showApprovalQueue` - Show approval queue
- `lattice.showChangeHistory` - Show change history
- `lattice.refreshApprovalQueue` - Refresh approval queue
- `lattice.refreshChangeHistory` - Refresh change history

### Configuration
- `lattice.engineUrl` - Lattice Engine API URL
- `lattice.apiKey` - API key for authentication
- `lattice.autoConnect` - Auto-connect on startup
- `lattice.autoApproval.enabled` - Enable auto-approval
- `lattice.notifications.enabled` - Enable notifications
- `lattice.decorations.enabled` - Enable editor decorations
- `lattice.validation.enabled` - Enable real-time validation