## ADDED Requirements

### Requirement: Patients can check in to a physical appointment
The system SHALL allow a patient to check in to a physical appointment via QR scan, MedGram ID number entry, or confirmation code, updating the appointment's status upon successful check-in.

#### Scenario: Successful check-in
- **WHEN** a patient completes check-in via any supported method for a physical appointment
- **THEN** the appointment's status is updated to reflect the patient has checked in

### Requirement: Checked-in patients see a live queue position
Once checked in, the system SHALL display the patient's current position in the appointment queue, refreshed periodically.

#### Scenario: Viewing queue position
- **WHEN** a patient has checked in and views the queue tracker
- **THEN** the system displays their current queue position and updates it on a periodic refresh
