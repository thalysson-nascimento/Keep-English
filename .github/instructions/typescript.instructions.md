---
applyTo: "src/**/*.{ts,tsx}"
---

# TypeScript Instructions

## 1. General Principles

Use TypeScript strict mode throughout the application.

Prioritize:

- Type safety.
- Explicit contracts.
- Readability.
- Predictable behavior.
- Reusability when justified.
- Maintainability.
- Minimal type complexity.

Never sacrifice type safety merely to simplify implementation.

## 2. Strict Typing

Mandatory rules:

- Never use `any`.
- Avoid implicit `any`.
- Avoid unnecessary type assertions.
- Avoid `@ts-ignore`.
- Prefer `@ts-expect-error` only when an intentional and documented exception is necessary.
- Handle nullable values explicitly.
- Avoid unsafe non-null assertions.
- Do not disable TypeScript strict compiler options.

Use the most precise type that correctly represents the data.

## 3. Interfaces and Types

Use interfaces for object contracts that may be extended or implemented.

Use type aliases when they better represent the structure.

Examples:

- Union types.
- Intersection types.
- Primitive aliases.
- Function types.
- Discriminated unions.

Avoid creating multiple types representing the same data structure.

Keep types close to their responsibility.

Place genuinely shared types in the appropriate shared directory.

## 4. Function Contracts

Functions must have clear input and output contracts.

Requirements:

- Use descriptive parameter names.
- Avoid excessive parameters.
- Prefer structured parameter objects when they improve readability.
- Define explicit return types when they improve clarity or establish an important contract.
- Avoid functions with multiple unrelated responsibilities.
- Handle errors consistently.

Keep functions small and predictable.

## 5. Nullability and Optional Values

Handle optional and nullable values explicitly.

Prefer:

- Optional properties when absence is valid.
- Nullable types when `null` is a meaningful value.
- Explicit validation before accessing potentially absent data.
- Nullish coalescing when a fallback is appropriate.

Do not use non-null assertions simply to bypass compiler errors.

## 6. Type Inference

Use TypeScript inference when the type is obvious and unambiguous.

Avoid unnecessary explicit annotations that duplicate information already provided by the compiler.

However, define explicit types for important application contracts.

Clarity is more important than maximizing or minimizing annotations.

## 7. Generics

Use generics when they provide meaningful reuse while preserving type safety.

Examples:

- Reusable data structures.
- Generic utility functions.
- Typed service contracts.
- Reusable component contracts.

Avoid unnecessarily complex generic abstractions.

Do not introduce generics for one-off implementations without a clear benefit.

## 8. Discriminated Unions

Prefer discriminated unions when modeling data with distinct states or variants.

Examples:

- Loading, success and error states.
- Authentication states.
- Operation results.
- Different response variants.

Avoid loosely structured objects with several optional properties when the possible states can be modeled explicitly.

## 9. Runtime Validation

TypeScript does not validate external data at runtime.

Use Zod to validate untrusted input.

Apply validation to:

- Form data.
- Server Action arguments.
- Route Handler requests.
- Query parameters.
- External API responses.
- Environment variables.

Infer TypeScript types from Zod schemas when appropriate.

Avoid duplicating validation rules and type definitions.

## 10. Error Handling

Use predictable error handling.

Requirements:

- Avoid swallowing exceptions.
- Avoid empty catch blocks.
- Do not expose internal errors to end users.
- Preserve useful diagnostic information on the server.
- Use the project's established error conventions.
- Avoid using `any` to handle unknown errors.

Use `unknown` when the error type is not known and narrow it before accessing its properties.

## 11. React and Next.js Types

Follow React and Next.js typing conventions.

- Define explicit component props.
- Use appropriate event types.
- Type asynchronous operations correctly.
- Respect Server and Client Component boundaries.
- Avoid unnecessary custom types for framework-provided contracts.
- Reuse framework types when appropriate.

Do not use `React.FC` automatically. Prefer straightforward function component declarations with explicit props.

## 12. Prisma Types

Use Prisma-generated types where appropriate.

Rules:

- Avoid duplicating database model types.
- Do not expose persistence models directly when application DTOs are more appropriate.
- Select only the fields required by the consumer.
- Keep persistence contracts separate from external API contracts when necessary.

Do not treat Prisma types as universal application types.

## 13. Naming Conventions

Use descriptive and consistent names.

Recommended conventions:

- Variables and functions: camelCase.
- Types and interfaces: PascalCase.
- Components: PascalCase.
- Constants: descriptive names, using the project's established convention.
- Enums: PascalCase.

Avoid unclear abbreviations and generic names.

Names must communicate purpose and responsibility.

## 14. Code Quality

Follow Clean Code principles.

- Avoid duplicated types.
- Avoid deeply nested conditional types.
- Avoid unnecessary type complexity.
- Keep interfaces focused.
- Keep functions cohesive.
- Prefer readable expressions.
- Avoid excessive type assertions.

Target cyclomatic complexity below 3 whenever practical.

Do not introduce artificial abstractions to reduce complexity.

## 15. Validation Workflow

Before completing TypeScript implementations:

1. Review the affected type contracts.
2. Check nullability.
3. Check external data validation.
4. Verify component props.
5. Verify asynchronous return types.
6. Check for unsafe assertions.
7. Run the project's TypeScript validation command when available.

Do not consider code complete while introducing new TypeScript errors.

## 16. Final Principle

TypeScript should make invalid states harder to represent and application behavior easier to understand.

Prefer precise types, simple contracts and safe runtime validation over shortcuts and unnecessary abstractions.