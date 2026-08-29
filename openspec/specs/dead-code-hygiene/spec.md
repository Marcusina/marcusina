## Purpose

Repo-hygiene invariants: no orphaned duplicate screen files, and no navigation wrapper components passing props into screens that never consume them.

## Requirements

### Requirement: No orphaned duplicate screen files remain
The codebase SHALL NOT contain a screen file with zero importers that duplicates the export name of a live, imported screen file.

#### Scenario: Checking for the orphaned Health screens file
- **WHEN** the repository is searched for import references to `screens/HealthScreens`
- **THEN** no import references exist, and the file itself is absent from the repository

### Requirement: No unused pass-through props remain on Home and Profile screens
Navigation wrapper components SHALL NOT pass props into a screen component that the screen component never invokes.

#### Scenario: Checking Home screen props
- **WHEN** `screens/HomeScreen.js` is inspected for `onOpenProfile`, `onConsult`, `onOpenGroups`, and `onOpenPlace`
- **THEN** none of these props are destructured or passed in, on either the caller or callee side

#### Scenario: Checking Profile screen props
- **WHEN** `screens/ProfileScreen.js` is inspected for `onBackHome` and `onLogout` on the affected components
- **THEN** neither prop is destructured or passed in unless it is actually invoked in the component body
