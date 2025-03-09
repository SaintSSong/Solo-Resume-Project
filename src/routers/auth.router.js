import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { signUpValidator } from "../middlewares/validators/sign-up-validator.middleware.js";
import { signInValidator } from "../middlewares/validators/sign-in-validator.middleware.js";
import { requireRefreshToken } from "../middlewares/require-refresh-token.middleware.js";
import { upload } from "../middlewares/S3-Middleware.js";

const authRouter = express.Router();

const authController = new AuthController();

// 회원가입
authRouter.post(
  "/sign-up",
  upload.single("image"),
  signUpValidator,
  authController.signUp
);

// 로그인
authRouter.post("/sign-in", signInValidator, authController.signIn);

// 토큰 재발급
authRouter.post("/token", requireRefreshToken, authController.token);

// 로그아웃
authRouter.post("/sign-out", requireRefreshToken, authController.signOut);

export { authRouter };
