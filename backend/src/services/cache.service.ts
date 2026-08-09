import Redis from 'ioredis';

interface MemoryCacheEntry {
  value: string;
  expiresAt: number;
}

export class CacheService {
  private static redis: Redis | null = null;
  private static isRedisConnected = false;
  private static memoryCache = new Map<string, MemoryCacheEntry>();

  public static init() {
    try {
      this.redis = new Redis({
        host: process.env['REDIS_HOST'] || '127.0.0.1',
        port: Number(process.env['REDIS_PORT']) || 6379,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false
      });

      this.redis.on('connect', () => {
        this.isRedisConnected = true;
        console.log('✅ Connected to Redis cache on port 6379');
      });

      this.redis.on('error', () => {
        if (this.isRedisConnected) {
          console.warn('⚠️ Redis disconnected, falling back to memory cache.');
        }
        this.isRedisConnected = false;
      });

      this.redis.connect().catch(() => {
        this.isRedisConnected = false;
        console.log('ℹ️ Redis server not detected locally. Using in-memory TTL caching.');
      });
    } catch {
      this.isRedisConnected = false;
    }
  }

  public static async get(key: string): Promise<string | null> {
    if (this.isRedisConnected && this.redis) {
      try {
        return await this.redis.get(key);
      } catch {
        // Fall back to memory
      }
    }

    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return entry.value;
  }

  public static async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.set(key, value, 'EX', ttlSeconds);
        return;
      } catch {
        // Fall back to memory
      }
    }

    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  public static async del(keyPattern: string): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        const keys = await this.redis.keys(keyPattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch {
        // Fall back
      }
    }

    // In-memory key cleanup
    for (const key of this.memoryCache.keys()) {
      if (key.includes(keyPattern.replace('*', ''))) {
        this.memoryCache.delete(key);
      }
    }
  }
}

// Auto-initialize on module load
CacheService.init();
