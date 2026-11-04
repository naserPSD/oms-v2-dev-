// src/common/request-context.ts
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { createNamespace, Namespace } from 'cls-hooked';

const REQUEST_CONTEXT_NAMESPACE = 'REQUEST_CONTEXT';

@Injectable({ scope: Scope.REQUEST })
export class RequestContext {
  private request: Request;
  private userId: number;
  private ipAddress: number;

  private static namespace: Namespace = createNamespace(
    REQUEST_CONTEXT_NAMESPACE,
  );

  static run(callback: (...args: any[]) => void) {
    this.namespace.run(() => callback());
  }

  static set(key: string, value: any) {
    this.namespace.set(key, value);
  }

  static get<T>(key: string) {
    return this.namespace.get(key);
  }

  // static getUserId(): number | null {
  //   return this.get<number>('userId') ?? null;
  // }

  static getClientIpAddress(): string | null {
    return this.get<string>('ip') ?? null;
  }

  static getUrl(): string | null {
    return this.get<string>('url') ?? null;
  }

  static getMethod(): string | null {
    return this.get<string>('method') ?? null;
  }

  constructor(@Inject(REQUEST) request: Request) {
    this.request = request;
  }

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

  setRequest(request: Request): void {
    this.request = request;
  }

  getRequest(): Request {
    return this.request;
  }

  setUserId(userId: number): void {
    this.userId = userId;
  }

  getUserId(): number {
    return this.userId;
  }

  /**
   * Get the client IP address
   * Handles proxies using x-forwarded-for
   */
  getClientIpAddress(): string | null {
    if (!this.request) return null;

    const xForwardedFor = this.request.headers['x-forwarded-for'];
    if (xForwardedFor) {
      // x-forwarded-for can be comma-separated list; first is client IP
      return Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : xForwardedFor.split(',')[0].trim();
    }

    // fallback to socket remote address
    return this.request.socket?.remoteAddress || null;
  }
}
