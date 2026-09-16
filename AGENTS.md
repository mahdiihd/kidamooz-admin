# Admin Panel Development Guide

This guide applies to every file in this project.

- Project overview and structure: [spec.md](spec.md).
- Use the [Kidamooz admin skill](.agents/skills/kidamooz-admin/SKILL.md) for panel development.
- This project uses Angular 21. Do not assume it shares versions or patterns with the Angular 20 app.
- Pages belong in `src/app/features`, server communication in `src/app/core/services`, and models in `src/app/core/models`.
- Preserve routes and authentication guards in `src/app/app.routes.ts`. Client guards do not replace server authorization.
- Align API contract changes with controllers and DTOs in `../Back`; also check the related service's mock behavior.
- Preserve Persian copy, RTL layout, and the existing error and notification patterns.
- Production configuration is in `src/environments/environment.production.ts`. Never place secrets in browser code or documentation.
- Run from this directory: `npm run build` and, for behavior changes, `npm test -- --watch=false`.
- This project has no lint script. Report executed and skipped checks clearly.
- Do not edit generated files or dependencies manually. Documentation-only changes do not require running the application.

## Mandatory Spec Kit Workflow

- Spec Kit infrastructure lives in `.specify/` and its skills live in `.agents/skills/speckit-*`. The project constitution is `.specify/memory/constitution.md` and MUST govern planning and implementation.
- Every new feature, behavior change, architectural change, or non-trivial refactor MUST complete the Spec-Driven Development workflow before implementation: `$speckit-specify`, `$speckit-clarify`, `$speckit-plan`, `$speckit-tasks`, `$speckit-analyze`, `$speckit-implement`, and `$speckit-converge`, in that order.
- Implementation MUST NOT begin until `spec.md`, `plan.md`, and `tasks.md` exist and analysis reports no unresolved blocking inconsistency. Work is not complete until convergence reports `Converged`.
- Keep feature artifacts in `specs/<feature>/`. Feed discoveries that affect requirements or design back into the same artifacts before continuing implementation.
- Every product idea, proposed capability, or materially uncertain solution MUST complete Idea Assessment before entering SDD: `$speckit-assess-intake`, `$speckit-assess-research`, `$speckit-assess-define`, `$speckit-assess-shape`, and `$speckit-assess-decide`, in that order.
- Keep assessment artifacts in `.specify/assessments/<slug>/`. Only a `go` decision with explicit scope MAY move to `$speckit-specify`. A `needs-clarification` or `kill` decision MUST stop implementation until the decision artifact is updated to `go`.
- Documentation-only edits that do not change product behavior may skip SDD. All other exceptions require an explicit user instruction recorded in the task conversation.

## Secret Safety

- Never commit or push database passwords, credential-bearing connection strings, API keys, tokens, private keys, Firebase service accounts, or app-signing keys. Do not expose them in reports, logs, documentation, or PR messages.
- Load server secrets from environment variables or approved secret storage. Use fake placeholders in publishable files. Browser code is not a secret store.
- Before every commit, inspect staged files and changes for secrets. Before push, inspect every outgoing commit, not only the latest diff. Reports must redact values and identify only the suspicious path and secret type.
- Do not stage real environment files, local secret settings, keys, or sensitive outputs. Avoid force-adding ignored files or staging everything without review.
- `.gitignore` does not remove tracked files or history. If a secret exists in a tracked file or earlier commit, stop the push and report it without showing the value. Removing the current line does not repair historical exposure; credential rotation and history cleanup require coordination.
- Inspect public configuration and example files too. An `example` name or absence from ignore patterns does not guarantee safety. Do not print sensitive file contents into tool output.
