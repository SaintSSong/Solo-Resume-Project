import { MESSAGES } from "../constants/messages.constant.js";
import { HttpError } from "../errors/http.error.js";
import { prisma } from "../utils/prisma.util.js";
import { invalidateResumesCache } from "../utils/redis.util.js";

export class ResumesService {
  constructor(resumesRepository, resumeLogsRepository) {
    this.resumesRepository = resumesRepository;
    this.resumeLogsRepository = resumeLogsRepository;
  }

  // 이력서 생성
  create = async ({ userId, title, content }) => {
    const data = await this.resumesRepository.create({
      userId,
      title,
      content,
    });

    return data;
  };

  // 이력서 목록 조회
  readMany = async ({ whereCondition, sort }) => {
    const data = await this.resumesRepository.readMany({
      whereCondition,
      sort,
    });

    return data;
  };

  // 관리자 전용 이력서 전체 목록 조회
  readALL = async ({ sort, offset, limit }) => {
    console.log("📡 서비스 진입");
    return await prisma.$transaction(async (tx) => {
      const resumesRaw = await this.resumesRepository.findManyWithPagination({
        sort,
        offset,
        limit,
        tx,
      });

      const totalCount = await this.resumesRepository.countAll({ tx });

      const resumes = resumesRaw.map((resume) => ({
        resumeId: resume.resumeId,
        authorName: resume.user.name,
        title: resume.title,
        content: resume.content,
        status: resume.status,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      }));

      return { resumes, totalCount };
    });
  };

  // 이력서 상세 조회
  readOne = async ({ whereCondition }) => {
    let data = await this.resumesRepository.readOne({
      whereCondition,
    });

    if (!data) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }

    return data;
  };

  // 이력서 수정
  update = async ({ userId, resumeId, title, content }) => {
    const existedResume = await this.resumesRepository.readOne({
      userId,
      resumeId: +resumeId,
    });

    // 이력서가 존재하지 않으면 예외 처리
    if (!existedResume) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }

    // 이력서 내용 수정
    const data = await this.resumesRepository.update({
      userId,
      resumeId,
      title,
      content,
    });

    // Redis 캐시 무효화 (관리자 이력서 목록 캐시 삭제)
    await invalidateResumesCache();

    return data;
  };

  // 이력서 삭제
  delete = async ({ userId, resumeId }) => {
    const existedResume = await this.resumesRepository.readOne({
      userId,
      resumeId: +resumeId,
    });

    if (!existedResume) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }

    const data = await this.resumesRepository.delete({
      userId,
      resumeId: +resumeId,
    });

    // Redis 캐시 무효화 (관리자 이력서 목록 캐시 삭제)
    await invalidateResumesCache();

    return data;
  };

  // 이력서 지원 상태 수정
  patch = async ({ recruiterId, resumeId, status, reason }) => {
    // 트랜잭션 시작
    const result = await prisma.$transaction(async (tx) => {
      // 이력서 정보 조회 트랜잭션

      const existedResume = await this.resumesRepository.findResumeByIdWithTx({
        resumeId: +resumeId,
        tx,
      });

      // 이력서 정보가 없는 경우
      if (!existedResume) {
        throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
      }

      // 이력서 지원 상태  수정
      // await tx.resumesRepository.updateResumeStatusWithTx( <- 이런 방법이 오류
      const updatedResume =
        await this.resumesRepository.updateResumeStatusWithTx({
          resumeId: +resumeId,
          status,
          tx,
        });

      // 이력서 로그 수정
      // 이거 왜 createResumeLogWithTx 에서 {}를 뺐어야 했나?
      // 답 : existedResume.status, / updatedResume.status, 는 컨트롤러에서 넘어온 구조분해할당
      // 즉 {resumeId : 1} 이런 형태가 아니라 트랜잭션 내부에서 생성되는 값 즉 "1" 이런 형태여서 {}가 붙으면 안됨
      // 나머지는 전부 {a:b} 형태인데 중간에 섞여있기 때문에 그럼

      // 이거 블로그에 남기자. GPT꺼도 같이
      // 그 외에도 다른 방법도 남기자.
      // const data = await resumeLogsRepository.createResumeLogWithTx(
      //   recruiterId,
      //   resumeId,
      //   existedResume.status,
      //   updatedResume.status,
      //   reason,
      //   tx
      // );

      // 아니면 아래와 같은 방법으로 만들어도 된다.
      const data = await this.resumeLogsRepository.createResumeLogWithTx({
        recruiterId,
        resumeId: +resumeId,
        oldStatus: existedResume.status, // ✅ 순서와 상관없이 정확한 값 전달 가능
        newStatus: updatedResume.status, // ✅ 순서와 상관없이 정확한 값 전달 가능
        reason,
        tx,
      });

      // 트랜잭션의 끝
      return data;
    });

    // Redis 캐시 무효화 (관리자 이력서 목록 캐시 삭제)
    await invalidateResumesCache();

    return result;
  };

  // 이력서 변경 로그 조회
  ResumeLogGet = async (resumeId) => {
    const findResumeLogsByResumeId =
      await this.resumeLogsRepository.findResumeLogsByResumeId(resumeId);

    let data = findResumeLogsByResumeId.map((log) => {
      return {
        Id: log.id,
        recruiterName: log.recruiter.name,
        resumeId: log.resumeId,
        oldStatus: log.oldStatus,
        newStatus: log.newStatus,
        reason: log.reason,
        createdAt: log.createdAt,
      };
    });

    return data;
  };
}
