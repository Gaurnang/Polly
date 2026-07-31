# Implementation Tasks

## Task 1: Schema additions and env vars
- 1.1 Append to `backend/schema.sql`: `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;`
- 1.2 Append to `backend/schema.sql`: `CREATE TABLE IF NOT EXISTS magic_link_tokens (id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, token VARCHAR(255) NOT NULL UNIQUE, purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('email_verification', 'password_reset')), expires_at TIMESTAMPTZ NOT NULL, used_at TIMESTAMPTZ);`
- 1.3 Append to `backend/schema.sql`: `CREATE INDEX IF NOT EXISTS idx_magic_link_tokens_token ON magic_link_tokens(token);`
- 1.4 Add to `backend/.env`: `RESEND_API_KEY=your_resend_api_key_here` and `RESEND_FROM_EMAIL=your_sender_email_here`

## Task 2: Backend - magic link repository and service
- 2.1 Create `backend/src/repository/magicLink.repository.js` with functions: `createToken({ userId, token, purpose, expiresAt })`, `findTokenByValue(token)`, `markTokenUsed(tokenId, client)`, `invalidateActiveTokensForUser(userId, purpose)`, `cleanupTokens(userId)`
- 2.2 Create `backend/src/services/magicLink.service.js` with functions: `generateMagicToken(userId, purpose)` (uses crypto.randomBytes(32).toString('base64url'), sets expiry 15min for email_verification, 30min for password_reset), `validateToken(tokenValue, expectedPurpose)` (checks exists/expired/used, returns user_id), `buildMagicLink(token, purpose)` (constructs CLIENT_URL + path)

## Task 3: Backend - email service with Resend and HTML template
- 3.1 Create `backend/src/templates/magicLinkEmail.js` — exports a function `renderEmail({ purpose, magicLink, expiresInMinutes })` that returns `{ subject, html, text }`. HTML should be a clean, professional inline-styled template with a CTA button. Subject: "Verify your Polly email" for email_verification, "Reset your Polly password" for password_reset.
- 3.2 Create `backend/src/services/email.service.js` — imports Resend SDK (`import { Resend } from 'resend'`), reads RESEND_API_KEY from env (throws if missing), exports `sendMagicLinkEmail({ to, purpose, magicLink, expiresInMinutes })`

## Task 4: Backend - auth routes for email verification and password reset
- 4.1 Update `backend/src/repository/auth.repository.js`: add `setEmailVerified(userId)` function, add `updateUserPassword(userId, hashedPassword)` function
- 4.2 Update `backend/src/services/auth.service.js`: modify `registerUser` to NOT return tokens immediately — instead send verification email and return `{ message: "Check your email to verify your account." }`. Add `verifyEmail(token)` service that validates token, sets email_verified, returns `{ user, accessToken, refreshToken }`. Add `requestPasswordReset(email)` and `confirmPasswordReset(token, newPassword)` services.
- 4.3 Update `backend/src/controllers/auth.controller.js`: modify `register` handler to return 200 with message (no tokens). Add `verifyEmail` handler (GET). Add `requestPasswordReset` handler (POST). Add `confirmPasswordReset` handler (POST).
- 4.4 Update `backend/src/routes/auth.routes.js`: add `GET /verify-email`, `POST /password-reset/request`, `POST /password-reset/confirm`

## Task 5: Frontend - VerifyEmailPage
- 5.1 Create `frontend/src/pages/VerifyEmailPage.jsx` — on mount reads `?token=` from URL, calls `POST /api/auth/verify-email` (or GET), on success stores user+token in authStore and redirects to /home with toast "Email verified! Welcome 🎉", on error shows error message with link to resend
- 5.2 Update `frontend/src/stores/authStore.js`: modify `register` action to NOT set isAuthenticated — instead return `{ success: true, needsVerification: true }`. Add `verifyEmail(token)` action.
- 5.3 Update `frontend/src/pages/RegisterPage.jsx`: after successful register, show "Check your email" message instead of navigating to /home
- 5.4 Add route `/verify-email` in `frontend/src/App.jsx` pointing to `VerifyEmailPage`

## Task 6: Frontend - ForgotPasswordPage and ResetPasswordPage
- 6.1 Create `frontend/src/pages/ForgotPasswordPage.jsx` — form with email input, calls `POST /api/auth/password-reset/request`, shows "If that email is registered, a reset link has been sent" on submit
- 6.2 Create `frontend/src/pages/ResetPasswordPage.jsx` — on mount reads `?token=` from URL, shows new password form, on submit calls `POST /api/auth/password-reset/confirm`, on success redirects to /login with toast
- 6.3 Add routes `/forgot-password` and `/reset-password` in `frontend/src/App.jsx`
- 6.4 Add "Forgot password?" link in `frontend/src/pages/LoginPage.jsx`
