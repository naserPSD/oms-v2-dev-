import { Controller, Get, Query } from '@nestjs/common';
import { CacheService } from './cache.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly cache: CacheService) {}

  @Get('set')
  async set(
    @Query('k') key: string,
    @Query('v') value: string,
    @Query('ttl') ttl?: string,
  ) {
    const ttlNum = ttl ? parseInt(ttl, 10) : undefined;
    await this.cache.set(key, value, ttlNum);
    return { ok: true, key, value, ttl: ttlNum ?? null };
  }

  @Get('get')
  async get(@Query('k') key: string) {
    const value = await this.cache.get(key);
    return { key, value };
  }

  @Get('del')
  async del(@Query('k') key: string) {
    const count = await this.cache.del(key);
    return { key, deleted: count };
  }
}
