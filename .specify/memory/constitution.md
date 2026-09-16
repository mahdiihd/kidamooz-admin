<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Added principles: Server Authority; Contract Alignment; Safe Administration; Verifiable UI; Focused Scope
- Added sections: Platform Constraints; Spec-Driven Workflow
- Removed sections: none
- Follow-up TODOs: none
-->
# Kidamooz Admin Constitution

## Core Principles

### I. Server Authority
The backend MUST enforce authentication, authorization, validation, and financial rules. Client-side guards
and form validation improve usability but MUST NOT be treated as security controls. Secrets and provider
credentials MUST never be added to browser code, committed environments, or UI logs.

### II. Contract Alignment
Every API contract change MUST be checked against the matching backend controller and DTO. Admin models,
services, mock behavior, forms, and response handling MUST remain aligned. Breaking changes require an
explicit migration or coordinated release plan.

### III. Safe Administration
Destructive or financially significant actions MUST be explicit, authorized, auditable, and protected from
duplicate submission. Forms MUST validate input, show pending state, report safe errors, and confirm success.
Manual balance or configuration changes MUST record the acting administrator and a reason.

### IV. Verifiable UI
Each feature MUST include acceptance scenarios for authorized, unauthorized, valid, invalid, loading, and
failure states as applicable. Executable changes MUST pass `npm run build`; changed behavior MUST have focused
tests and run with `npm test -- --watch=false`. Persian RTL presentation MUST be reviewed.

### V. Focused Scope
Specifications MUST describe one independently reviewable outcome. Existing feature, service, model, route,
toast, and form patterns MUST be reused before new frameworks or parallel abstractions are introduced.
Implementation details that do not help an administrator make a decision MUST stay out of the UI.

## Platform Constraints

- The panel uses Angular 21 and MUST not copy assumptions from the Angular 20 app.
- Pages belong in `src/app/features`, API access in `src/app/core/services`, and models in
  `src/app/core/models`.
- New routes MUST preserve lazy loading and the appropriate route guard.
- Public API addresses and credentials MUST not be hard-coded in components.

## Spec-Driven Workflow

1. Use Idea Assessment before investing in uncertain administrative or reporting capabilities.
2. Approved work proceeds through specify, optional clarify, plan, tasks, and analyze.
3. Plans MUST identify backend contract dependencies and permission boundaries.
4. Implementation follows approved tasks; discoveries update the artifacts rather than bypass them.
5. Run converge after implementation until the feature and verification evidence agree.

## Governance

This constitution governs Spec Kit work in the Kidamooz admin panel and complements `AGENTS.md`; the stricter
testable constraint applies. Amendments require a reason, impact review, and semantic version update. Plans
and reviews MUST check compliance. Any exception MUST be narrow, documented, and time-bounded.

**Version**: 1.0.0 | **Ratified**: 2026-09-16 | **Last Amended**: 2026-09-16
