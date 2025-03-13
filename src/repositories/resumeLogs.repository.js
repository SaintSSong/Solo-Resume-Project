export class ResumeLogsRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // 트랜잭션 전용
  createResumeLogWithTx = async ({
    recruiterId,
    resumeId,
    oldStatus,
    newStatus,
    reason,
    tx,
  }) => {
    const data = await tx.resumeLog.create({
      data: { recruiterId, resumeId, oldStatus, newStatus, reason },
    });

    return data;
  };
  // 트랜잭션 전용 끝

  // 이력서 ID를 활용한 로그 조회
  findResumeLogsByResumeId = async (resumeId) => {
    let data = await this.prisma.resumeLog.findMany({
      where: { resumeId: +resumeId },
      orderBy: {
        createdAt: "desc",
      },
      include: { recruiter: true },
    });

    return data;
  };
}
