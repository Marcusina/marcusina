## ADDED Requirements

### Requirement: Patients can view their lab and imaging orders
The system SHALL provide a list of the patient's lab and imaging orders, separated into pending and completed.

#### Scenario: Viewing orders
- **WHEN** a patient opens the lab & imaging orders screen
- **THEN** the system displays their orders grouped as Pending and Completed

### Requirement: Patients can track an order's status
The system SHALL provide a status tracker for an individual lab/imaging order.

#### Scenario: Viewing order status
- **WHEN** a patient opens a specific order from the orders list
- **THEN** the system displays that order's current status and any status history

### Requirement: Patients can select a preferred lab or diagnostic center
The system SHALL let a patient choose a preferred lab/diagnostic center for an order that has not yet been fulfilled.

#### Scenario: Selecting a lab
- **WHEN** a patient selects a diagnostic center for a pending order
- **THEN** the system persists that selection against the order
