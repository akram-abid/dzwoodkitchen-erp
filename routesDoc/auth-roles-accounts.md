# API Routes — Auth, Roles, Users

All `roles`/`users` routes require **admin** auth (`withAuth("admin", ...)`) — send the `token` cookie set at login.

---

## Auth

### `POST /api/login`
**Send:**
```json
{ "email": "user@example.com", "password": "secret123" }
```
**Get:**
```json
{
  "loginData": {
    "token": "jwt...",
    "user": { "id": 1, "name": "Ibrahim", "email": "...", "role": true }
  }
}
```
⚠️ `role` returns a **boolean** (`true` if admin), not the role name — heads up if frontend expects a string.
Also sets an `httpOnly` cookie: `token`.

### `POST /api/auth/forgot-password`
**Send:**
```json
{ "email": "user@example.com" }
```
**Get:**
```json
{ "message": "If that account exists, a reset link has been sent." }
```

### `POST /api/auth/reset-password`
**Send:**
```json
{ "token": "xxx", "password": "newPassword123" }
```
**Get:**
```json
{ "message": "Password updated." }
```
or `400` → `{ "error": "Invalid or expired token" }`

---

## Roles

### `GET /api/roles`
**Get:** array of roles
```json
[{ "id": 1, "name": "admin", "created_at": "..." }]
```

### `POST /api/roles`
**Send:**
```json
{ "name": "manager" }
```
**Get:** created role object (`201`)

### `DELETE /api/roles/[id]`
**Get:** deleted role object, or `500` if role still assigned to users (`"Role in use — reassign users first"`)

---

## Users

### `GET /api/users`
**Get:** array of users with `role` and `worker` included

### `POST /api/users`
Three ways to create a user, same endpoint — behavior depends on what you send:

**1. Plain user, no worker link:**
```json
{ "name": "Admin Two", "email": "a2@x.com", "password": "pass", "role_id": 1 }
```

**2. Link login to an existing worker (already in `workers` table):**
```json
{ "name": "Karim", "email": "k@x.com", "password": "pass", "role_id": 2, "worker_id": 7 }
```


**3. Create the worker + login together in one call:**
Send `payment_type` (no `worker_id`) → worker gets auto-created.
```json
{
  "name": "Karim",
  "email": "k@x.com",
  "password": "pass",
  "role_id": 2,
  "payment_type": "HOURLY",
  "phone": "0555xxxxxx",
  "hire_date": "2026-08-01",
  "hourlyRate": 500,
  "meterRate": null
}
```

**Get:** created user object (`201`)

### `PATCH /api/users/[id]`
**Send:** any subset of user fields — include `password` to change it (auto-hashed):
```json
{ "name": "New Name", "password": "newpass" }
```
**Get:** updated user object

### `DELETE /api/users/[id]`
**Get:** deleted user object

### `PATCH /api/users/[id]/role`
**Send:**
```json
{ "role_id": 3 }
```
**Get:** updated user object with new `role_id`
