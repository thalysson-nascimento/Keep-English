# GitHub Copilot — Repository Instructions

## 1. Project Context

This project uses Next.js App Router, React, TypeScript and PostgreSQL.

The application follows a Feature-Based architecture combined with pragmatic Clean Architecture principles.

All development must prioritize:

- Clean Code.
- SOLID principles.
- Low coupling and high cohesion.
- Code reuse.
- Low cyclomatic complexity.
- Security by default.
- Maintainability.
- Simplicity without unnecessary abstractions.

## 2. Mandatory Instructions

Before implementing any task:

1. Read the root `AGENTS.md`.
2. Understand the existing project structure.
3. Identify the affected features and architectural layers.
4. Inspect existing components, utilities, schemas and services before creating new ones.
5. Respect existing naming conventions and implementation patterns.

Never introduce architectural changes without explicit authorization.

## 3. Architecture Compliance

All implementations must respect:

- Feature-Based organization.
- Separation of presentation, application, domain and infrastructure responsibilities.
- Server Components by default.
- Client Components only when necessary.
- Server-side data access.
- Centralized authentication and authorization.
- Typed contracts and Zod validation.
- Existing shared components and utilities.

Do not place business logic inside pages or presentational components.

Do not access Prisma directly from client components.

## 4. Code Quality

- TypeScript strict mode is mandatory.
- Never use `any`.
- Prefer small, focused functions.
- Target cyclomatic complexity of 1–2 whenever practical.
- Avoid unnecessary nesting.
- Avoid duplicated logic.
- Avoid unnecessary dependencies.
- Prefer early returns when they improve readability.
- Use descriptive names.
- Follow existing formatting conventions.

Do not create artificial abstractions just to reduce line counts.

## 5. Component Standards

- Keep components focused on a single responsibility.
- Prefer reusable presentational components.
- Separate business logic from visual presentation.
- Avoid unnecessary client-side rendering.
- Do not create global state when local or server state is sufficient.

## 6. Security

- Never expose secrets to the browser.
- Validate all external input on the server.
- Verify sessions before accessing protected resources.
- Verify permissions at the data access boundary.
- Never trust user identifiers supplied by the client.
- Protect sensitive operations independently of UI restrictions.

## 7. Implementation Workflow

For each task:

1. Analyze the requirements.
2. Identify the affected files.
3. Check whether existing code can be reused.
4. Define the smallest implementation that satisfies the requirement.
5. Implement without modifying unrelated functionality.
6. Validate types, lint and relevant tests.
7. Report the files created or modified.

If a requirement conflicts with the established architecture, explain the conflict and request clarification before proceeding.

## 8. Communication

Communicate with the user in Brazilian Portuguese.

Use technical terminology when appropriate, but explain architectural decisions clearly.

Before introducing a new library, pattern or architectural layer, explain why it is necessary.

Never assume authorization to refactor unrelated parts of the application.