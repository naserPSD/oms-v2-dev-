import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { google } from 'googleapis';
import { Repository } from 'typeorm';
import { UserGoogleToken } from './entities/user-google-token.entity';
import googleMeetConfig from '@config/google-meet.config';

const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

const CALENDAR_API_ENABLE_BASE =
  'https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview';

function googleHttpError(
  status: HttpStatus,
  message: string,
  code: string,
  extra: Record<string, unknown> = {},
): HttpException {
  return new HttpException(
    { statusCode: status, message, code, ...extra },
    status,
  );
}

function isCalendarApiDisabledMessage(msg: string): boolean {
  return /has not been used in project|is disabled|accessNotConfigured|Calendar API/i.test(
    msg,
  );
}

@Injectable()
export class GoogleCalendarService {
  constructor(
    @Inject(googleMeetConfig.KEY)
    private readonly config: ConfigType<typeof googleMeetConfig>,
    @InjectRepository(UserGoogleToken)
    private readonly tokenRepo: Repository<UserGoogleToken>,
  ) {}

  private createOAuthClient() {
    return new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.callbackUrl,
    );
  }

  buildConnectUrl(userId: number): string {
    if (!userId) {
      throw new BadRequestException(
        'Cannot start Google Calendar connect without a logged-in user',
      );
    }
    const client = this.createOAuthClient();
    const state = Buffer.from(
      JSON.stringify({ userId: Number(userId) }),
    ).toString('base64url');
    return client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: true,
      scope: CALENDAR_SCOPES,
      state,
    });
  }

  async handleOAuthCallback(code: string, state: string): Promise<number> {
    let userId: number;
    try {
      const parsed = JSON.parse(
        Buffer.from(state, 'base64url').toString('utf8'),
      );
      userId = Number(parsed.userId);
      if (!userId) throw new Error('invalid user');
    } catch {
      throw new BadRequestException('Invalid OAuth state');
    }

    const client = this.createOAuthClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token && !tokens.access_token) {
      throw new BadRequestException('Google did not return tokens');
    }

    let record = await this.tokenRepo.findOne({ where: { userId } });
    if (!record) {
      record = this.tokenRepo.create({ userId });
    }
    record.accessToken = tokens.access_token ?? record.accessToken;
    if (tokens.refresh_token) {
      record.refreshToken = tokens.refresh_token;
    }
    record.tokenExpiry = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : null;
    record.scope = tokens.scope ?? CALENDAR_SCOPES.join(' ');
    await this.tokenRepo.save(record);
    return userId;
  }

  private getCalendarApiEnableUrl(): string {
    const clientId = this.config.clientId || '';
    const projectNumber = clientId.split('-')[0];
    if (projectNumber && /^\d+$/.test(projectNumber)) {
      return `${CALENDAR_API_ENABLE_BASE}?project=${projectNumber}`;
    }
    return CALENDAR_API_ENABLE_BASE;
  }

  async isConnected(userId: number): Promise<boolean> {
    const token = await this.tokenRepo.findOne({ where: { userId } });
    return Boolean(token?.refreshToken || token?.accessToken);
  }

  /** Token saved + live Calendar API probe (detects disabled API vs auth failure). */
  async getConnectionStatus(userId: number): Promise<{
    connected: boolean;
    needsReconnect?: boolean;
    calendarApiReady: boolean;
    enableApiUrl: string | null;
    detail: string | null;
  }> {
    const enableApiUrl = this.getCalendarApiEnableUrl();
    const hasToken = await this.isConnected(userId);
    if (!hasToken) {
      return {
        connected: false,
        needsReconnect: false,
        calendarApiReady: false,
        enableApiUrl,
        detail: null,
      };
    }

    try {
      const auth = await this.getAuthorizedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth });
      await calendar.calendarList.list({ maxResults: 1 });
      return {
        connected: true,
        needsReconnect: false,
        calendarApiReady: true,
        enableApiUrl: null,
        detail: null,
      };
    } catch (err: any) {
      const gMsg =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Google Calendar check failed';
      const status = err?.response?.status;
      const isAuthError =
        status === 401 ||
        /invalid_grant|invalid authentication credentials|Expected OAuth 2|unauthorized/i.test(
          gMsg,
        );

      if (isAuthError) {
        return {
          connected: false,
          needsReconnect: true,
          calendarApiReady: false,
          enableApiUrl: null,
          detail:
            'Google session expired or invalid credentials. Please reconnect Google Calendar.',
        };
      }

      if (isCalendarApiDisabledMessage(gMsg) || status === 403) {
        return {
          connected: true,
          needsReconnect: false,
          calendarApiReady: false,
          enableApiUrl,
          detail: gMsg,
        };
      }

      return {
        connected: false,
        needsReconnect: true,
        calendarApiReady: false,
        enableApiUrl,
        detail: gMsg,
      };
    }
  }

  private async getAuthorizedClient(userId: number) {
    const token = await this.tokenRepo.findOne({ where: { userId } });
    if (!token?.refreshToken && !token?.accessToken) {
      throw googleHttpError(
        HttpStatus.BAD_REQUEST,
        'Connect Google Calendar first to create real Meet links.',
        'GOOGLE_CALENDAR_NOT_CONNECTED',
      );
    }

    const client = this.createOAuthClient();
    client.setCredentials({
      access_token: token.accessToken ?? undefined,
      refresh_token: token.refreshToken ?? undefined,
      expiry_date: token.tokenExpiry?.getTime(),
    });

    client.on('tokens', async (tokens) => {
      if (tokens.access_token) token.accessToken = tokens.access_token;
      if (tokens.refresh_token) token.refreshToken = tokens.refresh_token;
      if (tokens.expiry_date) token.tokenExpiry = new Date(tokens.expiry_date);
      await this.tokenRepo.save(token);
    });

    // Force refresh when access token is missing/expired so Meet insert does not fail silently
    try {
      const access = await client.getAccessToken();
      if (!access?.token) {
        throw new Error('No access token');
      }
    } catch {
      throw googleHttpError(
        HttpStatus.BAD_REQUEST,
        'Google Calendar token expired or revoked. Reconnect Google Calendar.',
        'GOOGLE_CALENDAR_NOT_CONNECTED',
      );
    }

    return client;
  }

  /** Wall-clock local datetime for Google Calendar (no trailing Z). */
  private formatWallClock(date: Date, timeZone: string): string {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? '00';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
  }

  async createMeetEvent(params: {
    userId: number;
    title: string;
    description?: string;
    startAt: Date;
    endAt: Date;
    attendeeEmails?: string[];
    timeZone?: string;
  }): Promise<{ meetUrl: string; googleEventId: string }> {
    const timeZone = params.timeZone ?? 'Asia/Dhaka';
    const auth = await this.getAuthorizedClient(params.userId);
    const calendar = google.calendar({ version: 'v3', auth });
    const requestId = `oms-meet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    let event;
    try {
      event = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        sendUpdates: 'none',
        requestBody: {
          summary: params.title,
          description: params.description,
          start: {
            dateTime: this.formatWallClock(params.startAt, timeZone),
            timeZone,
          },
          end: {
            dateTime: this.formatWallClock(params.endAt, timeZone),
            timeZone,
          },
          attendees: (params.attendeeEmails ?? [])
            .filter(Boolean)
            .map((email) => ({ email })),
          conferenceData: {
            createRequest: {
              requestId,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        },
      });
    } catch (err: any) {
      const gMsg =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Google Calendar API error';
      const enableApiUrl = this.getCalendarApiEnableUrl();
      if (isCalendarApiDisabledMessage(gMsg)) {
        throw googleHttpError(
          HttpStatus.BAD_REQUEST,
          'Google Calendar API is disabled for this Cloud project. Enable it, wait 1–2 minutes, then create the meeting again.',
          'GOOGLE_CALENDAR_API_DISABLED',
          { enableApiUrl },
        );
      }
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        throw googleHttpError(
          HttpStatus.BAD_REQUEST,
          `${gMsg}. Enable Google Calendar API in Cloud Console, then reconnect.`,
          'GOOGLE_CALENDAR_NOT_CONNECTED',
          { enableApiUrl },
        );
      }
      throw googleHttpError(
        HttpStatus.BAD_REQUEST,
        gMsg,
        'GOOGLE_MEET_CREATE_FAILED',
        { enableApiUrl },
      );
    }

    const createStatus =
      event.data.conferenceData?.createRequest?.status?.statusCode;
    if (createStatus && createStatus !== 'success') {
      throw googleHttpError(
        HttpStatus.BAD_REQUEST,
        `Google Meet create failed (${createStatus}). Use a Google account that can create Meet links, and enable Google Calendar API.`,
        'GOOGLE_MEET_CREATE_FAILED',
      );
    }

    const meetUrl =
      event.data.hangoutLink ??
      event.data.conferenceData?.entryPoints?.find(
        (e) => e.entryPointType === 'video',
      )?.uri ??
      null;

    if (!meetUrl || !event.data.id) {
      throw googleHttpError(
        HttpStatus.BAD_REQUEST,
        'Google Calendar created the event but returned no Meet link. Enable Google Calendar API + Meet for this Google account.',
        'GOOGLE_MEET_CREATE_FAILED',
      );
    }

    return { meetUrl, googleEventId: event.data.id };
  }
}
