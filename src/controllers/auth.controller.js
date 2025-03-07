import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

export class AuthController {
  signUp = async (req, res, next) => {
    try {
      const { email, password, name } = req.body;

      const data = await authService.signUP({ email, password, name });

      return res
        .status(HTTP_STATUS.CREATED)
        .json({ message: MESSAGES.AUTH.SIGN_UP.SUCCEED, data });
    } catch (error) {
      next(error);
    }
  };

  signIn = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const data = await authService.signIn({ email, password });

      console.log("Controller-signIn", data);

      return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.AUTH.SIGN_IN.SUCCEED,
        data: data,
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

      const data = await authService.token({ userId: payload });

      console.log("토큰 재발급", data);

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

      const data = await authService.signOut({ userId });

      return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.AUTH.SIGN_OUT.SUCCEED,
        data: { id: data.userId },
      });
    } catch (error) {
      next(error);
    }
  };
}
