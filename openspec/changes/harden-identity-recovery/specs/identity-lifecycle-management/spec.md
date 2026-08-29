## ADDED Requirements

### Requirement: Users can recover a lost or disputed MedGram ID
The system SHALL provide a flow for a user to recover their MedGram ID when it is lost or disputed.

#### Scenario: Recovering a MedGram ID
- **WHEN** a user completes the required verification steps in the Recover MedGram ID flow
- **THEN** the system either restores access to the MedGram ID or clearly explains the next required step

### Requirement: Users can request a replacement digital or physical card
The system SHALL let a user request a replacement digital or physical health card.

#### Scenario: Requesting a replacement
- **WHEN** a user submits a replacement card request
- **THEN** the system records the request and shows its status

### Requirement: Users can suspend their identity
The system SHALL let a user suspend their identity in cases of suspected fraud or a stolen device, and the action SHALL NOT report success unless the suspension is actually persisted by the backend.

#### Scenario: Suspending identity with backend support
- **WHEN** a user confirms identity suspension and the backend accepts the request
- **THEN** the system marks the identity as suspended and reflects that state throughout the app

#### Scenario: Suspending identity without backend support
- **WHEN** a user confirms identity suspension and no backend endpoint is available to process it
- **THEN** the system shows an explicit pending-review state and does not claim the identity has been suspended

### Requirement: Users can reissue their identity
The system SHALL let a user reissue their identity after suspension or a major life change, following the same non-fake-success rule as suspension.

#### Scenario: Reissuing identity
- **WHEN** a user completes the reissue flow and the backend confirms the reissue
- **THEN** the system reflects the newly reissued identity

### Requirement: Users can view their identity verification and change history
The system SHALL provide a history view of identity verification events and changes.

#### Scenario: Viewing history
- **WHEN** a user opens their identity verification and change history
- **THEN** the system displays a chronological list of verification events and identity changes
