import express from "express";
import { UsersController } from "../controllers/users.controller.js";
import { requireAccessToken } from "../middlewares/require-access-token.middleware.js";

const usersRouter = express.Router();
const usersController = new UsersController();

// requireAccessToken 넣어야한다.
usersRouter.get("/me", requireAccessToken, usersController.readMe);

export { usersRouter };
