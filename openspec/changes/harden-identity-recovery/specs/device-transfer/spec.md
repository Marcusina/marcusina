## ADDED Requirements

### Requirement: Users can transfer their active session to a new device
The system SHALL let a user move their active MedGram ID session to a new device through a verified transfer flow.

#### Scenario: Transferring to a new device
- **WHEN** a user completes device verification and confirms the transfer
- **THEN** the system activates the session on the new device and invalidates it on the prior device per backend confirmation

#### Scenario: Transfer without backend support
- **WHEN** no backend endpoint is available to process the transfer
- **THEN** the system shows an explicit pending-review state and does not claim the transfer succeeded
