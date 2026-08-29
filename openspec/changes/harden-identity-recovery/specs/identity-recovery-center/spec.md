## ADDED Requirements

### Requirement: A single recovery center links every identity repair path
The system SHALL provide a single Identity & Account Recovery Center screen that links to credential recovery, MedGram ID recovery, card replacement, identity suspension, identity reissuance, duplicate-account merge, and device transfer.

#### Scenario: Discovering the right flow
- **WHEN** a user who is unsure which recovery flow they need opens the Recovery Center
- **THEN** the system displays all available recovery/repair entry points in one place

### Requirement: Recovery Center is reachable from key entry points
The system SHALL make the Recovery Center reachable from both the Me/Settings area and the Digital Health ID screen.

#### Scenario: Reaching the Recovery Center from Settings
- **WHEN** a user navigates from the Me tab looking for identity help
- **THEN** the system provides a path to the Recovery Center

#### Scenario: Reaching the Recovery Center from Digital Health ID
- **WHEN** a user navigates from the Digital Health ID screen looking for identity help
- **THEN** the system provides a path to the Recovery Center
