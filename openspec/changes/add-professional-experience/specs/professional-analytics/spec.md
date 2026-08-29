## ADDED Requirements

### Requirement: Professionals can view their own analytics dashboard
The system SHALL provide an analytics dashboard summarizing a professional's own activity, gated by the same role check used elsewhere in the app.

#### Scenario: Viewing analytics
- **WHEN** a user whose profile role is not "patient" opens the Professional Analytics dashboard
- **THEN** the system displays that professional's own activity summary
