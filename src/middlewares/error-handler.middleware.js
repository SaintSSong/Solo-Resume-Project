import { HTTP_STATUS } from "../constant/http-status.constant.js";

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // joi에서 에러가 발생했다? 여기서 처리
  // joi에서 발생한 에러 처리
  if (err.name === "ValidationError") {
    return res.status(HTTP_STATUS.Bad_Request).json({
      status: HTTP_STATUS.Bad_Request,
      message: err.message,
    });
  }

  // 근데 service에서 에러가 발생했다? 여기
  // http Error이라고 받고 에러 처리한다.
  if (err.status && err.message) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message,
    });
  }

  // 그 밖의 예상치 못한 에러 처리
  return res.status(HTTP_STATUS.Internal_Server_Error).json({
    status: HTTP_STATUS.Internal_Server_Error,
    message: "예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.",
  });
};
