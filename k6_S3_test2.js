import http from "k6/http";
import { sleep, check } from "k6";

// ✅ 부하 테스트 설정 (10분 동안 50명의 유저)
export const options = {
  stages: [{ duration: "10m", target: 50 }],
};

// ✅ 50명의 유저를 미리 정의
const USERS = Array.from({ length: 50 }, (_, i) => ({
  email: `user${i + 1}@example.com`,
  password: "test1234",
}));

export default function () {
  const BASE_URL = "https://api.solo-resume-project.shop/api";

  // ✅ 50명 중 한 명을 랜덤하게 선택
  const user = USERS[Math.floor(Math.random() * USERS.length)];

  // ✅ 로그인 요청
  let loginRes = http.post(
    `${BASE_URL}/auth/sign-in`,
    JSON.stringify({
      email: user.email,
      password: user.password,
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  // ✅ 로그인 성공 여부 확인
  let loginSuccess = check(loginRes, {
    "POST /auth/sign-in status is 200": (r) => r.status === 200,
  });

  if (!loginSuccess) {
    console.error(`❌ 로그인 실패! ${user.email}, 응답: ${loginRes.body}`);
    return;
  }

  let token;
  try {
    token = JSON.parse(loginRes.body).data.accessToken;
  } catch (error) {
    console.error(`❌ 토큰 파싱 오류! 응답: ${loginRes.body}`);
    return;
  }

  let headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  sleep(1); // 💡 요청 간격을 두기 위해 1초 대기

  // ✅ **내 정보 조회 (CDN 캐싱 확인 가능)**
  let myInfoRes = http.get(`${BASE_URL}/users/me`, { headers });

  check(myInfoRes, {
    "GET /users/me status is 200": (r) => r.status === 200,
  });

  if (myInfoRes.status !== 200) {
    console.error(
      `❌ 내 정보 조회 실패! ${user.email}, 응답: ${myInfoRes.body}`
    );
  } else {
    console.log(`✅ 내 정보 조회 성공! ${user.email}`);
  }

  sleep(1);
}
