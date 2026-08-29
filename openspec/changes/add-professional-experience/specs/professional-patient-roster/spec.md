## ADDED Requirements

### Requirement: Professionals can view their patient roster
The system SHALL provide a list of patients with whom a verified professional has an authorized care relationship (a past or upcoming consultation), gated by the same role check used elsewhere in the app.

#### Scenario: Viewing the roster
- **WHEN** a user whose profile role is not "patient" opens My Patients
- **THEN** the system displays patients with whom that professional has an authorized relationship

#### Scenario: Patient users cannot access the roster
- **WHEN** a user whose profile role is "patient" (or has no role set) navigates the app
- **THEN** the My Patients entry point is not shown

### Requirement: Professionals can view a patient's authorized chart
The system SHALL let a professional open the full authorized chart for a patient in their roster, and SHALL prevent access to charts of patients outside their authorized roster even via direct navigation.

#### Scenario: Viewing an authorized chart
- **WHEN** a professional opens a patient from their own roster
- **THEN** the system displays that patient's full authorized chart

#### Scenario: Accessing an unauthorized chart is blocked
- **WHEN** a professional attempts to open a chart for a patient outside their authorized roster
- **THEN** the system denies access
