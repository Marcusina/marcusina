## ADDED Requirements

### Requirement: Users see a confidence indicator when verification is incomplete
The system SHALL display a status badge and explainer when a user's account has one or more unresolved identity-verification steps.

#### Scenario: Unresolved verification steps exist
- **WHEN** a user has at least one unresolved identity-verification step
- **THEN** the system displays a confidence indicator badge and, when opened, explains which steps remain

#### Scenario: All verification steps resolved
- **WHEN** a user has no unresolved identity-verification steps
- **THEN** the system does not display the confidence indicator badge
