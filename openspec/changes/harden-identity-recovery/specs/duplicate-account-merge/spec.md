## ADDED Requirements

### Requirement: Users can self-service merge duplicate accounts
The system SHALL provide a verify → confirm → merge flow for a user who discovers they hold two MedGram identities.

#### Scenario: Merging duplicate accounts
- **WHEN** a user completes verification of both identities and confirms the merge
- **THEN** the system merges the accounts into a single identity via the backend

#### Scenario: Merge fails verification
- **WHEN** a user cannot complete verification of both identities
- **THEN** the system does not perform the merge and explains what verification is missing
