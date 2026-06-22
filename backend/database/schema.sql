-- USERS

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- POLLS

CREATE TABLE polls (
    id BIGSERIAL PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    poll_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    creator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- POLL OPTIONS
-- Used for:
-- single_choice polls
-- yes_no polls (optional)

CREATE TABLE poll_options (
    id BIGSERIAL PRIMARY KEY,
    poll_id BIGINT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_text VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- POLL RESPONSES

CREATE TABLE poll_responses (
    id BIGSERIAL PRIMARY KEY,

    poll_id BIGINT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    option_id BIGINT REFERENCES poll_options(id) ON DELETE CASCADE,

    rating INTEGER CHECK (
        rating IS NULL OR (rating >= 1 AND rating <= 5)
    ),

    text_response TEXT,

    boolean_response BOOLEAN,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, poll_id)
);



-- BOOKMARKS

CREATE TABLE bookmark_polls (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    poll_id BIGINT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, poll_id)
);



-- REFRESH TOKENS

CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    token TEXT NOT NULL,

    expires_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);