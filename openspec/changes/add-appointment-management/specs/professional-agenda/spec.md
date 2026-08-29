## ADDED Requirements

### Requirement: Professionals see a Today's Agenda view
The system SHALL provide a Professional-mode screen listing the current day's booked appointments for a verified professional user, gated by the same role check used elsewhere in the app.

#### Scenario: Professional views today's agenda
- **WHEN** a user whose profile role is not "patient" opens the Today's Agenda screen
- **THEN** the system displays that day's booked appointments for the professional

#### Scenario: Patient users do not see the agenda
- **WHEN** a user whose profile role is "patient" (or has no role set) navigates the app
- **THEN** the Today's Agenda entry point is not shown
