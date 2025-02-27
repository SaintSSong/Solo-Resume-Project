import {
  ACCESS_TOKEN_EXPIRED_IN,
  HASH_SALT_ROUNDS,
  REFRESH_TOKEN_EXPIRED_IN,
} from "../constant/auth.constant.js";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../constant/env.constant.js";
import { MESSAGES } from "../constant/messages.constant.js";
import { HttpError } from "../errors/http.error.js";
import { bcrypt } from "bcrypt";
import { jwt } from "jsonwebtoken";

export class AuthService {
  signUP = async ({ email, password, name }) => {
    const existedUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existedUser) {
      throw new HttpError.Conflict(MESSAGES.AUTH.COMMON.EMAIL.DUPLICATED);
    }

    /**사용자 ID, 역할, 생성일시, 수정일시는 자동 생성됩니다. */

    const hashPassword = bcrypt.hashSync(password, HASH_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashPassword,
      },
    });

    user.password = undefined;
  };

  signIn = async ({ email, password }) => {
    const existedUser = await prisma.user.findUnique({
      where: { email },
    });

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

  //console.log("generateAuthTokens_userId", userId);

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRED_IN,
  });

  // console.log("accessToken", accessToken);

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRED_IN,
  });

  // console.log("REFRESH_TOKEN_EXPIRED_IN", REFRESH_TOKEN_EXPIRED_IN);
  // // 암호화를 또 해야해나?

  // console.log("refreshToken", refreshToken);

  const hashedRefreshToken = bcrypt.hashSync(refreshToken, HASH_SALT_ROUNDS);

  await prisma.refreshToken.upsert({
    where: { userId },
    update: { refreshToken: hashedRefreshToken },
    create: { userId, refreshToken: hashedRefreshToken },
  });

  return { accessToken, refreshToken };
};
