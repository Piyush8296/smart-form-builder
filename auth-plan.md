# Auth & RBAC Plan

## Two Personas

| Persona | Access | Entry Point |
|---------|--------|-------------|
| **Builder** (creator) | Login required | `/login` → `/` → `/builder/:id` |
| **Filler** (responder) | No login | Direct fill URL → `/fill/:id` |

---

## UX Flows

### New Builder (first visit)
```
/ → not logged in → /login
  Enter name + email → "Get started"
  Session created in localStorage
  Redirect → / (Home, empty state)
  "Create your first form" CTA → /builder/new → /builder/:id
  Build form → "Share" button → copies /fill/:id to clipboard
```

### Returning Builder
```
/ → session exists → Home
  Template grid → click card → /builder/:id (if owned)
  OR: click "View responses" → /templates/:id/instances
```

### Filler (no login ever)
```
Receives /fill/:id link
Opens in browser → form renders immediately (no auth gate)
Fills out → Submit → Post-submit confirmation
Zero access to: Home, Builder, Instances
Brand logo → non-clickable wordmark
```

### Builder opens someone else's form
```
/builder/:id
  No session       → redirect /login
  Has session, not owner → redirect /fill/:id
```

---

## Session Model (localStorage, no backend)

```typescript
// fb:session
interface Session {
  userId: string;      // nanoid(), generated once per user
  email: string;
  displayName: string;
  createdAt: string;
}

// fb:users  →  Record<email, Session>   (lookup table for returning users)
// fb:user-templates:{userId}  →  string[]  (owned template IDs)
```

"Login" = enter email → lookup `fb:users` by email → found: restore session; not found: create new.
"Logout" = remove `fb:session`. Multiple users can share same browser by logging in/out.

---

## Route Access Matrix

| Route | Auth | Ownership | On Fail |
|-------|------|-----------|---------|
| `/login` | — | — | — |
| `/` | session required | — | → `/login` |
| `/builder/:id` | session required | owned by userId | no session → `/login`; not owned → `/fill/:id` |
| `/templates/:id/instances` | session required | owned by userId | → `/login` |
| `/fill/:id` | public | — | template missing → 404 |

---

## Screen Inventory

### `/login` — Login / Signup
- Single screen (signup + login same flow)
- Fields: Email → if new user, show Display Name field
- CTA: "Continue" / "Get started"
- No password (magic-link feel, no actual email sent)
- Redirect to `/` if already has session

### `/` — Home
- Header: Brand, "Templates" nav, user avatar + logout
- Owned templates only (scoped to userId)
- Empty state: illustration + "Create your first form" CTA
- Card menu: rename, delete, duplicate

### `/builder/:id` — Builder Mode
- 3-panel: Add Field | Canvas | Config
- Toolbar: title, dirty indicator, Settings, Preview (new tab), Share (copies fill URL)
- No submit, no fill controls

### `/fill/:templateId` — Fill Mode
- Header: Brand wordmark (non-clickable) + "Save PDF" only
- Form fields, optional progress bar, submit toolbar
- Post-submit screen
- Zero builder controls

### `/templates/:id/instances` — Responses
- Builder-only, requires session + ownership
- Response table, CSV export

---

## localStorage Keys

```
fb:session                    → Session           (active user)
fb:users                      → Record<email,Session>
fb:user-templates:{userId}    → string[]           (owned template IDs)
fb:templates                  → TemplateSummary[]  (backward-compat index)
fb:template:{id}              → Template
fb:instances:{tid}            → Instance[]
fb:draft:{tid}                → serialized Map
```

---

## Implementation Steps

1. `src/storage/authStore.ts` — `getSession`, `createSession`, `restoreSession`, `logout`, `lookupByEmail`
2. `src/pages/LoginPage.tsx` — email + name form, no password
3. `src/contexts/SessionContext.tsx` — provides `userId`, `email`, `displayName`, `logout()`
4. `src/components/ui/AuthGuard.tsx` — checks session, redirects to `/login` if missing
5. Router update — wrap `/`, `/builder/*`, `/templates/*` in `<AuthGuard>`; `/fill/*` + `/login` public
6. `src/storage/accessStore.ts` — `isOwner(userId, templateId)`, `addOwnership`, `removeOwnership`
7. `src/hooks/useTemplateList.ts` — `createTemplate` calls `addOwnership(userId, id)`
8. `src/pages/BuilderPage.tsx` — ownership check using `userId` from session
9. `src/pages/Home.tsx` — filter templates by `fb:user-templates:{userId}`; show user info + logout in header
10. `src/pages/FillPage.tsx` — Brand non-clickable; remove any builder navigation

---

## Verification

1. Fresh browser → visit `/` → redirects to `/login`
2. Enter name + email → session created → Home
3. Refresh → still logged in
4. Create template → appears in Home list
5. Copy fill URL → open incognito → form loads, no auth prompt
6. Open `/builder/:id` in incognito → redirects to `/fill/:id`
7. Logout → redirected to `/login`
8. Same email login → same templates visible
9. Different email → empty template list
10. `npm run build` — zero TS errors
