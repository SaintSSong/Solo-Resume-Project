import { prisma } from "../utils/prisma.util.js";

export class ResumeLogsRepository {
  // 트랜잭션 전용

  createResumeLogWithTx = async ({
    recruiterId,
    resumeId,
    oldStatus,
    newStatus,
    reason,
    tx,
  }) => {
    console.log("되나?????????????");
    const data = await tx.resumeLog.create({
      data: { recruiterId, resumeId, oldStatus, newStatus, reason },
    });

    return data;
  };
  // 트랜잭션 전용 끝
  //

  findResumeLogsByResumeId = async (resumeId) => {
    let data = await prisma.resumeLog.findMany({
      where: { resumeId: +resumeId },
      orderBy: {
        createdAt: "desc",
      },
      include: { recruiter: true },
    });

    return data;
  };
}
