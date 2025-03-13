export class RefreshTokenRepository {
  // 의존성 주입
  constructor(prisma) {
    this.prisma = prisma;
  }

  readOneById = async ({ userId }) => {
    const data = await this.prisma.refreshToken.findUnique({
      where: { userId: +userId },
    });

    return data;
  };

  // 로그아웃 시 사용
  update = async ({ userId }) => {
    await this.prisma.refreshToken.update({
      where: {
        userId,
      },
      data: { refreshToken: null },
    });

    return { userId };
  };

  deleteByUserId = async (userId) => {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  };
}
