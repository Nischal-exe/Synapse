DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR,
    date_of_birth VARCHAR,
    hashed_password VARCHAR NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    refresh_token VARCHAR
);
