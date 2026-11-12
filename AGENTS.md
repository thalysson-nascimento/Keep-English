# AGENTS.md — Global Project Instructions

## 1. Project Identity

This project uses Next.js as a full-stack framework, following a modular architecture based on Clean Architecture principles.

The primary goals are:

- Maintain clean, readable and predictable code.
- Minimize cyclomatic complexity.
- Promote code reuse without unnecessary abstractions.
- Maintain low coupling and high cohesion.
- Ensure security by default.
- Keep business rules independent from frameworks and infrastructure.
- Support maintainability and future scalability.

All development must follow the architectural decisions documented in this repository.

## 2. Technology Stack

The project uses:

- Next.js with App Router.
- React.
- TypeScript with strict mode.
- SQLite for the current development stage; PostgreSQL remains the production target.
- Prisma ORM.
- Better Auth for authentication.
- Zod for data validation.
- React Hook Form for forms.
- Tailwind CSS.
- shadcn/ui for reusable UI components.
- Lucide React for icons.
- Vitest and Testing Library for automated tests.

Additional dependencies must only be introduced when they provide a clear technical benefit.

Always verify compatibility between dependency versions before installation or upgrades.

## 3. Architectural Principles

The application follows:

- Feature-Based Architecture.
- Pragmatic Clean Architecture.
- SOLID principles.
- DRY (Don't Repeat Yourself).
- KISS (Keep It Simple).
- Separation of Concerns.
- Dependency Inversion.
- Single Responsibility Principle.

Avoid overengineering.

Do not create additional layers, abstractions, interfaces or services without a clear architectural reason.

## 4. Project Organization

The source code must respect the following responsibilities:

### app/

Responsible for:

- Application routing.
- Pages and layouts.
- Route groups.
- Route handlers.
- Page composition.

Pages must not contain complex business rules or direct database operations.

### core/

Responsible for application-wide infrastructure:

- Authentication configuration.
- Session management.
- Database configuration.
- Environment configuration.
- Global application errors.
- Shared security mechanisms.

### features/

Responsible for application-specific functionality.

Each feature must encapsulate its own:

- Components.
- Application use cases.
- Domain rules.
- Repository contracts when needed.
- Infrastructure implementations when needed.
- Schemas and types.

Features must remain independent whenever possible.

### shared/

Responsible for reusable resources:

- UI components.
- Generic hooks.
- Utilities.
- Shared types.
- Generic schemas.
- Constants.

Never place feature-specific business rules inside shared/.

### server/

Responsible for server-only data access and secure data retrieval.

Database access must never be exposed directly to browser components.

### prisma/

Responsible for:

- Database schema.
- Migrations.
- Data modeling.

## 5. Dependency Rules

Dependencies must follow the architectural direction:

- Domain must not depend on application frameworks.
- Domain must not import React, Next.js or Prisma.
- Application must not depend on presentation components.
- Infrastructure may implement domain contracts.
- Presentation must communicate with application logic through defined entry points.
- Shared must not depend on specific features.
- Server-only modules must never be imported by client components.

Avoid circular dependencies.

Use explicit dependency composition instead of unnecessary dependency injection frameworks.

## 6. Next.js Development Rules

- Use App Router.
- Prefer Server Components by default.
- Use Client Components only when browser interaction or client-side state is necessary.
- Keep the "use client" directive as close as possible to the component requiring it.
- Use Server Actions for appropriate internal mutations.
- Use Route Handlers for HTTP endpoints and external integrations.
- Never expose secrets or private server configuration to the browser.
- Do not use Server Actions as a replacement for authorization.
- Validate all externally supplied input on the server.

## 7. Authentication and Authorization

Better Auth is the centralized authentication solution.

Supported authentication methods:

- Email and password.
- Google OAuth.

Mandatory rules:

- Validate sessions on the server.
- Use secure session cookies.
- Protect sensitive operations.
- Validate permissions at the data access boundary.
- Never trust user identifiers received from the browser.
- Never expose authentication secrets.
- Never store passwords in plain text.
- Never implement a parallel authentication mechanism.

Authentication and authorization are separate responsibilities.

## 8. Database Rules

SQLite is the database for the current development stage. PostgreSQL remains the production target, and database provider selection is fixed rather than conditional on environment.

Prisma is the ORM and migration management solution.

Mandatory rules:

- Keep database access on the server.
- Use typed queries.
- Avoid unnecessary database queries.
- Select only the fields required by the operation.
- Use transactions when multiple database operations must succeed or fail together.
- Never expose Prisma models directly as public API contracts.
- Keep migrations versioned.
- Never modify production database structures manually without a migration strategy.

## 9. TypeScript Standards

- Strict mode must remain enabled.
- Never use any.
- Avoid unnecessary type assertions.
- Prefer explicit types for public contracts.
- Use interfaces for extensible object contracts when appropriate.
- Use type aliases for unions, compositions and utility types.
- Avoid duplicated type definitions.
- Prefer inferred types when inference is clear and reliable.

## 10. Code Quality Standards

All code must prioritize readability and maintainability.

Mandatory guidelines:

- One responsibility per function or method.
- Prefer short and focused functions.
- Target cyclomatic complexity between 1 and 2 whenever practical.
- Refactor complex conditional logic into smaller functions.
- Avoid more than two levels of nested control flow.
- Avoid duplicated business logic.
- Avoid unnecessary boolean flags and deeply nested ternaries.
- Use early returns when they improve readability.
- Keep components focused on a single responsibility.
- Use descriptive names for variables, functions and components.

Do not split code into artificial abstractions just to satisfy line-count or complexity metrics.

Readability is more important than minimizing the number of lines.

## 11. Component Standards

Follow the Smart/Dumb Component principle when it provides architectural value.

Presentational components:

- Receive data through props.
- Expose interactions through callbacks.
- Must not access the database.
- Must not contain infrastructure dependencies.
- Should be reusable.

Smart components:

- Coordinate component behavior.
- Manage necessary local state.
- Connect presentation to application operations.

Do not create container components when they add no meaningful responsibility.

## 12. Validation and Error Handling

- Use Zod for input validation.
- Validate data on the server, even when client-side validation already exists.
- Use typed inputs and outputs.
- Avoid generic error handling that hides the original problem.
- Never expose stack traces or sensitive internal information to users.
- Return predictable error structures from application operations.

## 13. Reusability

Before implementing new functionality:

1. Check whether an equivalent utility already exists.
2. Check whether a shared component can be reused.
3. Check whether the feature already has a reusable method.
4. Avoid duplicating existing business rules.

Do not create generic abstractions for hypothetical future requirements.

## 14. Agent Responsibilities

All AI agents working on this project must:

- Read and respect these instructions.
- Follow the existing project architecture.
- Inspect existing code before creating new files.
- Avoid changing unrelated functionality.
- Avoid introducing unnecessary dependencies.
- Preserve existing naming conventions.
- Report architectural conflicts before implementing incompatible solutions.
- Provide a concise summary of files created or modified.

Agents must never silently redefine architectural decisions.

## 15. Definition of Done

A task is considered complete only when:

- The implementation follows the established architecture.
- Types and contracts are correct.
- Input validation is implemented where necessary.
- Security requirements are respected.
- No unnecessary duplication is introduced.
- Relevant tests are implemented or updated.
- Lint and TypeScript checks pass.
- No unrelated files or functionality are modified.

## 16. Architectural Authority

This document establishes the global engineering principles.

Specialized agent instructions and technical instruction files may extend these rules but must never contradict them.

When a conflict is identified, stop and request architectural clarification before implementing a conflicting solution.