import { HTTP_STATUS } from "../constant/http-status.constant.js";
import { MESSAGES } from "../constant/messages.constant.js";

export class UsersController {
  // 내 정보 조회
  readMe = async (req, res, next) => {
    try {
      const data = req.user;

      //   // userId를 통한 user 찾기
      //   const findUser = await prisma.user.findUnique({
      //     where: { userId: +userId },
      //   });

      //   if (!findUser) {
      //     return res.status(HTTP_STATUS.Unauthorized).json({
      //       status: HTTP_STATUS.Unauthorized,
      //       message: MESSAGES.AUTH.COMMON.Unauthorized,
      //     });
      //   }

      //   findUser.password = undefined;

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
