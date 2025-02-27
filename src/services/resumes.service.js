import { prisma } from "../utils/prisma.util";
import { MESSAGES } from "../constant/messages.constant";
import { HttpError } from "../errors/http.error";

export class ResumesService {
  create = async ({ userId, title, content }) => {
    const data = await prisma.resume.create({
      data: { userId: +userId, title, content },
    });

    return data;
  };

  readMany = async ({ whereCondition, sort }) => {
    let data = await prisma.resume.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: sort,
      },
      include: {
        user: true,
      },
    });

    data = data.map((Resume) => {
      return {
        id: Resume.userId,
        authorName: Resume.user.name,
        title: Resume.title,
        content: Resume.content,
        status: Resume.status,
        createdAt: Resume.createdAt,
        updatedAt: Resume.updatedAt,
      };
    });

    return data;
  };

  readOne = async ({ whereCondition }) => {
    let data = await prisma.resume.findFirst({
      where: whereCondition,
      include: {
        user: true,
      },
    });

    if (!data) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }

    data = {
      id: data.userId,
      authorName: data.user.name,
      title: data.title,
      content: data.content,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    return data;
  };

  update = async ({ userId, resumeId, title, content }) => {
    const existedResume = await prisma.resume.findUnique({
      where: { userId, resumeId: +resumeId },
    });

    if (!existedResume) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }

    const data = await prisma.resume.update({
      where: { userId, resumeId: +resumeId },
      data: { ...(title && { title }), ...(content && { content }) },
    });

    return data;
  };

  delete = async ({ userId, resumeId }) => {
    const existedResume = await prisma.resume.findUnique({
      where: { userId, resumeId: +resumeId },
    });

    if (!existedResume) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }

    const data = await prisma.resume.delete({
      where: { userId, resumeId: +resumeId },
    });

    return { id: data.resumeId };
  };
}
