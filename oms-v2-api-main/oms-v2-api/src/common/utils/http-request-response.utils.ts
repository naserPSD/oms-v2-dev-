// src/common/utils/http-request-response.utils.ts
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class HttpRequestResponseUtils {
  private readonly IP_HEADER_CANDIDATES = [
    'X-Forwarded-For',
    'Proxy-Client-IP',
    'WL-Proxy-Client-IP',
    'HTTP_X_FORWARDED_FOR',
    'HTTP_X_FORWARDED',
    'HTTP_X_CLUSTER_CLIENT_IP',
    'HTTP_CLIENT_IP',
    'HTTP_FORWARDED_FOR',
    'HTTP_FORWARDED',
    'HTTP_VIA',
    'REMOTE_ADDR',
  ];

  getClientIpAddress(request: Request): string {
    for (const header of this.IP_HEADER_CANDIDATES) {
      const ipList = request.headers[header.toLowerCase()];
      if (
        ipList &&
        typeof ipList === 'string' &&
        ipList.length !== 0 &&
        !ipList.includes('unknown')
      ) {
        return ipList.split(',')[0].trim();
      }
    }
    return request.ip || '0.0.0.0';
  }

  getRequestUrl(request: Request): string {
    return request.url;
  }

  getRequestUri(request: Request): string {
    return request.path;
  }

  getRefererPage(request: Request): string {
    const referer = request.headers.referer || request.headers.referrer;
    if (!referer) return '';

    if (Array.isArray(referer)) {
      return referer[0];
    }
    return referer;
  }

  getRequestMethod(request: Request): string {
    return request.method;
  }

  getRequestData(request: Request): any {
    return request.body;
  }
}
