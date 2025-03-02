import { prisma } from "../utils/prisma.util.js";

export class ResumesRepository {
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
        id: Resume.resumeId,
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

  // resumeService.update에서도 사용하기 위해서
  // 하나의 함수를 둘 다 쓰게하려고 includeAuthor = false를 넣는다.
  // 디폴트가 false여서 "service의 readOne"처럼 명시적으로 true하지 않으면
  // readOnd의 include : {user}는 같이 조회되지 않는다.
  readOne = async ({ userId, resumeId, whereCondition }) => {
    // 만약 whereCondition이 없다면 if문을 실행해라

    if (!whereCondition) {
      let data = await prisma.resume.findUnique({
        // 안되면 resumeId : 를 id로 바꿔보자.
        where: { resumeId: +resumeId, userId },
      });

      return data;
    }

    // whereCondition이 있으면 아래 코드로 진행해라
    let data = await prisma.resume.findUnique({
      where: whereCondition,
      include: {
        user: true,
      },
    });

    if (!data) return null;

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
    console.log("222", userId, resumeId);
    const data = await prisma.resume.update({
      where: { userId, resumeId: +resumeId },
      data: { ...(title && { title }), ...(content && { content }) },
    });

    return data;
  };

  delete = async ({ userId, resumeId }) => {
    const data = await prisma.resume.delete({
      where: { userId, resumeId: +resumeId },
    });

    return data;
  };
}
