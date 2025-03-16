import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import { CLOUDFRONT_URL } from "../constants/env.constant.js";

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  signUp = async (req, res, next) => {
    try {
      const { email, password, name } = req.body;

      // 삼항 연산자로 만약 스키마에 Image가 null 허용일 시 아래과 같이 작성해야 한다.
      // const image = req.file ? req.file.location : null;

      // 하지만 나는 null 값 허용이 아니기 때문에 아래와 같이 작성
      // const image = req.file.location;

      // ✅ S3 URL을 CloudFront URL로 변환
      const s3Url = req.file.location;
      const imagePath = s3Url.replace(
        "https://solo-resume-project-s3-static-files.s3.ap-northeast-2.amazonaws.com",
        ""
      );

      const image = `${CLOUDFRONT_URL}/api${imagePath}`;

      const data = await this.authService.signUP({
        email,
        password,
        name,
        image,
      });

      return res
        .status(HTTP_STATUS.CREATED)
        .json({ message: MESSAGES.AUTH.SIGN_UP.SUCCEED, data });
    } catch (error) {
      next(error);
    }
  };

  // 프로필 이미지 조회
  profileImage = async (req, res, next) => {
    try {
      const userId = req.user; // 로그인한 사용자 정보 (JWT 또는 세션에서 가져옴)

      const data = await this.authService.getUserById(userId); // 사용자 조회

      if (!data || !data.image) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "이미지가 없습니다." });
      }

      return res.status(HTTP_STATUS.OK).json({
        message: "이미지를 성공적으로 불러왔습니다.",
        imageUrl: data.image,
      });
    } catch (error) {
      next(error);
    }
  };

  signIn = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const data = await this.authService.signIn({ email, password });

      return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.AUTH.SIGN_IN.SUCCEED,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // 토큰 재발급
  token = async (req, res, next) => {
    try {
      const user = req.user;

      const payload = { userId: user.userId };

      // const refreshToken = user.refreshToken; refreshToken

      const data = await this.authService.token({ userId: payload });

      console.log("토큰 재발급", data.accessToken);

      return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.AUTH.TOKEN.SUCCEED,
        data: data,
      });
    } catch (error) {
      next(error);
    }
  };

  // 로그아웃
  signOut = async (req, res, next) => {
    try {
      const user = req.user;

      const { userId } = user;

      const data = await this.authService.signOut({ userId });

      return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.AUTH.SIGN_OUT.SUCCEED,
        data: { id: data.userId },
      });
    } catch (error) {
      next(error);
    }
  };
}
