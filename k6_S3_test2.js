import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  stages: [{ duration: "10m", target: 50 }],
};

export default function () {
  const BASE_URL = "https://api.solo-resume-project.shop/api";

  // ✅ 1~625 사이의 랜덤 유저 선택
  const randomUserId = Math.floor(Math.random() * 625) + 1;

  // ✅ 로그인 요청
  let loginRes = http.post(
    `${BASE_URL}/auth/sign-in`,
    JSON.stringify({
      email: `user${randomUserId}@example.com`,
      password: "test1234",
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  let loginSuccess = check(loginRes, {
    "POST /auth/sign-in status is 200": (r) => r.status === 200,
  });

  if (!loginSuccess) {
    console.error(
      `❌ 로그인 실패! user${randomUserId}@example.com, 응답: ${loginRes.body}`
    );
    return;
  }

  // 🔎 **로그인 응답 확인 (토큰 필드 확인)**
  console.log(
    `🔑 로그인 성공! user${randomUserId}@example.com, 응답: ${loginRes.body}`
  );

  let token;
  try {
    token = JSON.parse(loginRes.body).data.accessToken; // ✅ 올바른 필드명으로 수정
  } catch (error) {
    console.error(
      `❌ 토큰 파싱 오류! user${randomUserId}@example.com, 응답: ${loginRes.body}`
    );
    return;
  }

  let headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  sleep(1);

  // ✅ **GET /users/me 호출 (내 정보 조회)**
  let myInfoRes = http.get(`${BASE_URL}/users/me`, { headers });

  check(myInfoRes, {
    "GET /users/me status is 200": (r) => r.status === 200,
  });

  if (myInfoRes.status !== 200) {
    console.error(
      `❌ 내 정보 조회 실패! user${randomUserId}@example.com, 응답: ${myInfoRes.body}`
    );
  } else {
    console.log(
      `✅ 내 정보 조회 성공! user${randomUserId}@example.com, 응답: ${myInfoRes.body}`
    );
  }

  sleep(1);
}
