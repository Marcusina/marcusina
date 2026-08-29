## Purpose

Covers navigating from the prescriptions list into a full detail view, and the redeemable verification view a pharmacy uses to dispense a prescription.

## Requirements

### Requirement: Prescription list items open a detail view
The system SHALL navigate to a prescription detail screen when a patient taps an item in the prescriptions list.

#### Scenario: Tapping a prescription
- **WHEN** a patient taps a prescription card in the prescriptions list
- **THEN** the system navigates to a detail screen showing the medication(s), dosage, instructions, prescribing provider, and status

### Requirement: Prescriptions have a redeemable verification view
The system SHALL provide a QR code / verification code view for a prescription that a pharmacy can scan or enter to verify and dispense it.

#### Scenario: Viewing the verification code
- **WHEN** a patient opens the verification view for an active prescription
- **THEN** the system displays a scannable code and the prescription number
