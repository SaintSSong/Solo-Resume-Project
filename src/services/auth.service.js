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
import { RefreshTokenRepository } from "../repositories/refreshToken.repository.js";

const usersRepository = new UsersRepository();
const refreshTokenRepository = new RefreshTokenRepository();

export class AuthService {
  signUP = async ({ email, password, name, image }) => {
    const existedUser = await usersRepository.readOneByEmail({ email });

    if (existedUser) {
      throw new HttpError.Conflict(MESSAGES.AUTH.COMMON.EMAIL.DUPLICATED);
    }

    const data = await usersRepository.create({ email, password, name, image });

    return data;
  };

  signIn = async ({ email, password }) => {
    console.log("email", email);
    const existedUser = await usersRepository.readOneByEmail({ email });

    // 여기서부터는 해설에서 나온 코드
    // 코드 해석하면 && 이니까 이메일을 통해서 조회되어서 비밀번호까지 같이 검증되거나
    // 검증이 안되거나
    const isPasswordMatched =
      existedUser && bcrypt.compareSync(password, existedUser.password);

    if (!isPasswordMatched) {
      throw new HttpError.UNAUTHORIZED(MESSAGES.AUTH.COMMON.UNAUTHORIZED);
    }

    const payload = { userId: existedUser.userId };

    const data = await generateAuthTokens({ payload });

    console.log("Service-data", data);

    return { data };
  };

  // 토큰 재발급
  token = async ({ userId }) => {
    const userToken = await usersRepository.readOneById(userId);

    const payload = { userId: userToken.userId };
    const data = await generateAuthTokens({ payload });
    return data;
  };

  // 로그 아웃
  signOut = async ({ userId }) => {
    const data = await refreshTokenRepository.update({ userId });

    return data;
  };
}

// AccessToken / RefreshToken 생성을 위한 함수
const generateAuthTokens = async ({ payload }) => {
  const userId = payload.userId;

  // 새로 추가
  // ✅ 기존 refreshToken을 가져와서 삭제
  console.log("userId11", userId);
  await refreshTokenRepository.deleteByUserId(userId);

  console.log("deleteByUserId1 / 완료");

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRED_IN,
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRED_IN,
  });

  const hashedRefreshToken = bcrypt.hashSync(refreshToken, HASH_SALT_ROUNDS);

  //===========================================================
  // ✅ 최신 refreshToken이 기존 것과 다를 때만 저장
  const existedRefreshToken = await refreshTokenRepository.readOneById({
    userId,
  });

  if (existedRefreshToken?.refreshToken) {
    console.log("🚨 [ERROR] 기존 refreshToken이 폐기되지 않음! 강제 삭제!");
    await refreshTokenRepository.deleteByUserId(userId);
  }

  //===========================================================
  await usersRepository.tokenUpsert({
    userId,
    hashedRefreshToken,
  });

  console.log("accessToken", accessToken);
  console.log("refreshToken", refreshToken);

  return { accessToken, refreshToken };
};
