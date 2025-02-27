import express from "express";
import { AuthController } from "../controllers/auth.controller";
import { signUpValidator } from "../middlewares/validators/sign-up-validator.middleware.js";
import { signInValidator } from "../middlewares/validators/sign-in-validator.middleware.js";

const authRouter = express.Router();

const authController = new AuthController();

authRouter.post("/sign-up", signUpValidator, authController.signUp);

authRouter.post("/sign-ip", signInValidator, authController.signIn);
