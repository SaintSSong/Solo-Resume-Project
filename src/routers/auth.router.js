import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { signUpValidator } from "../middlewares/validators/sign-up-validator.middleware.js";
import { signInValidator } from "../middlewares/validators/sign-in-validator.middleware.js";

const authRouter = express.Router();

const authController = new AuthController();

console.log("여기 왔나?");

authRouter.post("/sign-up", signUpValidator, authController.signUp);

authRouter.post("/sign-in", signInValidator, authController.signIn);

export { authRouter };
