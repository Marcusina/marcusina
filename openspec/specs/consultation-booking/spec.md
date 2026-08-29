## Purpose

Covers the unified consultation-booking flow: carrying the selected professional/consult type from the profile screen through booking and confirmation, persisting a real appointment on confirmation, and keeping booking as a single, non-duplicated flow.

## Requirements

### Requirement: Booking carries the selected professional and consult type
The system SHALL pass the professional identifier and selected consultation type chosen on the professional profile screen through navigation to the booking screen, and SHALL render the booking screen using that professional's real data rather than a hardcoded default.

#### Scenario: User books after selecting a professional and consult type
- **WHEN** a patient on the professional profile screen selects a consultation type and taps "Book Consultation"
- **THEN** the booking screen displays the same professional's name, specialty, and fee, pre-selected to the chosen consultation type

### Requirement: Booking confirmation reflects the actual selection
The system SHALL display the confirmation screen using the professional, consult type, date, slot, and fee actually selected during booking, not fixed placeholder values.

#### Scenario: Confirmation matches selection
- **WHEN** a patient selects a specific date and time slot on the booking screen and confirms
- **THEN** the confirmation screen shows that same doctor, date, time, and fee amount

### Requirement: Confirmed bookings create a persisted appointment
The system SHALL create an appointment record via the backend appointments API when a booking is confirmed, and SHALL surface a clear error state if the creation request fails rather than showing a false success state.

#### Scenario: Successful booking creates an appointment
- **WHEN** a patient confirms a booking and the appointment-creation request succeeds
- **THEN** a new appointment is persisted and later appears in the patient's appointment list and consultation history

#### Scenario: Failed booking does not show false confirmation
- **WHEN** a patient confirms a booking and the appointment-creation request fails
- **THEN** the system shows an error state and does not display the "Booking Confirmed" success screen

### Requirement: Single booking flow implementation
The system SHALL implement consultation booking as a single flow within one module, with no duplicate or orphaned booking screens elsewhere in the codebase.

#### Scenario: No duplicate booking screens remain
- **WHEN** the codebase is searched for consultation-booking screens
- **THEN** exactly one booking screen and one confirmation screen exist, both reachable only from the unified professional-profile → booking → confirmation path
