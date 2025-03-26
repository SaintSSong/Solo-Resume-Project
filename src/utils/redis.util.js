import Redis from "ioredis";

export const invalidateResumesCache = async () => {
  try {
    const keys = await redis.keys("resumes:admin:*");
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log("🧹 관리자 이력서 목록 캐시 삭제됨");
    }
  } catch (error) {
    console.error("❌ 캐시 무효화 중 오류 발생:", error);
  }
};

const redis = new Redis({ host: "127.0.0.1", port: 6379 });

export default redis;
