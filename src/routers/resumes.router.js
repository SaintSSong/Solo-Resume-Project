import express from "express";
import { prisma } from "../utils/prisma.util.js";
import { MESSAGES } from "../constants/messages.constant.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { requireAccessToken } from "../middlewares/require-access-token.middleware.js";
import { createResumeValidator } from "../middlewares/validators/create-resume-validator.middleware.js";
import { updateResumeValidator } from "../middlewares/validators/update-resume-validator.middleware.js";
// import { requireRoles } from "../middlewares/requir-roles.middleware.js";
import { USER_ROLE } from "../constants/user.constant.js";
import { ResumesController } from "../controllers/resumes.controller.js";

const resumeRouter = express.Router();
const resumesController = new ResumesController();

// 이력서 생성
resumeRouter.post("/", createResumeValidator, resumesController.create);

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

// // 지원상태 변경 API
// resumeRouter.patch(
//   "/:resumeId/status",
//   requireRoles([USER_ROLE.RECRUITER]),
//   updateResumeValidator,
//   async (req, res, next) => {
//     try {
//       const user = req.user;
//       const recruiterId = user.userId;
//       const { resumeId } = req.params;

//       const { status, reason } = req.body;

//       // 트랜잭션
//       await prisma.$transaction(async (tx) => {
//         // 이력서 정보 조회
//         const existedResume = await tx.resume.findUnique({
//           where: {
//             resumeId: +resumeId,
//           },
//         });

//         // 이력서 정보가 없는 경우
//         if (!existedResume) {
//           return res.status(HTTP_STATUS.Not_Found).json({
//             status: HTTP_STATUS.Not_Found,
//             message: MESSAGES.RESUMES.COMMON.NOT_FOUND,
//           });
//         }

//         // 이력서 지원 상태  수정
//         const updatedResume = await tx.resume.update({
//           where: { resumeId: +resumeId },
//           data: { status },
//         });

//         // 이력서 로그 수정
//         const data = await tx.resumeLog.create({
//           data: {
//             recruiterId,
//             resumeId: existedResume.resumeId,
//             oldStatus: existedResume.status,
//             newStatus: updatedResume.status,
//             reason,
//           },
//         });

//         return res.status(HTTP_STATUS.OK).json({
//           status: HTTP_STATUS.OK,
//           message: MESSAGES.RESUMES.UPDATE.STATUS.SUCCEED,
//           date: data,
//         });
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// // 이력서 로그 목록 조회
// resumeRouter.get(
//   "/:resumeId/logs",
//   requireRoles([USER_ROLE.RECRUITER]),
//   async (req, res, next) => {
//     try {
//       const { resumeId } = req.params;

//       let data = await prisma.resumeLog.findMany({
//         where: { resumeId: +resumeId },
//         orderBy: {
//           createdAt: "desc",
//         },
//         // user?
//         // 바보였나? select을 하고 자빠졌누.
//         include: { recruiter: true },
//       });

//       console.log("1번 foundResume", data);

//       data = data.map((log) => {
//         return {
//           Id: log.id,
//           recruiterName: log.recruiter.name,
//           resumeId: log.resumeId,
//           oldStatus: log.oldStatus,
//           newStatus: log.newStatus,
//           reason: log.reason,
//           createdAt: log.createdAt,
//         };
//       });

//       console.log("foundResume", data);

//       return res.status(HTTP_STATUS.OK).json({
//         status: HTTP_STATUS.OK,
//         message: MESSAGES.RESUMES.READ_LIST.LOG.SUCCEED,
//         date: data,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

export { resumeRouter };
