# Forgot Password – Frontend Integration

## 1. Request reset

```
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }
Response: { "message": "If that account exists, a reset link has been sent." }
```

Always the same response — don't show "email not found" errors (prevents user enumeration).

## 2. Reset page

Route: `/reset-password?token=xxx` (token comes from the email link, already in URL)

Grab it with:

```js
const token = new URLSearchParams(window.location.search).get("token");
```

## 3. Submit new password

```
POST /api/auth/reset-password
Body: { "token": "xxx", "password": "newPassword123" }
```

**Success:**
```json
{ "message": "Password updated." }
```

**Error (bad/expired token):**
```json
{ "error": "Invalid or expired token" }
```
→ Show: "Link expired or invalid, request a new one." Send them back to the forgot-password form.

## UI needed

- **Form 1**: email input → calls `forgot-password`
- **Form 2** (on reset page): password + confirm password → calls `reset-password` with token from URL
- Handle the 400 error case explicitly — that's the only failure state that matters here.
