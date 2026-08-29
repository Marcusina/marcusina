## ADDED Requirements

### Requirement: Confirmed appointments are reachable into the live-consult chain
The system SHALL provide a way to navigate from a confirmed, scheduled consultation appointment into the pre-consultation waiting room, for both the appointment list and consultation history views.

#### Scenario: Joining from consultation history
- **WHEN** a patient taps a scheduled (not-yet-completed) consultation in their consultation history
- **THEN** the system navigates to the pre-consultation waiting room for that appointment

#### Scenario: Joining from the appointment list
- **WHEN** a patient taps a consultation-type appointment in their appointment list
- **THEN** the system navigates to the pre-consultation waiting room for that appointment

### Requirement: Waiting room routes by consult type
The system SHALL route from the waiting room to the correct live-session screen based on the appointment's consultation type: chat-based consultations go to the async chat screen, and video/audio consultations go to the live video/audio screen.

#### Scenario: Chat consultation routing
- **WHEN** a patient proceeds from the waiting room for a consultation with type "Chat"
- **THEN** the system navigates to the async chat consultation screen

#### Scenario: Video/audio consultation routing
- **WHEN** a patient proceeds from the waiting room for a consultation with type "Video" or "Audio"
- **THEN** the system navigates to the live video/audio consultation screen
