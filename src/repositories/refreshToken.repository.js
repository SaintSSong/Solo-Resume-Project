import { prisma } from "../utils/prisma.util.js";

export class RefreshTokenRepository {
  readOneById = async (userId) => {
    const data = await prisma.user.findUnique({
      where: { userId: +userId },
      omit: { password: true },
    });

    return data;
  };

  // 로그아웃 시 사용
  update = async ({ userId }) => {
    const data = await prisma.refreshToken.update({
      where: {
        userId,
      },
      data: { refreshToken: null },
    });

    return { userId };
  };
}
