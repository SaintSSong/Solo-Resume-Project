import { HASH_SALT_ROUNDS } from "../constants/auth.constant.js";
import bcrypt from "bcrypt";

export class UsersRepository {
  // 의존성 주입
  constructor(prisma) {
    this.prisma = prisma;
  }
  // 유저 생성
  create = async ({ email, password, name, image }) => {
    // 이거 여기 넣은 이유
    // 무조건 유저 생성시에 HASH 처리를 하게 할려고
    const hashPassword = bcrypt.hashSync(password, HASH_SALT_ROUNDS);

    const data = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashPassword,
        image,
      },
      // omit : password는 가져오지 않오록 하는 것
      omit: { password: true },
    });

    return data;
  };

  // // ID로 사용자 조회
  // readById = async (userId) => {
  //   const user = await this.prisma.user.findUnique({
  //     where: { id: userId },
  //   });

  //   return user;
  // };

  // email을 통한 User 찾기
  readOneByEmail = async ({ email }) => {
    const data = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    return data;
  };

  // AccessToken / RefreshToken 생성에 필요한 함수
  tokenUpsert = async ({ userId, hashedRefreshToken }) => {
    const data = await this.prisma.refreshToken.upsert({
      where: { userId },
      update: { refreshToken: hashedRefreshToken },
      create: { userId, refreshToken: hashedRefreshToken },
    });

    return data;
  };

  readOneById = async ({ userId }) => {
    const data = await this.prisma.user.findUnique({
      where: { userId: +userId },
      omit: { password: true },
    });

    return data;
  };
}
