import { MESSAGES } from "../constant/messages.constant";
import { HttpError } from "../errors/http.error";
import { ResumesRepository } from "../repositories/resumes.repository";

const resumesRepository = new ResumesRepository();

export class ResumesService {
  create = async ({ userId, title, content }) => {
    const data = await resumesRepository.create({ userId, title, content });

    return data;
  };

  readMany = async ({ whereCondition, sort }) => {
    const data = await resumesRepository.readMany({ whereCondition, sort });

    return data;
  };

  readOne = async ({ whereCondition }) => {
    let data = await resumesRepository.readOne({
      whereCondition,
    });

    if (!data) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }

    return data;
  };

  update = async ({ userId, resumeId, title, content }) => {
    const existedResume = await resumesRepository.readOne({
      where: { userId, resumeId: +resumeId },
    });

    if (!existedResume) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }

    const data = await resumesRepository.update({
      userId,
      resumeId,
      title,
      content,
    });

    return data;
  };

  delete = async ({ userId, resumeId }) => {
    const existedResume = await resumesRepository.readOne({
      where: { userId, resumeId: +resumeId },
    });

    if (!existedResume) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }

    const data = await resumesRepository.delete({
      where: { userId, resumeId: +resumeId },
    });

    return data;
  };
}
