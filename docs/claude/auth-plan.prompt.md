# Frontend Software Architect Prompt

You are acting as a senior frontend software architect designing the authentication and access architecture for a React application.

I need you to create a complete frontend only Auth and RBAC implementation plan for a form builder platform.

The application has two different personas with completely different experiences and permissions.

The output should feel like a real engineering architecture proposal written for a frontend team before implementation begins.

Use practical engineering language.
Think like a staff frontend engineer planning scalable product architecture.
Avoid generic explanations.
Avoid tutorial style writing.

The plan must be implementation focused and structured.

---

# Product Context

This is a form builder platform.

Users can create forms and share them publicly with responders.

There are two personas:

1. Builder
   The creator of forms
   Requires login
   Can create, edit, manage, and view responses

2. Filler
   The responder filling out shared forms
   Never logs in
   Should have instant access through a public URL

The architecture should clearly separate these experiences.

---

# Technical Stack

Frontend stack:

* React 19
* TypeScript
* React Router v7
* Tailwind CSS v4
* Vite
* localStorage persistence only
* No backend yet
* No real authentication provider yet

The architecture should still feel production ready even though auth is frontend only.

---

# Core Requirements

## Authentication Model

Design a frontend only session system using localStorage.

Requirements:

* No passwords
* Email based identity
* Returning users restored automatically
* Session persistence across refresh
* Multiple users can share same browser through logout/login
* Session data stored in localStorage
* Use crypto.randomUUID for user IDs
* Keep architecture simple but scalable toward future backend migration

Define all required localStorage keys and data models.

---

# RBAC Requirements

There are only two access levels:

## Builder

Can access:

* Home
* Builder pages
* Response management pages

Must be authenticated.

## Filler

Can access:

* Public fill URLs only

Must never be blocked by auth.

Must never access builder routes.

---

# Routing Requirements

Use React Router v7 architecture.

Requirements:

* Use RouterProvider
* Use createBrowserRouter
* Use nested layout routes for protected routes
* Do NOT use JSX auth wrappers
* Public routes remain outside auth layouts
* AuthGuard should act as a layout route
* Builder routes grouped together
* Fill routes remain fully public

I want a clean route tree architecture that scales well.

---

# UX Requirements

Design detailed UX flows for:

1. First time builder
2. Returning builder
3. Public filler
4. Unauthorized builder access
5. Missing session
6. Ownership mismatch

Include redirect behavior and expected route transitions.

The UX should feel intentional and production ready.

---

# Ownership Rules

Templates belong to creators.

Requirements:

* Builders can only edit their own templates
* Builders can only view responses for owned templates
* If a builder opens another user's builder URL:

  * if not logged in → redirect to login
  * if logged in but not owner → redirect to public fill page

Ownership should be stored locally.

Design ownership storage strategy.

---

# Required Pages

Design architecture for:

* /login
* /
* /builder/:id
* /builder/new
* /fill/:templateId
* /templates/:id/instances

Describe the responsibility of each page.

---

# UI Requirements

## Login Page

* Email based flow
* New users provide display name
* Existing users continue directly
* No password UI
* Lightweight onboarding feel

## Home Page

* User specific templates only
* Empty state for new users
* Header with user info and logout
* Template management actions

## Builder Page

* Full editing experience
* Share functionality
* Ownership aware

## Fill Page

* Public experience
* No builder controls
* No auth prompts
* Minimal clean experience

## Responses Page

* Builder only
* Ownership protected

---

# Data Architecture

Define:

* Session interface
* Ownership model
* Template ownership indexing
* localStorage structure
* Access lookup helpers
* Session restoration strategy

Explain why each structure exists.

---

# Required Output Structure

Your response must include:

1. Persona definitions
2. UX flows
3. Session architecture
4. RBAC strategy
5. Route access matrix
6. Screen inventory
7. localStorage schema
8. Ownership strategy
9. Router architecture
10. Implementation steps
11. Verification checklist
12. Edge cases
13. Future backend migration considerations

---

# Engineering Expectations

The response should:

* Feel like a real architecture review
* Be highly implementation focused
* Include practical frontend decisions
* Explain tradeoffs
* Prioritize maintainability
* Prioritize scalability
* Avoid over engineering
* Avoid backend assumptions
* Keep auth architecture replaceable later

Think deeply before making architectural decisions.