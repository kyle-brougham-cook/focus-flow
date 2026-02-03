# Authentication Architecture

This application uses a hybrid JWT-based authentication system designed to balance
security, usability, and implementation complexity.

## Goals

- Prevent long-lived credentials from being accessible to frontend JavaScript
- Allow seamless session continuation without frequent re-authentication
- Minimize attack surface while keeping the system debuggable and maintainable

## Token Strategy

The system uses two types of tokens:

### Access Token
- Short-lived JWT
- Used to authorize access to protected API routes
- Stored client-side for ease of request authorization
- Automatically refreshed when expired

### Refresh Token
- Long-lived JWT
- Stored in an HttpOnly cookie
- Never accessible to JavaScript
- Used exclusively to mint new access tokens

## CSRF Protection

Because refresh tokens are stored in cookies (which are automatically sent by the browser),
CSRF protection is required.

A CSRF token is issued alongside the refresh token and must be explicitly sent in request
headers when accessing the refresh endpoint. This ensures that only requests originating
from the legitimate frontend can refresh access tokens.

## Authentication Flow

1. User logs in with credentials
2. Backend issues:
   - Access token (returned in response body)
   - Refresh token (HttpOnly cookie)
   - CSRF token (readable cookie)
3. Frontend attaches access token to protected requests
4. If access token expires:
   - Frontend calls refresh endpoint
   - Browser sends refresh cookie automatically
   - Frontend includes CSRF token in headers
5. Backend validates tokens and issues a new access token

## Logout

Logout is handled via a backend route that clears authentication cookies.
Once refresh tokens are removed, the session cannot be extended and the user is
treated as unauthenticated after access token expiry.

## Tradeoffs & Design Decisions

This system intentionally uses a hybrid approach rather than full cookie-based authentication.

Advantages:
- Reduced CSRF complexity for general API requests
- Easier debugging and development workflow
- Short-lived access tokens limit exposure

Limitations:
- Stateless JWTs cannot be revoked instantly
- Access token storage requires careful handling

This design was chosen as appropriate for the application's scope and threat model.
