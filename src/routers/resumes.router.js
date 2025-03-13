import express from "express";
import { requireAccessToken } from "../middlewares/require-access-token.middleware.js";
import { createResumeValidator } from "../middlewares/validators/create-resume-validator.middleware.js";
import { updateResumeValidator } from "../middlewares/validators/update-resume-validator.middleware.js";
import { USER_ROLE } from "../constants/user.constant.js";
import { ResumesController } from "../controllers/resumes.controller.js";
import { requireRoles } from "../middlewares/requir-roles.middleware.js";
import { updateResumeStatusValidator } from "../middlewares/validators/update-resume-status-validator.middleware.js";
import { ResumeLogsRepository } from "../repositories/resumeLogs.repository.js";
import { prisma } from "../utils/prisma.util.js";
import { ResumesService } from "../services/resumes.service.js";
import { ResumesRepository } from "../repositories/resumes.repository.js";

const resumeRouter = express.Router();

const resumeLogsRepository = new ResumeLogsRepository(prisma);
const resumesRepository = new ResumesRepository(prisma);
const resumesService = new ResumesService(
  resumesRepository,
  resumeLogsRepository
);
const resumesController = new ResumesController(resumesService);

// 이력서 생성
resumeRouter.post(
  "/",
  requireAccessToken,
  createResumeValidator,
  resumesController.create
);

// 이력서 목록 조회
resumeRouter.get("/", requireAccessToken, resumesController.readMany);

// 이력서 상세 조회
resumeRouter.get("/:resumeId", requireAccessToken, resumesController.readOne);

// 이력서 수정 API
resumeRouter.put(
  "/:resumeId",
  requireAccessToken,
  updateResumeValidator,
  resumesController.update
);

// 이력서 삭제 API
resumeRouter.delete("/:resumeId", requireAccessToken, resumesController.delete);

/// 여기서부터는 내가 직접해야하는것

// 지원상태 변경 API
resumeRouter.patch(
  "/:resumeId/status",
  requireRoles([USER_ROLE.RECRUITER]),
  updateResumeStatusValidator,
  resumesController.RecruiterResumePatch
);

// 이력서 로그 목록 조회
resumeRouter.get(
  "/:resumeId/logs",
  requireRoles([USER_ROLE.RECRUITER]),
  resumesController.ResumeLogGet
);

export { resumeRouter };
