## ADDED Requirements

### Requirement: Patients can view a completed result, including radiology
The system SHALL provide a result viewer for a completed lab or radiology order.

#### Scenario: Viewing a completed result
- **WHEN** a patient opens a completed order
- **THEN** the system displays the result details, including radiology images/reports where applicable

### Requirement: Patients can view a trend chart for repeat results
The system SHALL display a trend chart when a patient has two or more completed results of the same test type.

#### Scenario: Viewing a trend
- **WHEN** a patient has multiple completed results of the same test type
- **THEN** the system displays a chart showing that value's trend over time

#### Scenario: Insufficient data for a trend
- **WHEN** a patient has fewer than two completed results of a given test type
- **THEN** the system shows a message indicating there isn't enough data yet, instead of an empty or broken chart

### Requirement: Patients can share a result with a professional
The system SHALL let a patient share a specific lab/imaging result with a named professional, recorded as a scoped consent grant.

#### Scenario: Sharing a result
- **WHEN** a patient chooses to share a specific result with a professional
- **THEN** the system records a consent grant scoped to that result and professional, and the professional gains access to it
