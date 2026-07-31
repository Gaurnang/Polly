# Requirements Document

## Introduction

This feature adds magic-link-based email verification on registration and password reset to the existing Polly polling application. Instead of OTP entry, the user receives a time-limited URL by email. Clicking the link either verifies the user's email address (for registration) or opens a password-reset form (for the reset flow). All emails are delivered via the Resend service. The existing password-based login remains the only login method.

## Glossary

- **Magic_Link_Service**: The backend module responsible for generating, storing, validating, and expiring magic link tokens.
- **Email_Service**: The backend wrapper around the Resend API that composes and delivers HTML emails.
- **Auth_Controller**: The existing Express controller at `auth.controller.js` that handles authentication HTTP requests.
- **Magic_Link_Token**: A cryptographically random, URL-safe token stored in the database with an expiry timestamp and a purpose (`email_verification` or `password_reset`).
- **Token_Store**: The new `magic_link_tokens` database table that persists Magic_Link_Tokens.
- **HTML_Email_Template**: A self-contained HTML file used by Email_Service to render the email body sent to users.
- **Resend**: The third-party transactional email service (resend.com) used as the email delivery provider.
- **Access_Token**: A short-lived JWT (15 minutes) granting access to protected API endpoints.
- **Refresh_Token**: A long-lived JWT (7 days) stored as an httpOnly cookie, used to obtain new Access_Tokens.
- **Client_URL**: The frontend base URL defined in the `CLIENT_URL` environment variable.

---

## Requirements

### Requirement 1: Magic Link Token Infrastructure

**User Story:** As a developer, I want a dedicated database table and service layer for magic link tokens, so that both the email-verification and password-reset flows share a single, consistent token lifecycle.

#### Acceptance Criteria

1. THE Token_Store SHALL contain the columns: `id`, `user_id`, `token`, `purpose`, `expires_at`, and `used_at`, where `id`, `user_id`, `token`, `purpose`, and `expires_at` are NOT NULL.
2. THE Token_Store `token` column SHALL have a UNIQUE constraint and SHALL NOT exceed 255 characters.
3. THE Token_Store `purpose` column SHALL accept only the values `email_verification` and `password_reset` enforced via a CHECK constraint.
4. WHEN the Magic_Link_Service creates a Magic_Link_Token, THE Magic_Link_Service SHALL generate a cryptographically random 32-byte URL-safe token using `crypto.randomBytes(32).toString('base64url')`.
5. WHEN the Magic_Link_Service creates a Magic_Link_Token for purpose `password_reset`, THE Magic_Link_Service SHALL set `expires_at` to exactly 30 minutes from the current UTC time.
6. WHEN the Magic_Link_Service validates a token and the token does not exist in the Token_Store, THE Magic_Link_Service SHALL throw a not-found error without revealing whether the token ever existed.
7. WHEN the Magic_Link_Service validates a token and the token's `expires_at` (UTC) is in the past, THE Magic_Link_Service SHALL throw an expired error and SHALL NOT modify `used_at`.
8. WHEN the Magic_Link_Service validates a token and `used_at` is not NULL, THE Magic_Link_Service SHALL throw an already-used error and SHALL NOT modify `used_at`.
9. WHEN the Magic_Link_Service successfully validates a token, THE Magic_Link_Service SHALL set `used_at` to the current UTC timestamp within the same database transaction as the dependent action; IF the transaction rolls back THEN both `used_at` and the dependent action SHALL be rolled back together.
10. THE Magic_Link_Service SHALL expose a `cleanupTokens(userId)` function that deletes all rows in Token_Store where `user_id = userId` AND (`expires_at < NOW()` OR `used_at IS NOT NULL`) and returns the count of deleted rows.

---

### Requirement 2: Email Verification via Magic Link (Registration)

**User Story:** As a new user, I want to register with my email, username, and password and then verify my email via a magic link, so that my account is confirmed without needing to type a code.

#### Acceptance Criteria

1. WHEN the Auth_Controller receives a `POST /api/auth/register` request with a valid `email`, `username`, and `password`, THE Auth_Controller SHALL create the user account with `email_verified = FALSE` and send an email-verification magic link (valid for 15 minutes, usable once) to the provided address.
2. WHEN the Magic_Link_Service sends a registration magic link, THE Email_Service SHALL use the HTML_Email_Template with purpose context `email_verification` and subject line "Verify your Polly email".
3. WHEN the Auth_Controller receives a `GET /api/auth/verify-email` request with a valid, unexpired, unused `token` query parameter, THE Auth_Controller SHALL set `email_verified = TRUE`, invalidate the token by setting `used_at` to the current UTC timestamp, return an Access_Token in the response body, and set the Refresh_Token as an HttpOnly cookie.
4. IF the `token` query parameter is missing from `GET /api/auth/verify-email`, THEN THE Auth_Controller SHALL return HTTP 400 with message `"token query parameter is required"`.
5. IF the token provided to `GET /api/auth/verify-email` is expired or already used, THEN THE Auth_Controller SHALL return HTTP 401 with message `"Invalid or expired verification link"`.
6. IF a `POST /api/auth/register` request is received with an `email` that already exists in the users table, THEN THE Auth_Controller SHALL return HTTP 409 with message `"Email already in use"`.
7. IF a `POST /api/auth/register` request is received with a `password` fewer than 8 characters or an `email` that does not match RFC 5322 format, THEN THE Auth_Controller SHALL return HTTP 400 with a descriptive validation error message.

---

### Requirement 3: Password Reset via Magic Link

**User Story:** As a registered user, I want to request a password reset link sent to my email, so that I can set a new password without contacting support.

#### Acceptance Criteria

1. WHEN the Auth_Controller receives a `POST /api/auth/password-reset/request` request with a valid email format, THE Auth_Controller SHALL — if the email is registered — invalidate any existing active `password_reset` token for that user, generate a new Magic_Link_Token with purpose `password_reset` (valid for 15 minutes, usable once), and send the link to that address.
2. IF the `email` provided to `POST /api/auth/password-reset/request` is not registered, THEN THE Auth_Controller SHALL return HTTP 200 with the message `"If that email is registered, a reset link has been sent"` to prevent user enumeration.
3. WHEN the Auth_Controller receives a `POST /api/auth/password-reset/confirm` request with a valid `token` and a `newPassword` that is 8–128 characters and contains at least one uppercase letter, one lowercase letter, one digit, and one special character, THE Auth_Controller SHALL hash the `newPassword` with bcrypt and update the user's stored password hash, then mark the token as used.
4. IF the `token` provided to `POST /api/auth/password-reset/confirm` is expired, already used, or not found, THEN THE Auth_Controller SHALL return HTTP 401 with message `"Invalid or expired reset link"` and SHALL NOT update the user's password.
5. IF the `newPassword` provided to `POST /api/auth/password-reset/confirm` is fewer than 8 characters or greater than 128 characters or does not meet complexity rules, THEN THE Auth_Controller SHALL return HTTP 400 with a descriptive validation error and SHALL NOT update the user's password.
6. WHEN the Magic_Link_Service generates a password-reset magic link, THE Magic_Link_Service SHALL construct the link as `{CLIENT_URL}/auth/reset-password?token={token}`.
7. WHEN `POST /api/auth/password-reset/request` is called for a user who already has an active (unexpired, unused) `password_reset` token, THE Magic_Link_Service SHALL invalidate (mark as used) the existing token before creating a new one.

---

### Requirement 4: HTML Email Template

**User Story:** As a product owner, I want all transactional emails to use a consistent, professionally styled HTML template, so that the brand looks polished and the call-to-action is clear.

#### Acceptance Criteria

1. THE HTML_Email_Template SHALL include a prominent call-to-action button rendered as an `<a>` tag styled as a button, whose `href` attribute is set to the interpolated `{{magicLink}}` variable.
2. THE HTML_Email_Template SHALL display a heading whose text is determined by `{{purpose}}`: `"Verify your email"` for `email_verification` and `"Reset your password"` for `password_reset`.
3. THE HTML_Email_Template SHALL include a sentence reading `"This link expires in {{expiresInMinutes}} minutes."` in the email body.
4. THE HTML_Email_Template SHALL include a plain-text alternative part containing the unformatted text `"If the button doesn't work, copy and paste this link into your browser: {{magicLink}}"`.
5. THE HTML_Email_Template SHALL accept exactly three interpolation variables: `{{magicLink}}` (a URL string), `{{expiresInMinutes}}` (a positive integer), and `{{purpose}}` (one of `email_verification` or `password_reset`).
6. WHERE the email purpose is `password_reset`, THE Email_Service SHALL set the email subject to `"Reset your Polly password"`.
7. WHERE the email purpose is `email_verification`, THE Email_Service SHALL set the email subject to `"Verify your Polly email"`.
8. IF any required interpolation variable (`{{magicLink}}`, `{{expiresInMinutes}}`, or `{{purpose}}`) is missing or undefined when the Email_Service renders the template, THEN THE Email_Service SHALL throw an error before calling the Resend API.

---

### Requirement 5: Email Service Integration (Resend)

**User Story:** As a developer, I want a dedicated email service module backed by Resend, so that all outbound emails go through a single, testable layer.

#### Acceptance Criteria

1. THE Email_Service SHALL read the Resend API key from the `RESEND_API_KEY` environment variable at module load time.
2. IF `RESEND_API_KEY` is not set or is an empty string at startup, THEN THE Email_Service SHALL throw an `Error("RESEND_API_KEY environment variable is required")` that prevents the server from starting.
3. WHEN the Email_Service sends an email, THE Email_Service SHALL use the sender address from the `RESEND_FROM_EMAIL` environment variable; IF `RESEND_FROM_EMAIL` is not set, THE Email_Service SHALL default to `"noreply@polly.app"` as the sender.
4. IF the Resend API returns an error response (non-2xx status or error object), THEN THE Email_Service SHALL throw an error whose message includes the Resend error details.
5. THE Email_Service SHALL expose a single function `sendMagicLinkEmail({ to, purpose, magicLink, expiresInMinutes })` that renders the HTML_Email_Template with the provided variables and sends the email via the Resend API.

---

### Requirement 6: Environment Variable Updates

**User Story:** As a developer, I want all required environment variables documented and present in `.env` files, so that the feature can be configured without searching through source code.

#### Acceptance Criteria

1. THE backend `.env` file SHALL include a `RESEND_API_KEY` entry whose placeholder value is a non-empty string that is not a valid Resend API key (e.g., `"your_resend_api_key_here"`).
2. THE backend `.env` file SHALL include a `RESEND_FROM_EMAIL` entry whose placeholder value is a non-empty string that is not a valid email address (e.g., `"your_sender_email_here"`).
3. THE backend `.env` file SHALL include a `CLIENT_URL` entry (if not already present) used to construct magic link URLs.

---

### Requirement 7: Schema Additions

**User Story:** As a developer, I want all new database structures defined as additive SQL statements in schema.sql, so that the existing data model is never broken.

#### Acceptance Criteria

1. THE schema.sql file SHALL contain a `CREATE TABLE IF NOT EXISTS magic_link_tokens` statement appended after the existing table definitions, with columns: `id SERIAL PRIMARY KEY`, `user_id INTEGER NOT NULL`, `token VARCHAR(255) NOT NULL UNIQUE`, `purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('email_verification', 'password_reset'))`, `expires_at TIMESTAMPTZ NOT NULL`, `used_at TIMESTAMPTZ`.
2. THE magic_link_tokens table SHALL include a FOREIGN KEY on `user_id` referencing `users(id)` with `ON DELETE CASCADE`.
3. THE schema.sql file SHALL include a `CREATE INDEX IF NOT EXISTS` on `magic_link_tokens(token)` to support fast token lookups.
4. THE schema.sql file SHALL NOT contain any `ALTER TABLE`, `DROP TABLE`, `DROP COLUMN`, or modification of any table or column that existed before this feature.
