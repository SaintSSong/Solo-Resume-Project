import { HASH_SALT_ROUNDS } from "../constant/auth.constant.js";
import { prisma } from "../utils/prisma.util.js";
import { bcrypt } from "bcrypt";

export class UsersRepository {
  // 유저 생성
  create = async (email, password, name) => {
    // 이거 여기 넣은 이유
    // 무조건 유저 생성시에 HASH 처리를 하게 할려고
    const hashPassword = bcrypt.hashSync(password, HASH_SALT_ROUNDS);

    const data = await prisma.user.create({
      data: {
        email,
        name,
        password: hashPassword,
      },
      // omit : password는 가져오지 않오록 하는 것
      omit: { password: true },
    });

    return data;
  };

  // email을 통한 User 찾기
  readOneByEmail = async (email) => {
    const data = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    return data;
  };

  // AccessToken / RefreshToken 생성을 위한 함수에 필요한
  // upsert를 위한 공간
  /**
   *
   *
   *
   *
   *
   */

  readOneById = async (userId) => {
    const data = await prisma.user.findUnique({
      where: { userId: +userId },
      omit: { password: true },
    });

    return data;
  };
}
