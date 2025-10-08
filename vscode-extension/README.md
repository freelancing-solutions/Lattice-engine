# Lattice Mutation Engine - VSCode Extension

A VSCode extension for real-time approval workflow integration with the Lattice Mutation Engine.

## Features

- **Real-time Approval Workflow**: Seamlessly integrate with the Lattice Mutation Engine for code change approvals
- **Visual Decorations**: See pending, approved, and rejected changes directly in your editor
- **Approval Queue**: Manage pending approval requests from within VSCode
- **Change History**: Track the history of all approved and rejected changes
- **Conflict Detection**: Identify and resolve conflicts in real-time
- **Validation**: Get immediate feedback on spec compliance and validation errors
- **Auto-approval**: Configure automatic approval for trusted changes

## Installation

1. Install the extension from the VSCode marketplace
2. Configure the Lattice Engine URL and API key in settings
3. Start the approval workflow with `Ctrl+Shift+P` → "Lattice: Start Approval Workflow"

## Configuration

Configure the extension in VSCode settings:

- `lattice.engineUrl`: URL of your Lattice Mutation Engine
- `lattice.apiKey`: API key for authentication
- `lattice.autoConnect`: Automatically connect on startup
- `lattice.autoApproval.enabled`: Enable automatic approval for trusted changes
- `lattice.notifications.enabled`: Enable desktop notifications

## Commands

- `Lattice: Start Approval Workflow` - Begin the approval workflow
- `Lattice: Stop Approval Workflow` - Stop the approval workflow
- `Lattice: Connect to Engine` - Connect to the Lattice Engine
- `Lattice: Disconnect from Engine` - Disconnect from the Lattice Engine
- `Lattice: Approve Change` - Approve a pending change
- `Lattice: Reject Change` - Reject a pending change
- `Lattice: Validate Current File` - Validate the current file against specs

## Views

### Approval Queue
Shows all pending approval requests with:
- Priority level
- File changes
- Line changes
- Request details

### Change History
Displays the history of approved/rejected changes with:
- Timestamps
- Approver/Rejecter information
- Change descriptions
- File modifications

## Development

To build and run the extension locally:

```bash
npm install
npm run compile
npm run package
```

## License

MIT License - see LICENSE file for details.