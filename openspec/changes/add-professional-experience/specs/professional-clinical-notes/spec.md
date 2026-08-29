## ADDED Requirements

### Requirement: Professionals can browse their authored clinical notes
The system SHALL provide a library view of clinical notes a professional has authored during consultations, gated by the same role check used elsewhere in the app.

#### Scenario: Browsing notes
- **WHEN** a user whose profile role is not "patient" opens the Clinical Notes library
- **THEN** the system displays notes that professional has authored, most recent first
