import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly memoryCache = new Map<string, { value: any; expiry: number | null }>();

  constructor(@InjectRedis() private readonly redis: Redis) {}

  private isRedisReady(): boolean {
    return !!(this.redis && this.redis.status === 'ready');
  }

  // store JSON-aware
  async set(key: string, value: any, ttlSeconds?: number) {
    const payload = typeof value === 'string' ? value : JSON.stringify(value);

    // Always store in memory cache for instantaneous zero-latency reads
    const expiry = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryCache.set(key, { value, expiry });

    if (this.isRedisReady()) {
      try {
        if (ttlSeconds && ttlSeconds > 0) {
          await this.redis.set(key, payload, 'EX', ttlSeconds);
        } else {
          await this.redis.set(key, payload);
        }
      } catch (error) {
        // Allow app to continue with memory cache
      }
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (this.isRedisReady()) {
      try {
        const val = await this.redis.get(key);
        if (val) {
          try {
            return JSON.parse(val) as T;
          } catch {
            return val as any as T;
          }
        }
      } catch {
        // Fall back to memory
      }
    }

    // Instantaneous in-memory lookup
    const cached = this.memoryCache.get(key);
    if (!cached) return null;
    if (cached.expiry && Date.now() > cached.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    return cached.value as T;
  }

  async del(key: string): Promise<number> {
    this.memoryCache.delete(key);
    if (this.isRedisReady()) {
      try {
        return await this.redis.del(key);
      } catch {
        return 0;
      }
    }
    return 1;
  }

  async exists(key: string): Promise<boolean> {
    const cached = this.memoryCache.get(key);
    if (cached) {
      if (!cached.expiry || Date.now() <= cached.expiry) return true;
      this.memoryCache.delete(key);
    }
    if (this.isRedisReady()) {
      try {
        return (await this.redis.exists(key)) === 1;
      } catch {
        return false;
      }
    }
    return false;
  }

  async ttl(key: string): Promise<number> {
    if (this.isRedisReady()) {
      try {
        return await this.redis.ttl(key);
      } catch {
        return -1;
      }
    }
    const cached = this.memoryCache.get(key);
    if (!cached || !cached.expiry) return -1;
    return Math.max(0, Math.floor((cached.expiry - Date.now()) / 1000));
  }

  async incr(key: string): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const next = Number(current) + 1;
    await this.set(key, next);
    return next;
  }

  // lightweight publish (returns number of clients that received it)
  async publish(channel: string, message: string): Promise<number> {
    if (this.isRedisReady()) {
      try {
        return await this.redis.publish(channel, message);
      } catch {
        return 0;
      }
    }
    return 0;
  }

  // subscribe - returns a duplicated client. caller should manage lifetime.
  async subscribe(
    channel: string,
    onMessage: (msg: string, ch: string) => void,
  ) {
    if (this.isRedisReady()) {
      try {
        const sub = this.redis.duplicate();
        if ((sub as any).connect) {
          await (sub as any).connect();
        }
        await (sub as any).subscribe(channel, (message: string) => {
          onMessage(message, channel);
        });
        return sub;
      } catch {
        return null;
      }
    }
    return null;
  }

  async acquireLock(key: string, ttl = 60000): Promise<boolean> {
    if (this.isRedisReady()) {
      try {
        const result = await this.redis.set(key, 'locked', 'PX', ttl, 'NX');
        return result === 'OK';
      } catch {
        // Fall back to memory lock
      }
    }
    const existing = this.memoryCache.get(`lock:${key}`);
    if (existing && (!existing.expiry || Date.now() <= existing.expiry)) {
      return false;
    }
    this.memoryCache.set(`lock:${key}`, { value: 'locked', expiry: Date.now() + ttl });
    return true;
  }

  async releaseLock(key: string) {
    this.memoryCache.delete(`lock:${key}`);
    if (this.isRedisReady()) {
      try {
        await this.redis.del(key);
      } catch {
        // ignore
      }
    }
  }
}
