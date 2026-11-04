// src/common/request-context.module.ts
import { Global, Module } from '@nestjs/common';
import { RequestContext } from './request-context';
import { HttpRequestResponseUtils } from './utils/http-request-response.utils';

@Global()
@Module({
  providers: [RequestContext, HttpRequestResponseUtils],
  exports: [RequestContext, HttpRequestResponseUtils],
})
export class RequestContextModule {}
