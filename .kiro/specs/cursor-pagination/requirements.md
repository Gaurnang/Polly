# Requirements Document

## Introduction

This feature replaces all offset-based pagination in the Polly polling application with cursor-based pagination to support infinite scroll. The migration covers three paginated backend endpoints — public polls feed, my-polls, and my-votes — and their corresponding frontend pages. Cursors are composite values derived from `(creator_id, created_at DESC)`, encoded as opaque base64 strings so clients never construct or parse them directly. The frontend infinite-scroll implementation uses `IntersectionObserver` to trigger automatic page loading as the user scrolls.

## Glossary

- **Cursor_Encoder**: The backend module responsible for serialising and deserialising composite cursor values to/from opaque base64 strings.
- **Pagination_Service**: The backend layer (repository + service) that accepts a cursor and limit and returns a page of results plus a `nextCursor`.
- **Poll_Feed**: The public `GET /api/polls` endpoint that returns a paginated list of polls visible to all users (optionally filtered by `poll_type` and `is_active`).
- **My_Polls_Feed**: The protected `GET /api/my-polls` endpoint that returns polls created by the authenticated user.
- **My_Votes_Feed**: The protected `GET /api/my-votes` endpoint that returns polls the authenticated user has responded to.
- **InfiniteList**: The frontend React component that wraps a list of `PollCard` items and triggers automatic loading of additional pages when the sentinel element enters the viewport.
- **Sentinel**: An invisible DOM element positioned at the bottom of an `InfiniteList` that is observed by an `IntersectionObserver` to detect scroll-to-bottom events.
- **Composite_Cursor**: The raw pair `(creator_id, created_at)` used as the keyset pagination boundary. Always ordered `created_at DESC`.
- **Opaque_Cursor**: A base64-encoded string representation of a `Composite_Cursor` that is safe for use in query parameters.
- **Poll_Store**: The Zustand state store (`pollStore.js`) in the frontend that manages poll data and pagination state.

---

## Requirements

### Requirement 1: Remove Offset Pagination from the Backend

**User Story:** As a developer, I want all offset/limit pagination logic removed from the backend, so that the codebase has a single, consistent cursor-based pagination strategy.

#### Acceptance Criteria

1. THE `findAllPolls` repository function SHALL remove `page` and `offset` parameters and SHALL accept `cursor` (an Opaque_Cursor string, optional) and `limit` (a positive integer) as its only pagination parameters.
2. THE `findPollsByCreator` repository function SHALL remove any unconditional full-table return behavior and SHALL accept `cursor` (optional) and `limit` as its only pagination parameters.
3. THE `findPollsVotedByUser` repository function SHALL remove any unconditional full-table return behavior and SHALL accept `cursor` (optional) and `limit` as its only pagination parameters.
4. THE Poll_Feed, My_Polls_Feed, and My_Votes_Feed response bodies SHALL NOT contain the fields `page`, `offset`, `totalPages`, or `totalCount`.
5. THE `findAllPolls`, `findPollsByCreator`, and `findPollsVotedByUser` repository functions SHALL NOT execute a secondary `COUNT(*)` query to compute `totalCount` or `totalPages`.
6. THE Poll_Feed SHALL NOT accept `page` or `offset` as query parameters; IF they are provided, THE Poll_Feed SHALL ignore them silently.

---

### Requirement 2: Cursor Encoding and Decoding

**User Story:** As a developer, I want cursors to be opaque to API clients, so that clients cannot construct or manipulate pagination state directly.

#### Acceptance Criteria

1. THE Cursor_Encoder SHALL encode a Composite_Cursor `{ creator_id, created_at }` (where `creator_id` is a positive integer and `created_at` is an ISO 8601 UTC timestamp string) into a base64-encoded JSON string.
2. WHEN the Cursor_Encoder decodes an Opaque_Cursor, THE Cursor_Encoder SHALL produce an object with a `creator_id` positive-integer field and a `created_at` ISO 8601 UTC timestamp string field.
3. IF a client provides an Opaque_Cursor that cannot be base64-decoded, or whose decoded content is not valid JSON, or whose JSON does not contain both `creator_id` and `created_at` fields, THEN THE Pagination_Service SHALL return HTTP 400 with `{ "error": "Invalid cursor" }`.
4. WHEN the Cursor_Encoder encodes the same Composite_Cursor twice, THE Cursor_Encoder SHALL return the same Opaque_Cursor string both times.
5. WHEN the Cursor_Encoder decodes the Opaque_Cursor produced by encoding a Composite_Cursor C, THE Cursor_Encoder SHALL return an object whose `creator_id` equals C.creator_id and whose `created_at` equals C.created_at.

---

### Requirement 3: Cursor-Based Query Logic

**User Story:** As a developer, I want queries to use keyset pagination on `(creator_id, created_at DESC)`, so that pagination is stable and efficient regardless of concurrent inserts.

#### Acceptance Criteria

1. WHEN no cursor is provided to a paginated endpoint, THE Pagination_Service SHALL return the first `limit` polls ordered by `created_at DESC, creator_id DESC`.
2. WHEN a valid cursor is provided, THE Pagination_Service SHALL return only polls satisfying `(p.created_at < cursor.created_at) OR (p.created_at = cursor.created_at AND p.creator_id < cursor.creator_id)`, ordered by `created_at DESC, creator_id DESC`.
3. THE Pagination_Service SHALL query `limit + 1` rows from the database and return at most `limit` rows to the caller.
4. WHEN the database returns more than `limit` rows, THE Pagination_Service SHALL set `hasMore = true` and SHALL set `nextCursor` to the Opaque_Cursor encoding of the last included row's `(creator_id, created_at)`.
5. WHEN the database returns `limit` or fewer rows, THE Pagination_Service SHALL set `hasMore = false` and `nextCursor = null`.
6. THE cursor boundary logic described in criteria 1–5 SHALL be applied identically in `findAllPolls`, `findPollsByCreator`, and `findPollsVotedByUser` — using each poll's own `created_at` and `creator_id` columns as the sort key.
7. IF a cursor is structurally valid (base64 JSON) but its `created_at` or `creator_id` fields are not of the correct type, THEN THE Pagination_Service SHALL return HTTP 400 with `{ "error": "Invalid cursor" }`.

---

### Requirement 4: Paginated Response Shape

**User Story:** As a frontend developer, I want a consistent API response shape for all paginated endpoints, so that the frontend can handle pagination uniformly.

#### Acceptance Criteria

1. THE Poll_Feed SHALL return a JSON response body with the shape `{ success: true, data: { polls: [...], nextCursor: string|null, hasMore: boolean } }`.
2. THE My_Polls_Feed SHALL return a JSON response body with the shape `{ success: true, data: { polls: [...], nextCursor: string|null, hasMore: boolean } }`.
3. THE My_Votes_Feed SHALL return a JSON response body with the shape `{ success: true, data: { polls: [...], nextCursor: string|null, hasMore: boolean } }`.
4. WHEN `hasMore` is `false`, THE Pagination_Service SHALL return `nextCursor` as `null`.
5. WHEN `hasMore` is `true`, THE Pagination_Service SHALL return `nextCursor` as a non-empty `Opaque_Cursor` string.
6. THE Pagination_Service SHALL NOT include `totalCount`, `totalPages`, or `currentPage` fields in any paginated response.

---

### Requirement 5: Configurable Page Size

**User Story:** As a developer, I want a configurable default page size, so that it can be tuned without code changes to multiple files.

#### Acceptance Criteria

1. THE Pagination_Service SHALL define a single shared constant `DEFAULT_PAGE_SIZE = 15` used as the default `limit` in all three paginated endpoints when no `limit` query parameter is provided.
2. WHEN a client provides an integer `limit` query parameter between 1 and 50 inclusive, THE Pagination_Service SHALL use that value as the page size.
3. WHEN a client provides an integer `limit` outside the range 1–50, THE Pagination_Service SHALL silently clamp it: values below 1 become 1, values above 50 become 50.
4. WHEN a client provides a non-integer `limit` value (e.g., `"abc"`, `"1.5"`), THE Pagination_Service SHALL use `DEFAULT_PAGE_SIZE` as the fallback.

---

### Requirement 6: Filter Compatibility with Cursor Pagination

**User Story:** As a user, I want to filter polls by type and status while using infinite scroll, so that pagination and filtering work together correctly.

#### Acceptance Criteria

1. WHEN `poll_type` or `is_active` filter parameters are provided together with a `cursor`, THE Poll_Feed SHALL apply the WHERE clause filters on `poll_type` and `is_active` first, then evaluate the cursor boundary condition on the filtered result set.
2. WHEN the user changes a filter value on the frontend, THE Poll_Store SHALL set `polls` to `[]`, `nextCursor` to `null`, and `hasMore` to `true` before dispatching a new fetch request for the first page.
3. THE Poll_Feed SHALL accept `poll_type` and `is_active` as optional query parameters alongside `cursor` and `limit`; their existing validation and filtering semantics SHALL remain unchanged.
4. WHEN a cursor from a previous filter context is submitted with a different filter value, THE Pagination_Service SHALL still apply the new filter first and then the cursor boundary — the result may be an empty page, which is acceptable.

---

### Requirement 7: Frontend Infinite Scroll — Poll Feed (HomePage)

**User Story:** As a user browsing the public poll feed, I want polls to load automatically as I scroll, so that I can browse without clicking pagination buttons.

#### Acceptance Criteria

1. THE InfiniteList component SHALL render an invisible `Sentinel` `<div>` element positioned after the last rendered `PollCard`.
2. WHEN the `Sentinel` enters the viewport AND `hasMore` is `true` AND `isLoading` is `false`, THE InfiniteList SHALL call `fetchPolls({ append: true, cursor: nextCursor })`.
3. WHILE `isLoading` is `true`, THE InfiniteList SHALL render a loading spinner and SHALL NOT call `fetchPolls` again.
4. WHEN `hasMore` is `false`, THE InfiniteList SHALL hide the `Sentinel` and SHALL render a `"You've reached the end"` message below the last poll card.
5. THE Poll_Store SHALL include `nextCursor: null` and `hasMore: true` as initial state fields for the public feed.
6. WHEN the user changes any filter (poll_type or is_active), THE Poll_Store SHALL synchronously reset `polls = []`, `nextCursor = null`, `hasMore = true` before calling `fetchPolls`.
7. THE InfiniteList SHALL NOT render prev/next pagination buttons, page number indicators, or any offset-based pagination controls.
8. IF `fetchPolls` returns an error, THE InfiniteList SHALL display an inline error message and SHALL NOT hide the `Sentinel`, allowing the user to retry by scrolling.

---

### Requirement 8: Frontend Infinite Scroll — My Polls Page

**User Story:** As a user viewing my own polls, I want polls to load automatically as I scroll, so that I can review all my polls without pagination buttons.

#### Acceptance Criteria

1. THE My_Polls_Feed page SHALL render two separate InfiniteList instances: one for active polls and one for closed polls, each with an independent Sentinel and cursor state.
2. WHEN the active-polls Sentinel enters the viewport AND `myActiveHasMore` is `true` AND `isLoading` is `false`, THE Poll_Store SHALL call `fetchMyPolls({ status: 'active', append: true, cursor: myActiveNextCursor })` and append results to the active polls list.
3. WHEN the closed-polls Sentinel enters the viewport AND `myClosedHasMore` is `true` AND `isLoading` is `false`, THE Poll_Store SHALL call `fetchMyPolls({ status: 'closed', append: true, cursor: myClosedNextCursor })` and append results to the closed polls list.
4. THE Poll_Store SHALL maintain four separate state fields: `myActiveNextCursor`, `myActiveHasMore`, `myClosedNextCursor`, and `myClosedHasMore`.
5. IF `fetchMyPolls` returns an error for either list, THE respective InfiniteList SHALL display an inline error and SHALL NOT hide its Sentinel.

---

### Requirement 9: Frontend Infinite Scroll — My Votes Page

**User Story:** As a user viewing my voted polls, I want polls to load automatically as I scroll, so that I can review all my voting history without pagination buttons.

#### Acceptance Criteria

1. THE My_Votes_Feed page SHALL render an InfiniteList that observes a Sentinel and calls `fetchMyVotedPolls({ append: true, cursor: myVotedPollsNextCursor })` when the Sentinel enters the viewport AND `myVotedPollsHasMore` is `true` AND `isLoading` is `false`.
2. THE Poll_Store SHALL maintain `myVotedPollsNextCursor: null` and `myVotedPollsHasMore: true` as initial state fields.
3. WHEN `myVotedPollsHasMore` is `false`, THE InfiniteList SHALL hide the Sentinel and display `"You've reached the end"` below the last poll card.
4. IF `fetchMyVotedPolls` returns an error, THE InfiniteList SHALL display an inline error message and SHALL NOT hide the Sentinel.

---

### Requirement 10: IntersectionObserver Sentinel Implementation

**User Story:** As a developer, I want the infinite scroll mechanism to use `IntersectionObserver`, so that it is performant and does not depend on scroll event listeners.

#### Acceptance Criteria

1. THE InfiniteList SHALL use a single `IntersectionObserver` instance per Sentinel, configured with `{ threshold: 0, rootMargin: "200px 0px" }`.
2. WHEN the `IntersectionObserver` callback fires AND `entry.isIntersecting` is `true`, THE InfiniteList SHALL invoke the load-more callback only if `hasMore === true` AND `isLoading === false`.
3. WHEN the InfiniteList component unmounts, THE InfiniteList SHALL call `observer.disconnect()` on the observer.
4. THE InfiniteList SHALL re-attach the observer inside a `useEffect` that lists `[hasMore, isLoading]` as dependencies.
5. IF the user's browser does not support `IntersectionObserver`, THE InfiniteList SHALL fall back to a manual "Load More" button that calls the load-more callback on click.

---

### Requirement 11: Cursor Stability

**User Story:** As a user, I want paginated results to be stable, so that re-requesting the same cursor always returns the same set of polls.

#### Acceptance Criteria

1. WHEN the same Opaque_Cursor and the same filter values are submitted to any paginated endpoint, THE Pagination_Service SHALL return the same poll IDs in the same order on every request, assuming no polls are inserted or deleted between calls.
2. THE Pagination_Service SHALL sort all paginated queries by `(created_at DESC, creator_id DESC)` so that every poll is uniquely positioned in the sort order.
3. IF two polls have the same `created_at` value, THE Pagination_Service SHALL break the tie using `creator_id DESC` to ensure a deterministic page boundary.
