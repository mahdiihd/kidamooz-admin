# Kidamooz Admin

Kidamooz Admin is the operational control panel for the Kidamooz storytelling platform. It provides
authenticated workflows for stories, member submissions, categories, challenges, audiences, notifications,
members, administrators, and audit history.

## Technology

- Angular 21 and TypeScript
- Angular Router and reactive forms
- RxJS and Vitest
- Docker and Liara deployment configuration

## Architecture

```text
src/app/
├── core/
│   ├── models/      API contracts used by the panel
│   └── services/    Authentication and backend communication
├── features/        Lazily loaded administration areas
├── layout/          Authenticated panel shell
└── shared/          Reusable controls, pipes, badges, and editors
```

The backend is authoritative for authorization and validation. Route guards and form validation improve the
operator experience but do not replace server-side enforcement.

## Requirements and Development

- Node.js 20 or newer
- npm 10 or a compatible release
- A reachable Kidamooz backend for non-mock development

```bash
npm install
npm start
```

The panel is served at `http://localhost:4200` by default. Development API configuration is in
`src/environments/environment.ts`.

## Build and Test

```bash
npm run build
npm test -- --watch=false
```

The project currently has no lint script. Behavior changes should include focused tests for relevant form,
service, permission, loading, and failure states.

## AI Operations and AI-Assisted Development

The panel is the management surface for AI-related configuration and reporting. Model rates, safety margins,
reservation limits, usage reporting, and manual credit adjustments must be served by authenticated backend
APIs and recorded in audit history. Provider credentials and financial calculations must never be implemented
in browser code.

This repository is also developed with AI assistance. AI-produced changes remain subject to the same review,
authorization, testing, and Spec Kit convergence requirements as human-written changes.

## Spec-Driven Development

This repository uses [GitHub Spec Kit](https://github.com/github/spec-kit) with the Codex integration.
Instructions are in [AGENTS.md](AGENTS.md), and engineering principles are in
[the constitution](.specify/memory/constitution.md).

```text
$speckit-specify
$speckit-clarify
$speckit-plan
$speckit-tasks
$speckit-analyze
$speckit-implement
$speckit-converge
```

Feature artifacts live in `specs/<feature>/`. Implementation begins only after the specification, plan, and
tasks exist, and finishes only after convergence reports `Converged`.

## Idea Assessment

```text
$speckit-assess-intake
$speckit-assess-research
$speckit-assess-define
$speckit-assess-shape
$speckit-assess-decide
```

Artifacts live in `.specify/assessments/<slug>/`. Only a documented `go` decision enters development.

## Security

Never commit credentials, tokens, production environment files, private user data, or provider response
bodies. Administrative and financial actions must be authorized, auditable, and protected from duplicate
submission.

## License

No public license has been declared in this repository.
