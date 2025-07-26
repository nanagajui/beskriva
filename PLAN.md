# Beskriva - Development Plan: Server-side Features

This document outlines the plan for building out the backend functionality for Beskriva. The goal is to move from a purely client-side, offline-first application to a hybrid model with user accounts and server-side data persistence.

## Phase 1: Backend Foundation - Database Integration

The first step is to replace the current in-memory storage with a persistent database using Drizzle ORM and PostgreSQL.

- [ ] **Setup PostgreSQL Database:** Configure and connect to a PostgreSQL database instance. Connection details will be managed via environment variables.
- [ ] **Run Database Migrations:** Use `drizzle-kit` to generate and apply the initial database schema based on `@shared/schema`.
- [ ] **Implement `DrizzleStorage`:** Create a new `DrizzleStorage` class in `server/storage.ts` that implements the `IStorage` interface. This class will contain the Drizzle ORM queries for all database operations.
- [ ] **Replace `MemStorage`:** Update `server/storage.ts` to instantiate and export `DrizzleStorage` instead of `MemStorage`.

## Phase 2: User Authentication

With the database in place, we will implement user registration and login functionality.

- [ ] **Password Hashing:** Use a library like `bcrypt` to hash user passwords before storing them in the database.
- [ ] **Implement Registration Endpoint:** Create a `POST /api/auth/register` endpoint in `server/routes.ts` that validates user input, hashes the password, and creates a new user in the database using `storage.createUser`.
- [ ] **Implement Login Endpoint:** Create a `POST /api/auth/login` endpoint that validates credentials.
- [ ] **Session Management:** Upon successful login, create a session for the user. We will use a library like `express-session` with a session store compatible with PostgreSQL.
- [ ] **Implement Logout Endpoint:** Create a `POST /api/auth/logout` endpoint to destroy the user's session.
- [ ] **Authentication Middleware:** Create middleware to protect routes that require an authenticated user. This middleware will check for a valid session.

## Phase 3: Frontend Integration

Next, we'll integrate the new authentication system with the React frontend.

- [ ] **Create Authentication UI:** Build React components for registration and login forms. These will likely be new pages or modals.
- [ ] **Create API Client Functions:** Add functions to the client-side API layer to make requests to the new `/api/auth` endpoints.
- [ ] **Manage Auth State:** Update the Zustand stores (or create a new `useAuthStore`) to manage the user's authentication state (e.g., `isAuthenticated`, `user` object). This state should be persisted across page loads.
- [ ] **Implement Protected Routes:** Update the client-side routing to handle protected routes, redirecting unauthenticated users to the login page.
- [ ] **Update UI:** Modify the UI to reflect the authenticated state, for example by displaying the user's name and providing a logout button.

## Phase 4: Server-Side Content Persistence (In Progress)

Once user accounts are functional, we can begin persisting user-generated content to the server. This will be a larger effort and will be broken down further.

- [x] **Extend Database Schema:** Update `@shared/schema` to include tables for user-generated content (e.g., chats, documents, workflows).
- [x] **Extend Storage Layer:** Add methods to `IStorage` and `DrizzleStorage` for CRUD operations on the new content types.
- [x] **Create API Endpoints:** Build out the API with endpoints for saving, retrieving, updating, and deleting user content.
- [x] **Integrate with Frontend:** Update the frontend to fetch and save content from the server, while still leveraging local storage for offline capabilities and optimistic updates. 