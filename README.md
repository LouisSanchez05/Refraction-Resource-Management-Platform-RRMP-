# RRMP Backend

Refraction Resource Management Platform — a custom room booking and resource management system built to replace Skedda.

## Tech Stack

- Node.js + Express
- PostgreSQL
- Google OAuth (via Passport.js)
- Deployed on Render

## Getting Started

1. Install dependencies:
```
npm install
```

2. Create a `.env` file with the following:
```
PORT=3000
DATABASE_URL=postgresql://localhost:5432/rrmp
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
CALLBACK_URL=https://your-domain.com/auth/google/callback
```

3. Run the schema to create tables:
```
psql rrmp -f src/db/schema.sql
```

4. Start the server:
```
npm start
```

## API Endpoints

### Auth
- `GET /auth/google` — initiate Google login
- `GET /auth/google/callback` — OAuth callback
- `GET /auth/logout` — logout
- `GET /auth/me` — get current user

### Rooms
- `GET /api/rooms` — get all rooms
- `GET /api/rooms/:roomId` — get room by ID
- `GET /api/rooms/:roomId/availability` — check room availability

### Reservations
- `GET /api/reservations/room/:roomId` — get reservations for a room
- `GET /api/reservations/user/:userId` — get user's reservations
- `POST /api/reservations` — create a reservation
- `PATCH /api/reservations/:id` — edit a reservation
- `DELETE /api/reservations/:id` — cancel a reservation

### Memberships
- `POST /api/memberships/assign` — assign a plan to a company
- `GET /api/memberships/balance/:companyId` — get company balance
- `GET /api/memberships/monthly-report` — monthly billing report
- `GET /api/memberships/overages` — get companies with overages
- `PATCH /api/memberships/plans/:planId` — update a membership plan

### Admin
- `GET /api/admin/users` — get all users
- `PATCH /api/admin/users/:id/role` — update user role
- `PATCH /api/admin/users/:userId/company/:companyId` — assign user to company
- `GET /api/admin/companies` — get all companies
- `POST /api/admin/companies` — create a company
- `GET /api/admin/rooms` — get all rooms (admin)
- `POST /api/admin/rooms` — create a room
- `PATCH /api/admin/rooms/:id` — update a room
- `DELETE /api/admin/rooms/:id` — delete a room

### Reports
- `GET /api/reports/room-utilization` — room utilization report

### Audit
- `GET /api/audit` — get audit logs
