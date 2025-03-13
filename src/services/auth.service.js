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

export class AuthService {
  constructor(usersRepository, refreshTokenRepository) {
    this.usersRepository = usersRepository;
    this.refreshTokenRepository = refreshTokenRepository;
  }

  // 회원가입
  signUP = async ({ email, password, name, image }) => {
    const existedUser = await this.usersRepository.readOneByEmail({ email });

    if (existedUser) {
      throw new HttpError.Conflict(MESSAGES.AUTH.COMMON.EMAIL.DUPLICATED);
    }

    const data = await this.usersRepository.create({
      email,
      password,
      name,
      image,
    });

    return data;
  };

  // 로그인
  signIn = async ({ email, password }) => {
    const existedUser = await this.usersRepository.readOneByEmail({ email });

    const isPasswordMatched =
      existedUser && bcrypt.compareSync(password, existedUser.password);

    if (!isPasswordMatched) {
      throw new HttpError.UNAUTHORIZED(MESSAGES.AUTH.COMMON.UNAUTHORIZED);
    }

    const payload = { userId: existedUser.userId };

    const data = await this.generateAuthTokens({ payload });

    return data;
  };

  // 토큰 재발급
  token = async ({ userId }) => {
    const userToken = await this.usersRepository.readOneById(userId);

    const payload = { userId: userToken.userId };
    const data = await this.generateAuthTokens({ payload });
    return data;
  };

  // 로그 아웃
  signOut = async ({ userId }) => {
    const data = await this.refreshTokenRepository.update({ userId });

    return data;
  };

  // AccessToken / RefreshToken 생성을 위한 함수
  generateAuthTokens = async ({ payload }) => {
    const userId = payload.userId;

    // ✅ 기존 refreshToken을 가져와서 삭제

    await this.refreshTokenRepository.deleteByUserId(userId);

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRED_IN,
    });

    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRED_IN,
    });

    const hashedRefreshToken = bcrypt.hashSync(refreshToken, HASH_SALT_ROUNDS);

    //===========================================================
    // ✅ 최신 refreshToken이 기존 것과 다를 때만 저장
    const existedRefreshToken = await this.refreshTokenRepository.readOneById({
      userId,
    });

    if (existedRefreshToken?.refreshToken) {
      console.log("기존 refreshToken이 폐기되지 않음! 강제 삭제!");
      await this.refreshTokenRepository.deleteByUserId(userId);
    }

    //===========================================================
    await this.usersRepository.tokenUpsert({
      userId,
      hashedRefreshToken,
    });

    return { accessToken, refreshToken };
  };
}
