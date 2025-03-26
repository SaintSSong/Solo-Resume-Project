import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  discardResponseBodies: true,
  // 10분 동안 점진적으로 늘려서 최종 50명 동시 사용자(VU) 도달
  stages: [
    // 1단계: 0명 → 20명까지 10분 걸쳐 상승
    { duration: "10m", target: 20 },
  ],
};

// 테스트할 이미지 파일 목록 (S3에 실제로 존재해야 함)
const IMAGE_FILES = [
  "1742147596597-1 (1).jpg",
  "1742147603054-1 (2).jpg",
  "1742147610998-1 (3).jpg",
  "1742147617549-1 (4).jpg",
  "1742147623787-1 (5).jpg",
  "1742147631417-1 (6).jpg",
  "1742147636254-1 (7).jpg",
  "1742147640956-1 (8).jpg",
  "1742147646237-1 (9).jpg",
  "1742147651746-1 (10).jpg",
];

// CDN 주소 (커스텀 도메인)
const CDN_BASE_URL = "https://cdn.solo-resume-project.shop/api/uploads";
// const S3_BASE_URL =
//   "https://solo-resume-project-s3-static-files.s3.ap-northeast-2.amazonaws.com/uploads";

export default function () {
  // 1) 랜덤 이미지 파일 선택
  const randomImage =
    IMAGE_FILES[Math.floor(Math.random() * IMAGE_FILES.length)];

  // 2) 이미지 GET 요청
  const res = http.get(`${CDN_BASE_URL}/${randomImage}`);

  // 3) 응답 상태(200) 확인
  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  // // 4) 콘솔에 요청 시간(duration) 출력 (ms 단위)
  // console.log(
  //   `GET ${randomImage} → status: ${res.status}, duration: ${res.timings.duration} ms`
  // );

  // 4) 만약 응답 시간이 4초(4000ms) 이상이면, 그때만 콘솔에 로그 남기기
  if (res.timings.duration > 4000) {
    console.log(
      `GET ${randomImage} → status: ${res.status}, duration: ${res.timings.duration} ms`
    );
  }

  // 5) 요청 간격을 위해 1초 대기
  sleep(1);
}
