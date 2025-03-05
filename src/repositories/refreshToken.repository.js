import { prisma } from "../utils/prisma.util.js";

export class RefreshTokenRepository {
  readOneById = async (userId) => {
    const data = await prisma.user.findUnique({
      where: { userId: +userId },
      omit: { password: true },
    });

    return data;
  };
}
