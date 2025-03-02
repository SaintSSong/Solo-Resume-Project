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
        .status(HTTP_STATUS.Created)
        .json({ message: MESSAGES.AUTH.SIGN_UP.SUCCEED, data });
    } catch (error) {
      next(error);
    }
  };

  signIn = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const data = await authService.signIn({ email, password });

      return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.AUTH.SIGN_IN.SUCCEED,
        data: data,
      });
    } catch (error) {
      next(error);
    }
  };
}
