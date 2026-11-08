---
applyTo: "src/**/*.{ts,tsx}"
---

# Security Instructions

## 1. General Security Principles

Security must be considered in every implementation.

Follow these principles:

- Never trust client-provided data.
- Validate all external input.
- Protect sensitive information.
- Enforce authorization on the server.
- Keep secrets exclusively on the server.
- Follow secure defaults.
- Avoid exposing internal implementation details.

Never weaken security to simplify development.

## 2. Authentication and Authorization

Use Better Auth as the centralized authentication solution.

Rules:

- Validate sessions on the server.
- Derive user identity from a validated session.
- Verify permissions before sensitive operations.
- Protect private data and mutations.
- Never trust user IDs supplied by the client as proof of identity.
- Never rely exclusively on middleware or layouts for authorization.

Authentication determines identity.

Authorization determines access.

Both must be enforced at the appropriate server-side boundaries.

## 3. Database Security

Use Prisma for database access.

Mandatory rules:

- Keep database access exclusively on the server.
- Never expose database credentials.
- Validate input before database operations.
- Restrict access to records according to the authenticated user's permissions.
- Retrieve only necessary fields.
- Avoid exposing sensitive database records.
- Use transactions when data consistency requires them.

Never execute unsafe raw SQL using string interpolation.

Use parameterized queries whenever raw SQL is necessary.

## 4. Input Validation

Validate all external input using Zod.

This includes:

- Form submissions.
- Server Action arguments.
- Route Handler request bodies.
- URL parameters.
- Query parameters.
- External API responses when they cross into trusted application logic.

Do not assume TypeScript types validate runtime data.

Reject invalid input before executing business operations.

Avoid trusting client-side validation as a security boundary.

## 5. Secrets and Environment Variables

Never hardcode:

- Database credentials.
- OAuth client secrets.
- API keys.
- Authentication secrets.
- Private tokens.
- Encryption keys.

Use environment variables.

Rules:

- Keep private variables server-side.
- Never expose secrets through `NEXT_PUBLIC_` variables.
- Validate required environment variables centrally.
- Avoid logging secret values.
- Never commit `.env` files containing credentials.

Only expose environment variables to the browser when their public availability is intentional and safe.

## 6. Server Actions and Route Handlers

Every sensitive Server Action and Route Handler must independently validate:

1. The input.
2. The authenticated session.
3. The user's authorization.
4. The requested operation.

Never assume that a hidden button or protected page prevents direct requests.

Return appropriate error responses without exposing internal details.

## 7. Client-Side Security

Client Components must never contain:

- Private API credentials.
- Database credentials.
- Authentication secrets.
- Server-only utilities.
- Sensitive business logic that must be enforced by the server.

Do not expose private information through serialized props or browser-accessible state.

Remember that anything delivered to the browser can be inspected by the user.

## 8. Common Vulnerabilities

Prevent common security vulnerabilities, including:

- SQL injection.
- Cross-Site Scripting (XSS).
- Cross-Site Request Forgery (CSRF).
- Open redirects.
- Broken access control.
- Insecure direct object references (IDOR).
- Sensitive information exposure.
- Account enumeration.
- Unsafe file uploads.

Use framework and library protections where available.

Do not implement custom security mechanisms when established solutions already exist.

## 9. Authentication and OAuth Security

For Better Auth and Google OAuth:

- Keep OAuth secrets on the server.
- Validate redirect destinations.
- Follow supported callback configurations.
- Use secure session settings.
- Avoid exposing session tokens.
- Handle authentication errors without leaking sensitive details.

Do not create custom authentication or password storage mechanisms alongside Better Auth.

## 10. Error Handling and Logging

Error messages must not expose:

- Stack traces to end users.
- Database credentials.
- Authentication tokens.
- Passwords.
- Private environment variables.
- Sensitive personal information.

Log only the information required for diagnostics.

Avoid logging complete request bodies when they may contain sensitive information.

## 11. Security Review

Before completing security-sensitive implementations, verify:

- Input validation.
- Session validation.
- Authorization checks.
- Data access restrictions.
- Secret handling.
- Error handling.
- Client/server boundaries.
- Exposure of sensitive information.

Escalate significant security risks to the Architecture Agent and Authentication Agent when appropriate.

## 12. Final Principle

Security must be enforced at the server boundary, not merely represented in the user interface.

Never trust the client, never expose secrets and never allow an operation without the required authorization.