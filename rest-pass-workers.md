# Admin — Reset Worker Password

Admin-only route. Admin sets the new password directly and tells the worker — no email involved.

## Flow

1. Admin loads worker list → `GET /api/users`
2. Admin clicks a worker's name in the UI (frontend already has their `id` from the list response — admin never sees or types it)
3. Frontend calls the reset route using that `id`

## Route

### `POST /api/users/[id]/reset-password`

**Send:**
```json
{ "password": "newSecurePass123" }
```

**Get:**
```json
{ "id": 7, "message": "Password reset successfully" }
```

**Errors:**
```json
{ "error": "Password must be at least 6 characters" }
```
→ `400`

## Notes

- Requires admin auth (`withAuth("admin", ...)`)
- No email sent, no token flow — direct overwrite
- Admin decides the password, tells the worker in person / WhatsApp / whatever
