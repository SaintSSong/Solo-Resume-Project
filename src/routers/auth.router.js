import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { signUpValidator } from "../middlewares/validators/sign-up-validator.middleware.js";
import { signInValidator } from "../middlewares/validators/sign-in-validator.middleware.js";
import { requireRefreshToken } from "../middlewares/require-refresh-token.middleware.js";
import { uploadSingle, getS3Image } from "../middlewares/S3-Middleware.js";

import { prisma } from "../utils/prisma.util.js";
import { UsersRepository } from "../repositories/users.repository.js";
import { AuthService } from "../services/auth.service.js";
import { RefreshTokenRepository } from "../repositories/refreshToken.repository.js";

const authRouter = express.Router();

const refreshTokenRepository = new RefreshTokenRepository(prisma);
const usersRepository = new UsersRepository(prisma);
const authService = new AuthService(usersRepository, refreshTokenRepository);
const authController = new AuthController(authService);

// 회원가입
authRouter.post(
  "/sign-up",
  uploadSingle,
  signUpValidator,
  authController.signUp
);

// 2) 업로드된 이미지 다운로드 (EC2 -> S3 프록시)
authRouter.get("/uploads/:filename", getS3Image);

// 로그인
authRouter.post("/sign-in", signInValidator, authController.signIn);

// 토큰 재발급
authRouter.post("/token", requireRefreshToken, authController.token);

// 로그아웃
authRouter.post("/sign-out", requireRefreshToken, authController.signOut);

export { authRouter };
