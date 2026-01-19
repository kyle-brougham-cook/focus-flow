# Auth Notes (for future me)

- Access token lives in Authorization header
- Refresh token lives in HttpOnly cookie
- On app load:
  - try refresh
  - success → authenticated
  - fail → guest
- ProtectedRoute waits for auth to hydrate
- Axios does NOT decide auth state
