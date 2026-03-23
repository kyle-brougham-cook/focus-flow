# Focus Flow

Focus Flow is a full-stack task management application designed to provide a clean, distraction-free way to manage tasks without unnecessary complexity.

Unlike many task management apps that overload users with features, Focus Flow focuses on simplicity — giving users a fast and intuitive way to create, manage, and complete tasks.

---

## 🚀 Live Demo

[WIP]

---

## 🛠️ Tech Stack

### Frontend
- React (TypeScript)
- Vite
- Axios

### Backend
- Flask
- Flask-JWT-Extended
- SQLAlchemy

### Testing & Tooling
- Pytest
- GitHub Actions (CI)

---

## ✨ Features

- User authentication (JWT-based)
- Secure token handling (cookie + in-memory)
- Task CRUD (create, update, delete, complete)
- Protected routes
- Automatic token refresh via Axios interceptors
- Ownership-based access control (users can only modify their own tasks)

---

## 🔐 Authentication Design

This project implements a **JWT-based authentication system** designed to reduce token exposure and improve session safety.

### Token Strategy

- **Access Token**
  - Stored in memory (React state)
  - Short-lived
  - Sent via Authorization header
  - Not persisted in localStorage

- **Refresh Token**
  - Stored in an HTTP-only cookie
  - Not accessible via JavaScript
  - Used to obtain new access tokens

- **CSRF Protection**
  - Required for refresh and state-changing requests
  - Prevents unauthorised cross-site requests

---

### Authentication Flow

1. User logs in and receives:
   - Access token (response body)
   - Refresh token (HTTP-only cookie)
   - CSRF token

2. Access token is stored in memory

3. On page reload:
   - App calls `/auth/refresh`
   - New access token is issued if refresh token is valid

4. On expired access token:
   - Axios interceptor catches 401 responses
   - Attempts token refresh once
   - Retries the original request

5. If refresh fails:
   - User is logged out and redirected to login

---

### Security Considerations

- Access tokens are not stored in localStorage to reduce XSS exposure
- Refresh tokens are protected via HTTP-only cookies
- CSRF protection prevents abuse of refresh and mutation endpoints
- Short-lived access tokens limit the impact of token compromise

---

## 🧠 Key Technical Decisions

### Why not localStorage?

LocalStorage is vulnerable to XSS attacks.
Storing tokens in memory and using HTTP-only cookies for refresh tokens reduces the risk of token theft.

---

### Why this authentication approach?

- Limits token exposure
- Reduces persistence of sensitive data
- Provides seamless user experience via automatic token refresh

---

### Backend Architecture

- Flask app factory pattern for clean configuration separation
- Environment-based configs (development, testing, production)
- Modular route structure
- Ownership checks enforced using JWT identity

---

## 🧪 Testing

The backend is tested using **Pytest**.

Test coverage includes:
- Authentication flows
- Task CRUD operations
- Authorization (ensuring users can only access their own data)

---

## ⚠️ Known Limitations

- No rate limiting implemented yet
- Error handling can be improved
- UI feedback system (toasts) is still basic
- Some features not implemented yet:
  - Search
  - Filtering
  - Sorting
  - Task priority

---

## 🚧 Future Improvements

- Rate limiting for API protection
- Improved error handling and validation
- Enhanced UI/UX feedback system
- Task filtering, sorting, and prioritisation
- Pagination for scalability

---

## 📦 Installation & Setup

### Clone the repository

```bash
git clone https://github.com/your-username/focus-flow.git
cd focus-flow
```

### Backend

```bash
cd focus_flow_app
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

pip install -r requirements.txt

flask db upgrade
flask run
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## 📌 Project Status

Actively being developed and improved as part of my portfolio.

## 👤 Author

Kyle Brougham-Cook
