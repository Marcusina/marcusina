## ADDED Requirements

### Requirement: Patients can find pharmacies stocking a prescribed medication
The system SHALL let a patient search for pharmacies that carry a prescribed medication, showing price comparison where the backend permits it.

#### Scenario: Finding a pharmacy
- **WHEN** a patient searches for pharmacies from a prescription's detail screen
- **THEN** the system displays a list of pharmacies, with prices shown where available

### Requirement: Patients can reserve or order a prescribed medication
The system SHALL let a patient reserve or order a prescribed medication, handing off to checkout with the prescription reference attached.

#### Scenario: Reserving a medication
- **WHEN** a patient selects a pharmacy and chooses to reserve/order the medication
- **THEN** the system navigates to checkout carrying the medication and prescription reference

### Requirement: Patients can request a prescription refill
The system SHALL let a patient submit a refill request for an eligible (non-expired, non-cancelled) prescription.

#### Scenario: Requesting a refill
- **WHEN** a patient requests a refill for an eligible prescription
- **THEN** the system marks the prescription as refill-requested and persists that via the backend

#### Scenario: Refill blocked for ineligible prescription
- **WHEN** a patient attempts to request a refill for an expired or cancelled prescription
- **THEN** the system prevents the request and explains why
