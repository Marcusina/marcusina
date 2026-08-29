## ADDED Requirements

### Requirement: Appointment list items open a detail view
The system SHALL navigate to an appointment detail screen when a patient taps an item in the appointment list.

#### Scenario: Tapping an appointment
- **WHEN** a patient taps an appointment card in the appointment list
- **THEN** the system navigates to a detail screen showing that appointment's provider, type, scheduled time, reason, and status

### Requirement: Appointment detail shows preparation information
The detail screen SHALL display location or join-link information (for physical vs. remote appointments) and any preparation instructions associated with the appointment.

#### Scenario: Viewing prep instructions
- **WHEN** an appointment has associated preparation instructions
- **THEN** the detail screen displays them alongside the location/link information

### Requirement: Patients can reschedule an appointment
The system SHALL allow a patient to reschedule a scheduled appointment to a new date/time, updating the persisted appointment record.

#### Scenario: Successful reschedule
- **WHEN** a patient selects a new date and time and confirms rescheduling from the detail screen
- **THEN** the appointment's scheduled time is updated via the backend and the change is reflected in the appointment list

### Requirement: Patients can cancel an appointment
The system SHALL allow a patient to cancel a scheduled appointment, updating its status to cancelled via the backend.

#### Scenario: Successful cancellation
- **WHEN** a patient confirms cancellation from the detail screen
- **THEN** the appointment's status is updated to cancelled and it is reflected as cancelled in the appointment list

### Requirement: Patients can set a reminder for a specific appointment
The system SHALL allow a patient to configure a reminder (on/off and lead time) for an individual appointment.

#### Scenario: Setting a reminder
- **WHEN** a patient enables a reminder with a chosen lead time on an appointment's detail screen
- **THEN** the reminder preference is persisted against that appointment
