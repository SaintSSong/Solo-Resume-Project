import express from "express";
import { SERVER_PORT } from "./constants/env.constant.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import { HTTP_STATUS } from "./constants/http-status.constant.js";
import apiRouter from "./routers/index.js";
import "./utils/prisma.util.js";

const app = express();

// express에서 json 파일을 읽기 위해서 사용
app.use(express.json());

// express에서 url링크를 읽을 수있도록 허용
app.use(express.urlencoded({ extended: true }));

console.log("여기는 들어오나?");

// 서버가 건강하게 살아있는지 확인하는 get 함수
app.get("/health-check", (req, res) => {
  // throw new Error("예상치 못한 에러"); <- errorHandler 실험용 check 완료
  return res.status(HTTP_STATUS.OK).send("서버가 건강하게 잘 살아있습니다.");
});

app.use("/api", apiRouter);

// errorHandler는 가장 밑단에 있어야지 코드의 마지막까지 가서 에러를 캐치한다.
app.use(errorHandler);

app.listen(SERVER_PORT, () => {
  console.log(`${SERVER_PORT}번 포트로 연결 되었습니다.`);
});
