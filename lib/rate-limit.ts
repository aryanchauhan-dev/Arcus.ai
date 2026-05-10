import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export const signinLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});

export const ipLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "15 m"),
});

export const signupLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});