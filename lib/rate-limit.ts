import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// 🔥 Sliding window → best for auth security
export const signinLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});

export const signupLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});