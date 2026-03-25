import { cookies } from "next/headers";
import { verifyAccessToken } from "./jwt";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) return null;

    const user = verifyAccessToken(token);
    return user; // returns { id, email } or null if token is invalid/expired
  } catch {
    return null;
  }
}