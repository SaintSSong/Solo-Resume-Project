import { HTTP_STATUS } from "../constant/http-status.constant.js";
import { MESSAGES } from "../constant/messages.constant.js";

export class UsersController {
  // 내 정보 조회
  readMe = async (req, res, next) => {
    try {
      const data = req.user;

      // 반환정보
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.USERS.READ_ME.SUCCEED,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
