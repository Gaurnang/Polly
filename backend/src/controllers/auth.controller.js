import pool from "../config/db.js";

import {
    registerUser,
    loginUser,
} from "../services/auth.service.js";

import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/jwt.js";

import { refreshAccessToken } from "../services/auth.service.js";

export const register = async (req, res) => {

    try {

        const { username, email, password } = req.body;

        const user = await registerUser(
            username,
            email,
            password
        );

        const accessToken =
            generateAccessToken(user);

        const refreshToken =
            generateRefreshToken(user);

        await pool.query(
            `
            INSERT INTO refresh_tokens
            (user_id,token,expires_at)
            VALUES($1,$2,NOW()+INTERVAL '7 days')
            `,
            [
                user.id,
                refreshToken,
            ]
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: false,
        });

        res.status(201).json({
            user,
            accessToken,
        });

    } catch (err) {

        res.status(400).json({
            message: err.message,
        });

    }

};

export const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await loginUser(
            email,
            password
        );

        const accessToken =
            generateAccessToken(user);

        const refreshToken =
            generateRefreshToken(user);

        await pool.query(
            `
            INSERT INTO refresh_tokens
            (user_id,token,expires_at)
            VALUES($1,$2,NOW()+INTERVAL '7 days')
            `,
            [
                user.id,
                refreshToken,
            ]
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: false,
        });

        res.json({
            accessToken,
        });

    } catch (err) {

        res.status(401).json({
            message: err.message,
        });

    }

};

export const me = async (req, res) => {

    res.json(req.user);

};

export const refreshToken = async (req, res) => {

    try {

        const refreshToken = req.cookies.refreshToken;

        const data = await refreshAccessToken(refreshToken);

        return res.status(200).json(data);

    } catch (err) {

        return res.status(401).json({
            message: err.message
        });

    }

};