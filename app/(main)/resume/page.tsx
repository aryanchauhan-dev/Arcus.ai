import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ResumePage() {
  // =======================
  // AUTH (SERVER SIDE)
  // =======================

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return (
      <div className="text-center mt-20 text-red-500">
        Unauthorized. Please login again.
      </div>
    );
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return (
      <div className="text-center mt-20 text-red-500">
        Session expired. Please login again.
      </div>
    );
  }

  // =======================
  // FETCH USER + RESUME
  // =======================

  const [user, resume] = await Promise.all([
    prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
      },
    }),
    getResume(),
  ]);

  if (!user) {
    return (
      <div className="text-center mt-20 text-red-500">
        User not found
      </div>
    );
  }

  // =======================
  // RENDER
  // =======================

  return (
    <div className="container mx-auto py-6">
      <ResumeBuilder
        initialContent={resume?.content || ""}
        user={user}
      />
    </div>
  );
}