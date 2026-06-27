import bcrypt from "bcrypt";
import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import {
    generateAccessToken,
    generateRefreshToken
} from "../utils/jwt.js";

export const refreshAccessToken = async (refreshToken) => {

    if (!refreshToken) {
        throw new Error("Refresh token missing.");
    }

    let decoded;

    try {

        decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

    } catch (err) {

        throw new Error("Invalid refresh token.");

    }

    const tokenResult = await pool.query(
        `
        SELECT *
        FROM refresh_tokens
        WHERE token = $1
        `,
        [refreshToken]
    );

    if (!tokenResult.rows.length) {

        throw new Error("Refresh token revoked.");

    }

    const userResult = await pool.query(
        `
        SELECT id,email,username
        FROM users
        WHERE id = $1
        `,
        [decoded.id]
    );

    if (!userResult.rows.length) {
        throw new Error("User not found.");
    }

    const user = userResult.rows[0];

    const accessToken = generateAccessToken(user);

    return {
        accessToken
    };

};

export const registerUser = async (username, email, password) => {

    const exists = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    if (exists.rows.length) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `
        INSERT INTO users(username,email,password)
        VALUES($1,$2,$3)
        RETURNING id,username,email
        `,
        [username, email, hashedPassword]
    );

    return result.rows[0];
};

export const loginUser = async (email, password) => {

    const result = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
    );

    if (!result.rows.length) {
        throw new Error("Invalid credentials");
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(
        password,
        user.password
    );

    if (!validPassword) {
        throw new Error("Invalid credentials");
    }

    return user;
};