## Purpose

Covers a verified professional's ability to create prescriptions for a patient, including drug interaction/allergy alerting, gated behind the same role check used elsewhere in the app.

## Requirements

### Requirement: Professionals can create a prescription
The system SHALL let a verified professional user create a prescription for a patient, gated by the same role check used elsewhere in the app.

#### Scenario: Professional creates a prescription
- **WHEN** a user whose profile role is not "patient" submits a new prescription for a patient
- **THEN** the system persists the prescription via the backend and it becomes visible in the patient's prescriptions list

#### Scenario: Patient users cannot access prescribing
- **WHEN** a user whose profile role is "patient" (or has no role set) navigates the app
- **THEN** the prescribing entry point is not shown

### Requirement: Drug interaction and allergy alerts surface during prescribing
The system SHALL display an alert modal to the prescribing professional when the backend indicates a potential drug interaction or allergy conflict for the patient.

#### Scenario: Alert shown on conflict
- **WHEN** the backend indicates a potential interaction or allergy conflict for the medication being prescribed
- **THEN** the system displays an alert modal describing the conflict before the prescription is finalized
