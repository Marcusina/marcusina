## ADDED Requirements

### Requirement: Patients can set a medication reminder
The system SHALL let a patient configure a reminder (schedule/frequency) for taking a prescribed medication.

#### Scenario: Setting a reminder
- **WHEN** a patient configures a reminder schedule for a prescription
- **THEN** the reminder preference is persisted against that prescription

### Requirement: Patients can view medication history and adherence
The system SHALL provide a timeline view of a patient's medication history, including adherence relative to configured reminders.

#### Scenario: Viewing adherence history
- **WHEN** a patient opens the medication history view
- **THEN** the system displays past and current medications with adherence status relative to their reminder schedules
