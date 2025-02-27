import { HTTP_STATUS } from "../constant/http-status.constant";
import { MESSAGES } from "../constant/messages.constant";
import { USER_ROLE } from "../constant/user.constant";
import { ResumesService } from "../services/resumes.service";

const resumesService = new ResumesService();

export class ResumesController {
  // 이력서 생성
  create = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { title, content } = req.body;

      const data = await resumesService.create({ userId, title, content });

      return res.status(HTTP_STATUS.Created).json({
        status: HTTP_STATUS.Created,
        message: MESSAGES.RESUMES.CREATED.SUCCEED,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // 이력서 목록 조회
  readMany = async (req, res, next) => {
    try {
      const user = req.user;

      const userId = user.userId;

      // 내가 몰랐고 해설을 통해서 알게 된 것!
      let { sort } = req.query;

      // sort가 존재하면 그건 대소문자 상관없이 소문자로
      sort = sort?.toLowerCase();

      // sort가 (req.query가 "ASC","DESC"도 아니면) 둘다 아니면 기본 DESC로
      if (sort !== "asc" && sort !== "desc") {
        sort = "desc";
      }

      const whereCondition = {};

      // 채용 담당자인 경우
      if (user.role === USER_ROLE.RECRUITER) {
        // status를 받고, query 조건에 추가
        const { status } = req.query;

        if (status) {
          whereCondition.status = status;
        }

        // 채용 담당자가 아닌 경우
      } else {
        // 자신이 작성한 이력서만 조회
        whereCondition.userId = userId;
      }

      const data = await resumesService.readMany({ whereCondition, sort });

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.READ_LIST.SUCCEED,
        date: data,
      });
    } catch (error) {
      next(error);
    }
  };

  readOne = async (req, res, next) => {
    try {
      const user = req.user;
      const userId = user.userId;
      const { resumeId } = req.params;

      const whereCondition = {
        resumeId: +resumeId,
      };

      if (user.role !== USER_ROLE.RECRUITER) {
        whereCondition.userId = userId;
      }

      let data = await resumesService.readOne({ whereCondition });

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.READ_DETAIL.SUCCEED,
        date: data,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { resumeId } = req.params;
      const { title, content } = req.body;

      const data = await resumesService.update({
        userId,
        resumeId,
        title,
        content,
      });

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.UPDATE.SUCCEED,
        date: data,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { resumeId } = req.params;

      const data = await resumesService.delete({ userId, resumeId });

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.DELETE.SUCCEED,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
