import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import { AWS_ACCESS_KEY } from "../constants/env.constant.js";
import { AWS_SECRET_ACCESS_KEY } from "../constants/env.constant.js";
import { AWS_S3_BUCKET } from "../constants/env.constant.js";
import { CLOUDFRONT_URL } from "../constants/env.constant.js";

const s3 = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  region: "ap-northeast-2",
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE, // ✅ MIME 타입 자동 설정
    key: function (req, file, cb) {
      cb(null, `uploads/${Date.now()}-${file.originalname}`);
    },
    metadata: function (req, file, cb) {
      cb(null, { "Cache-Control": "max-age=86400" }); // ✅ 캐시 적용
    },
  }),
});

// ✅ 업로드된 파일의 URL을 CloudFront로 반환하도록 변경
const getS3FileUrl = (fileKey) => {
  return `${CLOUDFRONT_URL}/${fileKey}`;
};

// ✅ 미들웨어 수정: 응답 값에서 CloudFront URL 반환
const uploadSingle = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "파일 업로드 실패", error: err.message });
    }
    if (req.file) {
      req.file.location = getS3FileUrl(req.file.key); // ✅ CloudFront URL 적용
    }
    next();
  });
};

// ✅ 미들웨어로 사용하기 위해 `export`
export { uploadSingle };
