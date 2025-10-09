## MODIFIED Requirements
### Requirement: Update Behavior
The update command SHALL update OpenSpec instruction files to the latest templates in a team-friendly manner.

#### Scenario: Running update command

- **WHEN** a user runs `openspec update`
- **THEN** the command SHALL:
  - Check if the `openspec` directory exists
  - Replace `openspec/AGENTS.md` with the latest template (complete replacement)
  - Create or refresh a root-level `AGENTS.md` file using the managed marker block (create if missing)
  - Update **only existing** AI tool configuration files (e.g., CLAUDE.md)
    - Check each registered AI tool configurator
    - For each configurator, check if its file exists
    - Update only files that already exist using their markers
    - Preserve user content outside markers
  - Display success message listing updated files

### Requirement: Tool-Agnostic Updates
The update command SHALL handle file updates in a predictable and safe manner while respecting team tool choices.

#### Scenario: Updating files

- **WHEN** updating files
- **THEN** completely replace `openspec/AGENTS.md` with the latest template
- **AND** create or update the root-level `AGENTS.md` using the OpenSpec markers
- **AND** update only the OpenSpec-managed blocks in **existing** AI tool files using markers
- **AND** use the default directory name `openspec`
- **AND** be idempotent (repeated runs have no additional effect)
- **AND** respect team members' AI tool choices by not creating additional tool files beyond the root `AGENTS.md`

### Requirement: Core Files Always Updated
The update command SHALL always update the core OpenSpec files and display an ASCII-safe success message.

#### Scenario: Successful update

- **WHEN** the update completes successfully
- **THEN** replace `openspec/AGENTS.md` with the latest template
- **AND** ensure the root-level `AGENTS.md` matches the latest template via the marker block
- **AND** update existing AI tool configuration files within markers
- **AND** display the message: "Updated OpenSpec instructions"
