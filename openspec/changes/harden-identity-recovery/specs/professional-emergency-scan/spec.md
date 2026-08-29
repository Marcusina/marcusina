## ADDED Requirements

### Requirement: Professionals can scan a patient's ID/QR for verified emergency access
The system SHALL let a verified professional scan a patient's ID or QR code to gain justification-prompted, audit-logged emergency access to that patient's emergency profile, gated by the same role check used elsewhere in the app.

#### Scenario: Scanning for emergency access
- **WHEN** a user whose profile role is not "patient" scans a patient's ID/QR and provides a justification
- **THEN** the system grants access to that patient's emergency profile and records the access in the audit log

#### Scenario: Patient users cannot access the scan flow
- **WHEN** a user whose profile role is "patient" (or has no role set) navigates the app
- **THEN** the scan entry point is not shown
