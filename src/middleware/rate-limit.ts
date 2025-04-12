const WINDOW_MS = 15 * 60 * 1000; 
const MAX_REQUESTS = 100;
const IP_STORE = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(ip: string): { limited: boolean; remaining: number } {
  const now = Date.now();
  
  if (!IP_STORE.has(ip)) {
    IP_STORE.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return { limited: false, remaining: MAX_REQUESTS - 1 };
  }
  
  const record = IP_STORE.get(ip)!;
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + WINDOW_MS;
    return { limited: false, remaining: MAX_REQUESTS - 1 };
  }
  
  if (record.count >= MAX_REQUESTS) {
    return { limited: true, remaining: 0 };
  }
  
  record.count += 1;
  return { limited: false, remaining: MAX_REQUESTS - record.count };
}

export function clearExpiredRateLimits() {
  const now = Date.now();
  
  for (const [ip, record] of IP_STORE.entries()) {
    if (now > record.resetTime) {
      IP_STORE.delete(ip);
    }
  }
}

setInterval(clearExpiredRateLimits, 60000); 