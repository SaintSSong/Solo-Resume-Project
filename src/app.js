import express from "express";
import { SERVER_PORT } from "./constant/env.constant.js";

const app = express();

// express에서 json 파일을 읽기 위해서 사용
app.use(express.json());

// express에서 url링크를 읽을 수있도록 허용
app.use(express.urlencoded({ extended: true }));

// 서버가 건강하게 살아있는지 확인하는 get 함수
app.get("/health-check", (req, res) => {
  return res.status(200).send("서버가 건강하게 잘 살아있습니다.");
});

app.listen(3000, () => {
  console.log(`3000번 포트로 연결 되었습니다.`);
});
