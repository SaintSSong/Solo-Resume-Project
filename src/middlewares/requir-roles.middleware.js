import { MESSAGES } from "../constants/messages.constant.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";

export const requireRoles = (roles) => {
  // roles라는 것을 배열로 받을 것이다.
  return (req, res, next) => {
    try {
      const user = req.user;

      // includes는 []의 메서드로 내용이 포함 되는지 안되는지 판단하는 배열의 메서드
      const hasPermission = user && roles.includes(user.role);

      if (!hasPermission) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          status: HTTP_STATUS.FORBIDDEN,
          message: MESSAGES.AUTH.COMMON.FORBIDDEN,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
