import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import { USER_ROLE } from "../constants/user.constant.js";

// 레디스 추가
import redis from "../utils/redis.util.js";

export class ResumesController {
  constructor(resumesService) {
    this.resumesService = resumesService;
  }

  // 이력서 생성
  create = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { title, content } = req.body;

      const data = await this.resumesService.create({ userId, title, content });

      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
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

      const data = await this.resumesService.readMany({ whereCondition, sort });

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.READ_LIST.SUCCEED,
        date: data,
      });
    } catch (error) {
      next(error);
    }
  };

  // 관리자용 이력서 전체 목록 조회
  readALL = async (req, res, next) => {
    try {
      // query에서 sort, page, limit 파라미터 추출 (기본값 지정)
      let { sort, page = 1, limit = 10 } = req.query;

      // sort가 존재하면 그건 대소문자 상관없이 소문자로
      sort = sort?.toLowerCase();

      // sort가 (req.query가 "ASC","DESC"도 아니면) 둘다 아니면 기본 DESC로
      if (sort !== "asc" && sort !== "desc") {
        sort = "desc";
      }

      // page, limit을 숫자로 변환
      page = parseInt(page);
      limit = parseInt(limit);

      // 몇 번째 데이터부터 가져올지 offset 계산
      const offset = (page - 1) * limit;

      // 🔑 Redis 캐시 키 구성
      const cacheKey = `resumes:admin:page=${page}:limit=${limit}:sort=${sort}`;

      // 1. Redis에서 먼저 가져오기
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("📦 Redis 캐시로 응답");
        return res.status(200).json(JSON.parse(cached));
      }

      // 2. DB에서 조회
      // 서비스로 offset, limit, sort 전달
      const { resumes, totalCount } = await this.resumesService.readALL({
        sort,
        offset,
        limit,
      });

      // ✅ 3. 응답 데이터 구조 구성
      const responseData = {
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.READ_LIST.SUCCEED,
        data: {
          resumes,
          pagination: {
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
          },
        },
      };

      // ✅ 4. Redis에 캐시 저장 (TTL 300초 = 5분)
      await redis.set(cacheKey, JSON.stringify(responseData), "EX");

      // ✅ 5. 응답 반환
      return res.status(HTTP_STATUS.OK).json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // 이력서 상세 조회
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

      let data = await this.resumesService.readOne({ whereCondition });

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.READ_DETAIL.SUCCEED,
        date: data,
      });
    } catch (error) {
      next(error);
    }
  };

  // 이력서 수정
  update = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { resumeId } = req.params;
      const { title, content } = req.body;

      const data = await this.resumesService.update({
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

  // 이력서 삭제
  delete = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { resumeId } = req.params;

      const data = await this.resumesService.delete({ userId, resumeId });

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.DELETE.SUCCEED,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // 이력서 지원 상태 수정
  RecruiterResumePatch = async (req, res, next) => {
    try {
      const user = req.user;
      const recruiterId = user.userId;
      const { resumeId } = req.params;

      const { status, reason } = req.body;

      // 트랜잭션
      const data = await this.resumesService.patch({
        recruiterId,
        resumeId,
        status,
        reason,
      });

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.UPDATE.STATUS.SUCCEED,
        date: data,
      });
    } catch (error) {
      next(error);
    }
  };

  // 이력서 로그 목록 조회
  ResumeLogGet = async (req, res, next) => {
    try {
      const { resumeId } = req.params;

      const data = await this.resumesService.ResumeLogGet(resumeId);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.READ_LIST.LOG.SUCCEED,
        date: data,
      });
    } catch (error) {
      next(error);
    }
  };
}
