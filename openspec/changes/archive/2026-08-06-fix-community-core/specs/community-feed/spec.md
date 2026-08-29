## ADDED Requirements

### Requirement: Community tab lands on a chronological feed
The system SHALL make the Community tab's landing screen a chronological feed of community posts, not the groups directory.

#### Scenario: Opening the Community tab
- **WHEN** a user taps the Community tab in bottom navigation
- **THEN** the system displays a chronological feed of posts

### Requirement: Feed posts open a working detail view
The system SHALL navigate to a post detail/comments view when a user taps a post in the feed, routing short-video posts to the swipe-through viewer and other post types to a standard scrollable detail view.

#### Scenario: Opening a standard post
- **WHEN** a user taps a text, image, article, or poll post in the feed
- **THEN** the system opens a standard post detail screen showing its content and comments

#### Scenario: Opening a short-video post
- **WHEN** a user taps a short-video post in the feed
- **THEN** the system opens the short-video viewer for that post

### Requirement: Users can publish a post
The system SHALL persist a new post when a user completes the create-post composer and submits it, and the new post SHALL appear in the feed.

#### Scenario: Publishing a post
- **WHEN** a user completes the create-post composer and taps submit
- **THEN** the system persists the post via the backend and it becomes visible in the community feed

### Requirement: Groups directory remains reachable
The system SHALL keep the groups directory reachable from the Community feed as a secondary destination, and SHALL allow creating a new group from its entry point.

#### Scenario: Opening groups from the feed
- **WHEN** a user navigates to Groups from the Community feed
- **THEN** the system displays the groups directory

#### Scenario: Creating a group
- **WHEN** a user taps the create action on the groups directory and submits group details
- **THEN** the system persists the new group via the backend
