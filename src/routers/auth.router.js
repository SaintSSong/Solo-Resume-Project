import express from "express";
import { AuthController } from "../controllers/auth.controller";
import { signUpValidator } from "../middlewares/vaildators/sign-up-vaildator.middleware.js";
import { signInValidator } from "../middlewares/vaildators/sign-in-vaildator.middleware.js";

const authRouter = express.Router();

const authController = new AuthController();

authRouter.post("/sign-up", signUpValidator, authController.signUp);

authRouter.post("/sign-ip", signInValidator, authController.signIn);
