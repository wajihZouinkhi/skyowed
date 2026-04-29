import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
  });
  return ratelimit;
}

export async function limit(ip: string, key: string): Promise<boolean> {
  const rl = getRatelimit();
  if (!rl) return true; // no-op when Upstash not configured
  const { success } = await rl.limit(`${key}:${ip}`);
  return success;
}
