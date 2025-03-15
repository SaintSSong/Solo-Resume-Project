// s3.middleware.js (예시 파일)
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import stream from "stream";
import {
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET,
  CLOUDFRONT_URL,
} from "../constants/env.constant.js";

// ============ 1. S3 Client 생성 ============
const s3 = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// ============ 2. 업로드용 미들웨어 (multer) ============
const upload = multer({
  storage: multerS3({
    s3,
    bucket: AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, `uploads/${Date.now()}-${file.originalname}`);
    },
    metadata: function (req, file, cb) {
      // 캐시 적용
      cb(null, { "Cache-Control": "max-age=86400" });
    },
  }),
});

// 업로드 후 반환되는 URL을 CloudFront로 변경하는 헬퍼 함수
function getS3FileUrl(fileKey) {
  return `${CLOUDFRONT_URL}/${fileKey}`;
}

// ============ 2-1. 업로드 Single 미들웨어 ============
export function uploadSingle(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "파일 업로드 실패", error: err.message });
    }
    if (req.file) {
      // 업로드된 파일의 S3 key
      const fileKey = req.file.key; // e.g. "uploads/123123-cat.jpg"
      // CloudFront URL로 치환
      req.file.location = getS3FileUrl(fileKey);
    }
    next();
  });
}

// ============ 3. S3 파일 프록시 (다운로드) 로직 ============
// GET /uploads/:filename 로 들어오는 요청에 대해 S3에서 파일 받아서 반환
export async function getS3Image(req, res) {
  try {
    const { filename } = req.params; // e.g. "1742031531570-cat.jpg"
    const command = new GetObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: `uploads/${filename}`, // S3 내부 경로
    });

    const data = await s3.send(command);

    // 응답 헤더 설정
    res.setHeader(
      "Content-Type",
      data.ContentType || "application/octet-stream"
    );
    res.setHeader("Cache-Control", "max-age=86400");

    // S3에서 받은 Body(ReadableStream)를 파이프로 넘겨줌
    const passThrough = new stream.PassThrough();
    data.Body.pipe(passThrough).pipe(res);
  } catch (err) {
    console.error("S3 이미지 불러오기 실패:", err);
    return res.status(404).json({ message: "이미지를 불러오지 못했습니다." });
  }
}
