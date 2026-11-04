
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import pollRoutes from "./routes/poll.routes.js";
import authRoutes from "./routes/auth.routes.js";
import responseRoutes from "./routes/response.routes.js";
import resultRoutes from "./routes/result.routes.js";
import bookmarkRoutes from "./routes/bookmark.routes.js";
import myPollRoutes from "./routes/mypoll.routes.js";
import myVoteRoutes from "./routes/myvote.routes.js";

const app = express();

const allowedOrigins = [
    ...(process.env.CLIENT_URL || "").split(","),
    ...(process.env.CORS_ORIGIN || "").split(","),
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://polly-theta.vercel.app",
]
.map(origin => origin.trim().replace(/\/$/, ""))
.filter(Boolean);

console.log("Allowed origins:", allowedOrigins);

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: (origin, callback) => {
        console.log("Incoming origin:", origin);

        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.error("Blocked origin:", origin);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/api/auth", authRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/polls", responseRoutes);
app.use("/api/polls", resultRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/my-polls", myPollRoutes);
app.use("/api/my-votes", myVoteRoutes);

export default app;
