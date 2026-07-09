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

app.use(express.json());

app.use(cookieParser());

app.use(cors({
    origin: "https://polly-theta.vercel.app/",
    credintials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/polls", responseRoutes);
app.use("/api/polls", resultRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/my-polls", myPollRoutes);
app.use("/api/my-votes", myVoteRoutes);

export default app;
