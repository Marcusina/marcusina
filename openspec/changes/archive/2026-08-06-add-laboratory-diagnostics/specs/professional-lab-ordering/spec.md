## ADDED Requirements

### Requirement: Professionals can order a lab or radiology test for a patient
The system SHALL let a verified professional user create a lab/radiology order for a patient, gated by the same role check used elsewhere in the app.

#### Scenario: Professional orders a test
- **WHEN** a user whose profile role is not "patient" creates a lab/radiology order for a patient
- **THEN** the system persists the order via the backend and it appears in that patient's pending orders

#### Scenario: Patient users cannot access order creation
- **WHEN** a user whose profile role is "patient" (or has no role set) navigates the app
- **THEN** the order-creation entry point is not shown
