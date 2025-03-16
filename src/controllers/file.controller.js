// 1) AWS SDK에서 S3 기능을 가져옵니다.
import { S3 } from "@aws-sdk/client-s3";

// 2) FileController라는 클래스를 만들어요.
export class FileController {
  // (1) 생성자: 클래스를 만들 때 자동으로 실행되는 함수예요.
  constructor() {
    // AWS S3에 연결하기 위한 설정을 합니다.
    // region: 실제 사용 중인 리전(지역)을 적어주세요.
    this.s3 = new S3({
      region: "ap-northeast-2", // 예: 서울 리전이면 "ap-northeast-2"
    });

    // 우리가 사용할 S3 버킷 이름을 저장해둡니다.
    // 실제로 존재하는 버킷 이름으로 바꿔주세요.
    this.bucketName = "solo-resume-project-s3-static-files";
  }

  // (2) 이미지를 가져오는 메서드
  //     예: /uploads/:filename 으로 요청이 들어오면 이 함수가 실행된다고 가정해요.
  getImage = async (req, res, next) => {
    try {
      // 요청으로부터 파일 이름을 꺼내옵니다.
      // 예: /uploads/cat.jpg → filename = "cat.jpg"
      const { filename } = req.params;

      // S3에서 해당 파일을 찾기 위해 필요한 정보를 설정해요.
      // Key: S3 안에서 파일이 위치한 경로예요. (여기서는 uploads 폴더 아래)
      const params = {
        Bucket: this.bucketName,
        Key: `uploads/${filename}`,
      };

      // (3) S3에서 실제 파일을 가져옵니다.
      //     data 안에 파일의 내용, 타입 등이 들어있어요.
      const data = await this.s3.getObject(params);

      // (4) 가져온 파일의 ContentType(이미지 형식 등)을 응답 헤더에 설정해줍니다.
      //     이렇게 해야 브라우저가 "이건 이미지구나" 하고 제대로 보여줘요.
      res.setHeader(
        "Content-Type",
        data.ContentType || "application/octet-stream"
      );

      // (5) 실제 파일 데이터를 클라이언트(사용자)에게 전송합니다.
      //     data.Body에 파일 내용(이미지)이 들어있어요.
      data.Body.pipe(res);
    } catch (error) {
      console.error(error);
      // (6) 만약 오류가 나면, 에러 처리 미들웨어로 넘겨줘서
      //     에러 메시지를 적절히 표시하거나 로깅할 수 있게 해요.
      next(error);
    }
  };
}
