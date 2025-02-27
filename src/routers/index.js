import express from "express";

import { requireAccessToken } from "../middlewares/require-access-token.middleware.js";
import { authRouter } from "./auth.router.js";
import { usersRouter } from "./users.router.js";
import { resumeRouter } from "./resumes.router.js";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);

apiRouter.use("/users", usersRouter);

apiRouter.use("/resumes", requireAccessToken, resumeRouter);

export default apiRouter;
