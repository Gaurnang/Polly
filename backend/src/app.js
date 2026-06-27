import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pollRoutes from "./routes/poll.routes.js";
import authRoutes from "./routes/auth.routes.js";
import responseRoutes from "./routes/response.routes.js";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/polls",pollRoutes);
app.use("/api/v1/polls", responseRoutes);

export default app;