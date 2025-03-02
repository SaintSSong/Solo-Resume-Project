import express from "express";
import { UsersController } from "../controllers/users.controller.js";

const usersRouter = express.Router();
const usersController = new UsersController();

// requireAccessToken 넣어야한다.
usersRouter.get("/me", usersController.readMe);

export { usersRouter };
