import {
  ACCESS_TOKEN_EXPIRED_IN,
  HASH_SALT_ROUNDS,
  REFRESH_TOKEN_EXPIRED_IN,
} from "../constants/auth.constant.js";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../constants/env.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import { HttpError } from "../errors/http.error.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma.util.js";
import { UsersRepository } from "../repositories/users.repository.js";

const usersRepository = new UsersRepository();

export class AuthService {
  signUP = async ({ email, password, name }) => {
    const existedUser = await usersRepository.readOneByEmail(email);

    console.log("service- password", password);
    if (existedUser) {
      throw new HttpError.Conflict(MESSAGES.AUTH.COMMON.EMAIL.DUPLICATED);
    }

    const data = await usersRepository.create({ email, password, name });

    return data;
  };

  signIn = async ({ email, password }) => {
    const existedUser = await usersRepository.readOneByEmail(email);

    // 여기서부터는 해설에서 나온 코드
    // 코드 해석하면 && 이니까 이메일을 통해서 조회되어서 비밀번호까지 같이 검증되거나
    // 검증이 안되거나
    const isPasswordMatched =
      existedUser && bcrypt.compareSync(password, existedUser.password);

    if (!isPasswordMatched) {
      throw new HttpError.Unauthorized(MESSAGES.AUTH.COMMON.Unauthorized);
    }

    const payload = { userId: existedUser.userId };

    const data = await generateAuthTokens(payload);

    return { data };
  };
}

// AccessToken / RefreshToken 생성을 위한 함수
const generateAuthTokens = async (payload) => {
  const userId = payload.userId;

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRED_IN,
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRED_IN,
  });

  const hashedRefreshToken = bcrypt.hashSync(refreshToken, HASH_SALT_ROUNDS);

  //========================
  /**
   * 그냥 내 생각이야
   * 서비스에서는 prisma를 쓰면 안돼
   * 그러면 어짜피 이렇게 된거
   * await prisma.refreshToken.upsert({ 이 녀석도
   * userRepository로 넣어서 하나 만들고 return 시키자.
   * 그걸 data라고 하고
   * return도 {data라고 하면 되잖아.}
   */

  await prisma.refreshToken.upsert({
    where: { userId },
    update: { refreshToken: hashedRefreshToken },
    create: { userId, refreshToken: hashedRefreshToken },
  });

  return { accessToken, refreshToken };
};
