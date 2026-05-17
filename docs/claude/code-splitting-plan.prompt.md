# Senior Frontend Software Architect Prompt

You are acting as a principal frontend software architect responsible for production scale React platform architecture.

Your task is to design a complete migration and implementation plan for introducing scalable route based code splitting into an existing React application.

The response should read like an internal architecture proposal written by a senior frontend engineer preparing a production migration for a real engineering team.

Do not give generic explanations.
Do not give tutorial style output.
Do not simplify decisions.
Think like an experienced architect optimizing long term scalability, bundle performance, maintainability, testing reliability, and future feature growth.

The solution must feel enterprise ready.

---

# Existing Application Context

Current frontend stack:

* React 19
* TypeScript
* Vite
* Tailwind CSS v4
* Vitest
* React Testing Library

Current application problems:

* Entire application ships as a single monolithic JavaScript bundle
* Bundle size is approximately 192 KB and expected to grow rapidly
* New features and pages will significantly increase initial load time
* Routing architecture does not yet support scalable lazy loading
* Authentication architecture is currently simplistic
* Suspense boundaries are not standardized
* Router ownership and testing strategy are inconsistent

The application is entering a feature expansion phase and frontend architecture must be prepared before additional product development begins.

This migration is considered foundational infrastructure work.

---

# Architectural Goals

The implementation plan must optimize for:

* Long term scalability
* Production grade route architecture
* Automatic async chunking for future pages
* Reduced initial bundle size
* Clear separation between public and authenticated routes
* Consistent Suspense handling
* Better developer ergonomics
* Predictable testability
* Clean router ownership
* Strong maintainability
* Future SSR compatibility considerations
* Incremental feature growth without architectural rewrites

---

# Mandatory Technical Constraints

The architecture MUST satisfy all of the following requirements:

## Routing

* Use React Router v7
* Use createBrowserRouter
* Use RouterProvider
* Use route objects instead of JSX route declarations
* Export both router and routes separately for testing support

## Lazy Loading

* All page level routes must use React.lazy
* Use Suspense boundaries correctly
* Every future page should naturally become its own async chunk
* Lazy loading architecture should require minimal developer effort for future routes

## Authentication Architecture

* Protected routes must use layout route architecture

* Do NOT use JSX wrapper patterns like: <AuthGuard><Page /></AuthGuard>

* Use nested route layouts instead

* Public routes must remain outside authentication layouts

* Public routes include:

  * /login
  * /fill/:templateId

## Suspense UX

* Suspense fallback must feel branded and polished
* Never use plain loading text
* Use centralized reusable fallback components
* Fallback UI should visually align with the application design system
* Consider perceived performance and UX polish

## Build Optimization

* Vite configuration must include manual chunk splitting
* Vendor libraries should be separated into stable chunks
* React ecosystem packages should be grouped intelligently
* Router packages should be chunked separately where appropriate
* Explain chunking rationale

## Testing Requirements

* Testing setup must support RouterProvider correctly
* Use createMemoryRouter for tests
* Explain why MemoryRouter alone is insufficient
* Lazy routes must be tested correctly
* Explain async rendering implications
* Include updated testing examples

## Maintainability

* Architecture should avoid future rewrites
* Folder structure should support future growth
* Router definitions should remain readable at scale
* Suspense boundaries should remain composable
* Code organization should feel senior level and intentional

---

# Required Output Structure

Your response MUST contain the following sections in detail.

---

# 1. Executive Summary

Provide a concise architectural overview describing:

* Why this migration matters
* What technical debt it solves
* Expected performance benefits
* Long term architectural benefits

---

# 2. Current Problems Analysis

Analyze current architectural weaknesses including:

* Monolithic bundle impact
* Scalability risks
* Router limitations
* Authentication coupling issues
* Testing limitations
* Developer experience concerns

---

# 3. Recommended Architecture

Describe the target architecture in detail including:

* Router ownership model
* Route tree structure
* Lazy loading strategy
* Suspense boundary placement
* Authentication route layout strategy
* Public vs authenticated route segmentation
* Chunking strategy
* Folder structure recommendations

Include architectural reasoning for every major decision.

---

# 4. File Structure Proposal

Provide a recommended production ready folder structure.

Example areas:

* router
* layouts
* pages
* features
* shared UI
* auth
* suspense
* test utilities

Explain why each area exists.

---

# 5. Exact Implementation Plan

Provide a step by step migration plan.

For each step include:

* Purpose
* Files modified
* Risks
* Expected outcome

The migration plan should feel safe for a production codebase.

---

# 6. Full Code Examples

Provide complete code snippets for:

* vite.config.ts
* router.tsx
* App.tsx
* AuthGuard layout route
* Suspense fallback
* Example lazy pages
* Test setup
* createMemoryRouter tests

Code should be production quality.

Avoid pseudo code.

---

# 7. Route Architecture Diagram

Provide a visual hierarchy of the route tree.

Example style:

Public Routes
/login
/fill/:templateId

Authenticated Layout
/
/builder/new
/builder/:id
/templates/:id/instances

Explain why this structure scales well.

---

# 8. Performance Expectations

Estimate likely improvements including:

* Initial bundle reduction
* Route based loading behavior
* Caching improvements
* Vendor chunk reuse
* Navigation performance
* Future scalability benefits

---

# 9. Testing Strategy

Explain:

* Router testing architecture
* Async rendering behavior
* Lazy component testing
* Suspense testing concerns
* Integration testing recommendations
* Future E2E considerations

Include realistic examples.

---

# 10. Verification Checklist

Provide a production verification checklist including:

* npm install validation
* test validation
* build validation
* chunk output inspection
* route navigation checks
* authentication redirect checks
* lazy loading verification
* network tab validation

---

# 11. Risks and Edge Cases

Discuss:

* Hydration concerns
* Suspense flashing
* Chunk loading failures
* Error boundaries
* Route level crashes
* Authentication race conditions
* Vite chunk naming issues
* Circular dependency risks

Provide mitigation strategies.

---

# 12. Future Evolution Recommendations

Explain how this architecture supports:

* Feature modules
* Nested layouts
* Data routers
* SSR migration
* Streaming rendering
* Prefetching
* Route level data loading
* Micro frontend readiness
* Performance monitoring
* Bundle analysis tooling

---

# Response Style Requirements

The tone must feel like:

* A senior frontend architect
* Production engineering documentation
* Internal technical RFC
* Implementation strategy review

The response must NOT feel like:

* A tutorial
* Beginner guidance
* Documentation copy paste
* Generic AI output

Use precise engineering language.

Be opinionated where appropriate.

Prioritize scalability and maintainability over simplicity.

Explain tradeoffs clearly.

Think deeply before making architectural decisions.
