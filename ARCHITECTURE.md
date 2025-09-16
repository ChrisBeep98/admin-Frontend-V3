# Nevado Trek Admin Frontend — Architecture & Project Context

Version: 1.1
Last Updated: 2025-09-16

This document provides a complete technical context for the Nevado Trek Admin Frontend. It covers goals, scope, architecture, module responsibilities, data models, flows, testing, and a roadmap to keep the project cohesive as it evolves.

---

## 1) Goals & Scope

- Build an admin-only web application to manage Nevado Trek domain data:
  - Tours (CRUD)
  - Itineraries (CRUD)
  - Bookings (view, filter, update, delete, reassign)
- Integrate with a single backend API endpoint (Supabase Edge Function) using an action-based POST contract.
- Secure admin access via a pre-issued Bearer token (no username/password in the client).
- Support the new backend behavior: when deleting a tour, any related bookings become "unpaired" so admins can later reassign them to an existing tour.

Out of scope (by design for this app):
- Public booking creation flows (handled by public-facing website)
- Admin user management and token issuance

---

## 2) High-Level Plan

Milestone A — Core Admin CRUD
- Tours: create, update, delete, list
- Itineraries: attach to tour, manage days/activities
- Bookings: list, filter by status, edit status/note, delete

Milestone B — Unpaired Bookings
- Delete Tour -> existing bookings become `unpaired`
- Bookings page: filter by `unpaired`
- Edit booking dialog: select tour and update status to reassign

Milestone C — UX & Ops Quality
- Improve error messages (surface API-provided errors)
- Add client-side validation for inputs (days, difficulty, HH:MM times)
- Optional: token invalidation on 401 (auto-logout)
- Optional: move API URL to env var (VITE_API_URL)

---

## 3) System Context Overview

- Client: React + TypeScript, Vite-powered, Material UI
- Auth: Pre-issued admin token stored in localStorage
- API: Supabase Edge Function (single endpoint)
  - Base URL: see API_Usage.md
  - Calls: POST body `{ action: string, data?: any }`
  - Protected endpoints require `Authorization: Bearer <token>`
  - Public endpoint (create_booking) is not used by admin

---

## 4) Project Structure & Modules

Top-level (admin-frontend):
- public/
- src/
  - assets/
  - components/
    - ProtectedRoute.tsx — Router guard; checks if a token exists (presence-based gate)
  - contexts/
    - AuthContext.tsx — Simple auth store using localStorage; login(token), logout()
  - pages/
    - LoginPage.tsx — Token entry + validation (using a protected API call)
    - DashboardPage.tsx — Aggregate stats & quick navigation (Calendar quick action)
    - ToursPage.tsx — Tours CRUD + Itinerary management (inside details modal)
    - BookingsPage.tsx — Bookings list, filter, edit (status/note/tour reassignment), delete
    - CalendarPage.tsx — Interactive bookings calendar (navigate months, hover day to list bookings, open/edit)
  - router/
    - AppRouter.tsx — Route definitions; protects admin routes via ProtectedRoute
  - services/
    - api.ts — Action-based API client wrapper
  - App.tsx, main.tsx — App bootstrap
- API_Usage.md — Backend API contract and examples
- ARCHITECTURE.md — This document

Module responsibilities:
- AuthContext:
  - Owns `isAuthenticated` flag derived from token presence
  - Persists token in localStorage as `admin_token`
- ProtectedRoute:
  - Blocks navigation if `isAuthenticated` is false
- api.ts:
  - `apiCall(action, data)` using fetch
  - Attaches `Authorization` header from localStorage for all admin calls
  - Exports helpers for tours/itineraries/bookings
- ToursPage:
  - Lists tours with key fields
  - Create/Edit via dialog
  - Details modal includes itinerary CRUD (days, activities)
  - Delete tour: invokes `delete_tour`; relies on backend to mark bookings as `unpaired`
- BookingsPage:
  - Lists bookings; filter by status (includes `unpaired`)
  - Edit dialog: update status & note and optionally reassign to a tour (select tour or set to unpaired)

---

## 5) Data Models (Frontend Types)

These mirror the API payloads and responses (see API_Usage.md for the full contract).

Tour
- id: number
- name: string
- description: string
- altitude: number
- difficulty: 1..5
- distance: number (km)
- temperature: string
- days: number
- hours: number
- price_one: number
- price_couple: number
- price_three_to_five: number
- price_six_plus: number
- images: string[]
- includes: string[]
- recommendations: string[]
- status: 'active' | 'inactive'
- created_at: ISO string

Itinerary
- id: number
- tour_id: number
- day: number (>= 1)
- activities: Activity[]
- created_at: ISO string

Activity
- name: string
- start_time: string (HH:MM)
- end_time: string (HH:MM)

Booking
- id: number
- tour_id: number | null (null means Unpaired)
- full_name: string
- document?: string
- phone: string
- nationality: string
- note?: string
- number_of_people: number (>= 1)
- departure_date: ISO date string (YYYY-MM-DD)
- applied_price: number
- status: 'pending' | 'confirmed' | 'canceled' | 'unpaired'
- created_at: ISO string

---

## 6) Routing & Auth

Routes
- /login — token entry
- / — dashboard (protected)
- /tours — tours + itineraries (protected)
- /bookings — bookings (protected)

Auth flow
1. Admin pastes a token in /login
2. App validates token by calling a protected action (`get_all_tours`) with the token
3. On success, token is saved in localStorage; ProtectedRoute allows navigation

Note: ProtectedRoute currently checks token presence, not validity. See Roadmap for token revalidation and 401 handling.

---

## 7) UI Flows

Login
- User enters token → validate via protected API call → save → redirect to dashboard

Tours CRUD
- Create/Edit tour via form; arrays provided as comma-separated text
- Details modal shows full tour fields and itinerary management
- Delete tour → backend marks related bookings as `unpaired`

Itinerary Management
- View itineraries per selected tour
- Add/Remove day
- Add/Remove/Update activities per day

Bookings Management
- List bookings; filter by status (includes `unpaired`)
- Edit booking: change status, note; select a tour to (re)assign or set to Unpaired
- Delete booking when necessary

---

## 8) API Client & Error Handling

- All admin calls use `Authorization: Bearer <token from localStorage>`
- Contract: single POST endpoint with `{ action, data }`
- Happy-path expects either `{ message: string }` or an array of records

Recommended improvements (Roadmap):
- Parse JSON on non-2xx and surface `error` messages to the UI
- Centralize 401 handling: clear token and redirect to /login
- Move base URL to `import.meta.env.VITE_API_URL`

---

## 9) Validation Guidelines

Client-side suggestions to reduce API errors:
- difficulty: clamp to 1..5
- itinerary day: min 1
- activity time: enforce HH:MM pattern
- number fields: disallow NaN, negative numbers where invalid
- required fields: highlight and block submit

---

## 10) Testing & Scenarios (Admin)

Manual verification via UI (recommended for acceptance):

A. Tours CRUD
1) Create a tour
2) Verify in list, open details, adjust fields, save
3) Delete the tour; ensure it disappears from list

B. Itineraries CRUD
1) Open tour details → Itinerary tab
2) Add a day with activities; save; reload
3) Update activities; save; reload
4) Delete a day; verify removal

C. Unpaired Bookings Flow
1) Ensure a tour has at least one booking (pre-existing data)
2) Delete the tour
3) Go to Bookings and filter by `Unpaired`; verify impacted bookings
4) Edit an unpaired booking → select a tour & set status (e.g., pending); save
5) Verify booking now shows under the selected tour

---

## 11) Dev Workflow

Install & run
- npm install
- npm run dev

Lint & build
- npm run lint
- npm run build
- npm run preview

Environment
- Vite + React + TypeScript + MUI
- Token stored as `localStorage.admin_token`

---

## 12) Conventions & Best Practices

- TypeScript-first with explicit interfaces for domain models
- Stateless API client functions (pure wrappers around fetch)
- UI state via React hooks per page/component
- Material UI components for consistent UX
- Keep actions idempotent where possible; re-fetch after mutations
- Avoid exposing admin token anywhere except localStorage at runtime

---

## 13) Roadmap & Enhancements

Security & Robustness
- [ ] Centralized 401 handling in api.ts: on unauthorized, clear token and redirect
- [ ] Token re-validation on app start (lightweight protected action)

DX & Reliability
- [ ] Surface API error messages in UI (parse JSON body on non-2xx)
- [ ] Move API URL to `VITE_API_URL` env var
- [ ] Add client-side validation on forms (difficulty, times, required fields)

UX
- [ ] Separate dedicated Itineraries page (optional; current UX is inline under Tour details)
- [ ] Sorting and search for Tours and Bookings tables
- [ ] Tour filter for bookings table (in addition to status)

---

## 14) Glossary

- Unpaired Booking: A booking whose original tour was deleted; it has no assigned tour and must be reassigned by an admin.
- Supabase Edge Function: Backend endpoint receiving action-based POST requests.
- Action-based API: Single endpoint where the `action` field instructs the server which operation to execute.

---

## 15) References

- API contract and examples: `API_Usage.md`
- Source code entry: `src/main.tsx`, `src/App.tsx`
- Router: `src/router/AppRouter.tsx`
- Auth: `src/contexts/AuthContext.tsx`, `src/components/ProtectedRoute.tsx`
- Services: `src/services/api.ts`
- Pages: `src/pages/*`
