import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { signUpValidator } from "../middlewares/validators/sign-up-validator.middleware.js";
import { signInValidator } from "../middlewares/validators/sign-in-validator.middleware.js";
import { requireAccessToken } from "../middlewares/require-access-token.middleware.js";

const authRouter = express.Router();

const authController = new AuthController();

authRouter.post("/sign-up", signUpValidator, authController.signUp);

authRouter.post("/sign-in", signInValidator, authController.signIn);

// 토큰 재발급
authRouter.post("/token", requireAccessToken, authController.token);

// 로그아웃
// authRouter.post("/sign-out", requireAccessToken, authController.signOut);

export { authRouter };
