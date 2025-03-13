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

  // 🔎 **토큰이 정상적으로 API 요청에 포함되는지 확인**
  console.log(`📝 API 요청: GET /resumes, 사용 토큰: ${headers.Authorization}`);

  sleep(1);

  // ✅ GET /resumes 호출 (이력서 목록 조회)
  let getResumes = http.get(`${BASE_URL}/resumes/`, { headers });

  check(getResumes, {
    "GET /resumes status is 200": (r) => r.status === 200,
  });

  if (getResumes.status !== 200) {
    console.error(
      `❌ 이력서 목록 조회 실패! user${randomUserId}@example.com, 응답: ${getResumes.body}`
    );
  }

  sleep(1);
}
