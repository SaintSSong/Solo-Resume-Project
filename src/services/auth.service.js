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
import { UsersRepository } from "../repositories/users.repository.js";

const usersRepository = new UsersRepository();

export class AuthService {
  signUP = async ({ email, password, name }) => {
    const existedUser = await usersRepository.readOneByEmail(email);

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

  // 토큰 재발급
  token = async ({ userId, refreshToken }) => {
    const userToken = await usersRepository.findRefreshTokenByUserId(userId);

    const isValid =
      userToken && bcrypt.compareSync(refreshToken, userToken.refreshToken);

    if (!isValid) {
      throw new HttpError.Unauthorized(MESSAGES.AUTH.COMMON.Unauthorized);
    }

    const data = await generateAuthTokens({ userId });

    return data;
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

  await usersRepository.tokenUpsert({
    userId,
    hashedRefreshToken,
  });

  return { accessToken, refreshToken };
};
