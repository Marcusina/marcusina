## MODIFIED Requirements

### Requirement: Confirmed appointments are reachable into the live-consult chain
The system SHALL provide a way to navigate from a confirmed, scheduled consultation appointment into the pre-consultation waiting room, for both the appointment list and consultation history views.

#### Scenario: Joining from consultation history
- **WHEN** a patient taps a scheduled (not-yet-completed) consultation in their consultation history
- **THEN** the system navigates to the pre-consultation waiting room for that appointment

#### Scenario: Joining from the appointment list
- **WHEN** a patient taps a consultation-type appointment in their appointment list
- **THEN** the system navigates to that appointment's detail screen, which offers a prominent "Join Waiting Room" action into the pre-consultation waiting room

Superseded by `add-appointment-management`: the appointment list now routes every tap through the appointment detail screen (`appointment-detail` capability) rather than sending consultation-type appointments straight to the waiting room, so the list has one consistent tap target regardless of appointment type. The waiting room stays one tap away via a prominent action on the detail screen instead.
