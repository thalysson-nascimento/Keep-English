---
applyTo: "src/**/*.{ts,tsx}"
---

# Architecture Instructions

## 1. General Principles

All implementations must follow the project's pragmatic Clean Architecture and Feature-Based organization.

Prioritize:

- Low coupling.
- High cohesion.
- Clear responsibilities.
- Reusability when justified.
- Separation of concerns.
- Dependency inversion.
- Maintainability.
- Simplicity over unnecessary abstractions.

Do not introduce architectural complexity without a concrete requirement.

## 2. Architectural Layers

Respect the responsibility of each layer.

### Domain

Responsible for core business concepts and rules.

Rules:

- Must remain independent of Next.js and React.
- Must not depend on Prisma.
- Must not depend on infrastructure implementations.
- Must not contain presentation logic.

### Application

Responsible for coordinating business operations.

Rules:

- Contains use cases and application services when necessary.
- Coordinates domain behavior.
- Depends on contracts rather than infrastructure implementations.
- Must not depend on React components.

### Infrastructure

Responsible for external technical implementations.

Examples:

- Prisma persistence.
- External API integrations.
- Repository implementations.
- Third-party services.

Infrastructure must implement the contracts required by the application or domain layers.

### Presentation

Responsible for rendering and user interaction.

Examples:

- Pages.
- Layouts.
- React components.
- Forms.
- UI state.

Presentation must not own business rules or direct database access.

## 3. Dependency Rules

Maintain clear dependency direction.

- Domain must not depend on other architectural layers.
- Application may depend on Domain.
- Infrastructure may implement Application or Domain contracts.
- Presentation may coordinate Application operations through approved server-side mechanisms.
- Shared modules must not depend on feature-specific implementations.
- Client-side modules must never depend on server-only modules.

Avoid circular dependencies.

## 4. Feature-Based Organization

Organize business functionality inside `src/features/`.

Each feature must contain only the layers and resources it actually needs.

Possible organization:

- `components/`
- `application/`
- `domain/`
- `infrastructure/`
- `repositories/`
- `schemas/`
- `types/`
- `dto/`

Do not create empty directories or unnecessary layers.

Keep feature-specific code inside its feature whenever possible.

## 5. Shared Modules

Use `src/shared/` for genuinely reusable resources.

Examples:

- UI components.
- Hooks.
- Utilities.
- Shared schemas.
- Common types.
- Constants.

Shared modules must not depend on specific features.

Do not move feature-specific logic into Shared merely to make it accessible from multiple locations.

## 6. Server and Client Boundaries

Next.js Server Components are the default.

Use Client Components only when browser interaction requires them.

Rules:

- Keep `use client` as close as possible to the interactive component.
- Keep database access server-side.
- Keep secrets and private configuration server-side.
- Prevent server-only imports from entering client bundles.
- Use approved server-side mechanisms for mutations and data access.

## 7. Data Access

Use the established Data Access Layer and persistence conventions.

- Keep Prisma access server-side.
- Validate sessions and permissions at sensitive data boundaries.
- Avoid direct database access from presentation components.
- Avoid duplicating query logic.
- Return only the data required by the consumer.

Do not introduce repositories or additional abstractions automatically. Use them when they provide a clear architectural benefit.

## 8. Dependency Management

Before introducing a new dependency:

1. Check whether the project already provides the required functionality.
2. Evaluate whether a native Next.js or TypeScript solution is sufficient.
3. Consider bundle size and maintenance impact.
4. Obtain authorization when the dependency changes the established stack.

Do not replace existing architectural decisions without justification.

## 9. Code Organization

Keep files focused and cohesive.

- Avoid oversized modules.
- Avoid duplicated business rules.
- Avoid unnecessary abstractions.
- Use descriptive names.
- Keep imports organized.
- Maintain consistent directory conventions.

Target cyclomatic complexity below 3 whenever practical.

## 10. Architectural Changes

Before changing architectural boundaries:

1. Inspect the existing implementation.
2. Identify the actual problem.
3. Evaluate the impact on dependent features.
4. Prefer the smallest effective change.
5. Coordinate with the Architecture Agent when necessary.

Do not perform large-scale refactoring as part of an unrelated task.

## 11. Final Principle

Architecture exists to make the application easier to understand, evolve and maintain.

Choose clear responsibilities and simple dependency relationships over unnecessary layers and abstractions.