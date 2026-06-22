create table user {
    id bigserial primary key not null,
    email varchar(255) unique not null,
    password varchar(255) not null,
    created_at timestamp default current_timestamp,
    userName varchar(255) unique not null,
}

create table polls {
    id bigserial primary key not null,
    question varchar(255) not null,
    isActive boolean default true,
    pollType varchar(50) not null,
    creator_id bigint not null references user(id) on delete cascade,
    created_at timestamp default current_timestamp
}

create table bookmarkPolls {
    id bigserial primary key not null,
    user_id bigint not null references user(id),
    poll_id bigint not null references polls(id) on delete cascade,
    created_at timestamp default current_timestamp,
    unique(user_id, poll_id)
}

create table pollOptions {
    id bigserial primary key not null,
    poll_id bigint not null references polls(id) on delete cascade,
    option_text varchar(255) not null,
    created_at timestamp default current_timestamp,
}



CREATE TABLE poll_responses (
    id BIGSERIAL PRIMARY KEY,

    poll_id BIGINT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),

    option_id BIGINT,
    rating INTEGER,
    text_response TEXT,
    boolean_response BOOLEAN,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, poll_id)
);