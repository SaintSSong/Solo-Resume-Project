import { S3 } from "@aws-sdk/client-s3";
import pkg from "@aws-sdk/types";
const { Request } = pkg; // `Request`를 default import로 가져옵니다.

const s3 = new S3({
  region: "your-region", // 실제 리전으로 설정
});

const bucketName = "your-s3-bucket-name"; // 실제 S3 버킷 이름으로 변경

export class FileController {
  // 이미지 조회
  getImage = async (req, res, next) => {
    try {
      const { filename } = req.params;

      const params = {
        Bucket: bucketName,
        Key: `uploads/${filename}`, // S3에 저장된 경로에 맞게 설정
      };

      // getObject API 호출
      const data = await s3.getObject(params);

      // Content-Type 설정 후 이미지 반환
      res.setHeader("Content-Type", data.ContentType);
      res.send(data.Body); // 이미지 데이터를 클라이언트로 전송
    } catch (error) {
      next(error); // 에러 처리
    }
  };
}
