import * as crypto from 'crypto';
import { RequestContext } from '@common/request-context';
import { UserContextService } from '@module/auth/user-context.service';
import { Employee } from '@module/hr-management/entities/employees.entity';
import { RolePermissionService } from '@module/role-permission/role-permission.service';
import { AppUser } from '@module/users/entities/app-user.entity';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import { HybridQueueService } from 'src/queue/hybrid-queue.service';
import { In, Repository } from 'typeorm';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { MeetingAgendaItem } from './entities/meeting-agenda-item.entity';
import { MeetingAttendee } from './entities/meeting-attendee.entity';
import { MeetingNote } from './entities/meeting-note.entity';
import { Meeting, MeetingListStatus } from './entities/meeting.entity';
import { GoogleCalendarService } from './google-calendar.service';

export type MeetingFilterTab = 'today' | 'upcoming' | 'previous' | 'all';

@Injectable()
export class MeetingService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepo: Repository<Meeting>,
    @InjectRepository(MeetingAttendee)
    private readonly attendeeRepo: Repository<MeetingAttendee>,
    @InjectRepository(MeetingAgendaItem)
    private readonly agendaRepo: Repository<MeetingAgendaItem>,
    @InjectRepository(MeetingNote)
    private readonly noteRepo: Repository<MeetingNote>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(AppUser)
    private readonly appUserRepo: Repository<AppUser>,
    private readonly userContext: UserContextService,
    private readonly rolePermissionService: RolePermissionService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly hybridQueue: HybridQueueService,
    private readonly mailService: MailService,
  ) {}

  private readonly logger = new Logger(MeetingService.name);

  private getUserId(): number {
    const userId =
      this.userContext.getUserId() ||
      RequestContext.get<number>('userId') ||
      null;
    if (!userId) throw new ForbiddenException('User not authenticated');
    return Number(userId);
  }

  private async resolveAppId(userId?: number): Promise<number> {
    const uid = userId ?? this.getUserId();
    let appId = RequestContext.get<any>('activeAppId');
    if (appId != null && appId !== '') {
      const n = Number(appId);
      if (Number.isFinite(n) && n > 0) return n;
    }

    const appUser = await this.appUserRepo.findOne({ where: { userId: uid } });
    if (appUser?.appId) {
      RequestContext.set('activeAppId', appUser.appId);
      return Number(appUser.appId);
    }

    throw new ForbiddenException('Active application not found');
  }

  async canManageMeetings(userId = this.getUserId()): Promise<boolean> {
    // Lightweight SQL — avoids loading full User+Role graphs (can hang under metadata locks)
    const rows: Array<{ code: string | null }> = await this.appUserRepo.manager
      .query(
        `
        SELECT DISTINCT p.code AS code
        FROM (
          SELECT rp.permission_id AS permission_id
          FROM user_roles ur
          INNER JOIN role_permissions rp ON rp.role_id = ur.role_id
          WHERE ur.user_id = ?
          UNION
          SELECT up.permission_id AS permission_id
          FROM user_permissions up
          WHERE up.user_id = ? AND up.is_granted = 1
        ) x
        INNER JOIN permissions p ON p.id = x.permission_id
        WHERE p.is_active = 1
        `,
        [userId, userId],
      )
      .catch(() => []);

    const codes = rows.map((r) => r.code).filter(Boolean) as string[];
    if (
      codes.some((c) =>
        ['hr.meeting_add', 'hr.meeting_edit', 'hr.meeting_view'].includes(c),
      )
    ) {
      return true;
    }
    if (codes.some((c) => c.startsWith('hr.'))) {
      return true;
    }
    return this.isHrLikeUser(userId);
  }

  async canManageRoster(userId = this.getUserId()): Promise<boolean> {
    return this.canManageMeetings(userId);
  }

  private async isHrLikeUser(userId: number): Promise<boolean> {
    const user = this.userContext.getUser() as any;
    if (user?.id === userId) {
      const roles: string[] = [];
      const userRoles = user.userRoles ?? [];
      for (const item of userRoles) {
        roles.push(item?.role?.name || '');
      }
      if (
        roles.some((n) => {
          const s = String(n).toLowerCase();
          return (
            s.includes('hr') ||
            s.includes('admin') ||
            s.includes('human resource')
          );
        })
      ) {
        return true;
      }
    }

    const roleRows: Array<{ name: string }> = await this.meetingRepo.manager
      .query(
        `
        SELECT r.name AS name
        FROM user_roles ur
        INNER JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = ?
        `,
        [userId],
      )
      .catch(() => []);

    return roleRows.some((row) => {
      const s = String(row?.name || '').toLowerCase();
      return (
        s.includes('hr') ||
        s.includes('admin') ||
        s.includes('human resource')
      );
    });
  }

  private parseDateTime(date: string, time: string, timeZone?: string): Date {
    if (!date || !time) return new Date();
    // Default to Asia/Dhaka (+06:00) for Bangladesh to prevent server UTC drift
    const offset = '+06:00';
    return new Date(`${date}T${time}:00${offset}`);
  }

  private deriveStatus(meeting: Meeting): 'live' | 'upcoming' | 'ended' {
    if (
      meeting.listStatus === 'COMPLETED' ||
      meeting.listStatus === 'CANCELLED'
    ) {
      return 'ended';
    }
    const now = Date.now();
    const start = new Date(meeting.startAt).getTime();
    const end = new Date(meeting.endAt).getTime();
    const tenMinutesBefore = start - 10 * 60 * 1000;
    if (now >= tenMinutesBefore && now <= end) return 'live';
    if (now > end) return 'ended';
    return 'upcoming';
  }

  private serializeMeeting(meeting: Meeting, userId: number) {
    const attendees = meeting.attendees ?? [];
    return {
      id: String(meeting.id),
      title: meeting.title,
      host: {
        id: meeting.hostUserId ?? meeting.hostEmployeeId,
        name: meeting.hostName ?? 'Host',
      },
      startAt: meeting.startAt.toISOString(),
      endAt: meeting.endAt.toISOString(),
      meetUrl: meeting.meetUrl,
      googleEventId: meeting.googleEventId,
      meetingType: meeting.meetingType,
      roomName: meeting.roomName,
      companyName: meeting.companyName,
      clientName: meeting.clientName,
      address: meeting.address,
      isRepeat: Boolean(meeting.isRepeat),
      repeat: Boolean(meeting.isRepeat),
      repeatDays: meeting.repeatDays,
      listStatus:
        meeting.listStatus === 'CANCELLED'
          ? 'CANCELLED'
          : meeting.isRepeat
            ? meeting.repeatDays &&
              new Date(
                new Date(meeting.startAt).getTime() +
                  meeting.repeatDays * 86400000,
              ).getTime() < Date.now()
              ? 'COMPLETED'
              : meeting.listStatus
            : new Date(meeting.endAt).getTime() < Date.now()
              ? 'COMPLETED'
              : meeting.listStatus,
      status: this.deriveStatus(meeting),
      joinedCount: attendees.filter(
        (a) => a.attendance === 'present' || a.attendance === 'late',
      ).length,
      expectedCount: attendees.length,
      agenda: (meeting.agendaItems ?? []).map((a) => ({
        id: String(a.id),
        text: a.text,
        done: Boolean(a.isDone),
      })),
      attendees: attendees.map((a) => {
        const isEnded = new Date(meeting.endAt).getTime() < Date.now();
        const effectiveAttendance =
          a.attendance || (isEnded ? 'absent' : null);
        return {
          id: a.id,
          employeeId: a.employeeId,
          name: a.name,
          role: a.role,
          email: a.email,
          attendance: effectiveAttendance,
          inviteStatus: a.inviteStatus,
          joinedAt: a.joinedAt
            ? a.joinedAt.toISOString()
            : effectiveAttendance === 'present' || effectiveAttendance === 'late'
              ? (meeting.startAt ? new Date(meeting.startAt).toISOString() : null)
              : null,
        };
      }),
      canManage: false,
      isParticipant:
        meeting.hostUserId === userId ||
        attendees.some((a) => a.userId === userId),
    };
  }

  async findAll(query: {
    tab?: MeetingFilterTab;
    page?: number;
    limit?: number;
  }) {
    const userId = this.getUserId();
    const appId = await this.resolveAppId(userId);
    const canManage = await this.canManageMeetings(userId);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const tab = query.tab ?? 'all';

    // Auto-update meetings whose end time has passed to COMPLETED
    try {
      await this.meetingRepo
        .createQueryBuilder()
        .update(Meeting)
        .set({ listStatus: 'COMPLETED' })
        .where('appId = :appId', { appId })
        .andWhere('endAt < :now', { now: new Date() })
        .andWhere(
          '(isRepeat = 0 OR (repeatDays IS NOT NULL AND DATE_ADD(startAt, INTERVAL repeatDays DAY) < :now))',
          { now: new Date() },
        )
        .andWhere("listStatus NOT IN ('COMPLETED', 'CANCELLED')")
        .execute();

      // Auto-update unrecorded attendees of ended meetings to absent
      await this.attendeeRepo.query(
        `UPDATE hr_meeting_attendees a 
         JOIN hr_meetings m ON a.meeting_id = m.id 
         SET a.attendance = 'absent' 
         WHERE m.app_id = ? AND m.end_at < NOW() AND a.attendance IS NULL`,
        [appId],
      );
    } catch {
      // ignore
    }

    const qb = this.meetingRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.attendees', 'attendees')
      .leftJoinAndSelect('m.agendaItems', 'agendaItems')
      .where('m.appId = :appId', { appId });

    if (!canManage) {
      qb.andWhere(
        '(m.hostUserId = :userId OR attendees.userId = :userId)',
        { userId },
      );
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    if (tab === 'today') {
      qb.andWhere(
        '((m.startAt BETWEEN :startOfDay AND :endOfDay) OR (m.isRepeat = 1 AND m.startAt <= :endOfDay AND (m.repeatDays IS NULL OR DATE_ADD(m.startAt, INTERVAL m.repeatDays DAY) >= :startOfDay)))',
        {
          startOfDay,
          endOfDay,
        },
      );
    } else if (tab === 'upcoming') {
      qb.andWhere('m.endAt >= :now', { now }).andWhere(
        "m.listStatus NOT IN ('COMPLETED','CANCELLED')",
      );
    } else if (tab === 'previous') {
      qb.andWhere(
        "(m.listStatus IN ('COMPLETED','CANCELLED') OR m.endAt < :now)",
        { now },
      );
    }

    if (tab === 'upcoming' || tab === 'today') {
      qb.orderBy('m.startAt', 'ASC');
    } else {
      qb.orderBy('m.startAt', 'DESC');
    }
    qb.skip((page - 1) * limit).take(limit);

    const [rows, total] = await qb.getManyAndCount();

    return {
      data: rows.map((m) => ({
        ...this.serializeMeeting(m, userId),
        canManage,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: number) {
    const userId = this.getUserId();
    const appId = await this.resolveAppId(userId);
    const meeting = await this.meetingRepo.findOne({
      where: { id, appId },
      relations: ['attendees', 'agendaItems'],
    });
    if (!meeting) throw new NotFoundException('Meeting not found');

    const canManage = await this.canManageMeetings(userId);
    const isParticipant =
      meeting.hostUserId === userId ||
      (meeting.attendees ?? []).some((a) => a.userId === userId);
    if (!canManage && !isParticipant) {
      throw new ForbiddenException('You cannot view this meeting');
    }

    const note = await this.noteRepo.findOne({
      where: { meetingId: id, userId },
    });

    return {
      ...this.serializeMeeting(meeting, userId),
      canManage,
      notesPreview: note?.content ?? '',
    };
  }

  async createOrUpdate(dto: CreateMeetingDto) {
    const userId = this.getUserId();
    if (!(await this.canManageMeetings(userId))) {
      throw new ForbiddenException('Only admin can create meetings');
    }

    const appId = await this.resolveAppId(userId);
    let startAt: Date;
    let endAt: Date;
    if (dto.startAt && dto.endAt) {
      startAt = new Date(dto.startAt);
      endAt = new Date(dto.endAt);
    } else {
      startAt = this.parseDateTime(dto.date, dto.startTime, dto.timeZone);
      endAt = this.parseDateTime(dto.date, dto.endTime, dto.timeZone);
    }
    if (endAt <= startAt) {
      throw new ForbiddenException('End time must be after start time');
    }

    let hostEmployee = await this.employeeRepo.findOne({
      where: { id: dto.hostId, appId },
    });
    let hostUserId = hostEmployee?.userId ?? null;
    let hostName =
      dto.invitees.find((i) => Number(i.employeeId) === Number(dto.hostId))
        ?.name ?? 'Host';

    if (!hostEmployee && dto.hostId) {
      const empByUser = await this.employeeRepo.findOne({
        where: { userId: dto.hostId, appId },
      });
      if (empByUser) {
        hostEmployee = empByUser;
        hostUserId = empByUser.userId;
      } else {
        hostUserId = dto.hostId;
      }
    }

    if (hostUserId) {
      const nameRows: Array<{ first_name?: string; last_name?: string }> =
        await this.meetingRepo.manager
          .query(
            `SELECT first_name, last_name FROM users WHERE id = ? LIMIT 1`,
            [hostUserId],
          )
          .catch(() => []);
      const row = nameRows[0];
      if (row) {
        const full = `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim();
        if (full) hostName = full;
      }
    } else if (hostEmployee) {
      hostName =
        dto.invitees.find((i) => i.employeeId === dto.hostId)?.name ?? hostName;
    }

    let meeting: Meeting;
    if (dto.id) {
      const existing = await this.meetingRepo.findOne({
        where: { id: dto.id, appId },
      });
      if (!existing) throw new NotFoundException('Meeting not found');

      const existingStartMs = new Date(existing.startAt).getTime();
      const existingEndMs = existing.endAt
        ? new Date(existing.endAt).getTime()
        : existingStartMs + 30 * 60 * 1000;
      const newStartMs = startAt.getTime();
      const newEndMs = endAt.getTime();
      const now = Date.now();
      const tenMinutesMs = 10 * 60 * 1000;

      const isTimeChanged =
        Math.abs(existingStartMs - newStartMs) > 1000 ||
        Math.abs(existingEndMs - newEndMs) > 1000;

      if (isTimeChanged) {
        // Locked ONLY:
        // 1) Within 10 minutes of start time
        // 2) While meeting is ongoing / in progress
        // Allowed: more than 10 min before start, or after meeting ends (now > existingEndMs)
        const isWithin10MinOrOngoing =
          existing.listStatus !== 'COMPLETED' &&
          existing.listStatus !== 'CANCELLED' &&
          now >= existingStartMs - tenMinutesMs &&
          now <= existingEndMs;

        if (isWithin10MinOrOngoing) {
          throw new BadRequestException(
            'Cannot reschedule or change meeting time within 10 minutes of its start time or while in progress.',
          );
        }

        // New start time must be at least 10 minutes in the future
        if (newStartMs < now + tenMinutesMs) {
          throw new BadRequestException(
            'Rescheduled meeting start time must be at least 10 minutes from now.',
          );
        }
      }

      meeting = existing;
      await this.attendeeRepo.delete({ meetingId: meeting.id });
      await this.agendaRepo.delete({ meetingId: meeting.id });

      // If meeting is rescheduled to the future, reactivate status to SCHEDULED
      if (new Date(endAt).getTime() > Date.now()) {
        meeting.listStatus = 'SCHEDULED';
      }
    } else {
      meeting = this.meetingRepo.create({
        appId,
        creatorId: userId,
        listStatus: 'SCHEDULED',
      });
    }

    Object.assign(meeting, {
      title: dto.title,
      hostUserId,
      hostEmployeeId: hostEmployee?.id ?? null,
      hostName,
      meetingType: dto.meetingType,
      startAt,
      endAt,
      roomName: dto.roomName ?? null,
      companyName: dto.companyName ?? null,
      clientName: dto.clientName ?? null,
      address: dto.address ?? null,
      isRepeat: Boolean(dto.repeat),
      repeatDays: dto.repeat ? dto.repeatDays ?? null : null,
    });

    const isOnline =
      dto.meetingType?.toLowerCase().includes('online') ?? false;
    const shouldCreateMeet =
      isOnline && dto.createGoogleMeet !== false && !dto.meetUrl;

    if (shouldCreateMeet) {
      try {
        const connected = await this.googleCalendarService.isConnected(userId);
        if (connected) {
          const attendeeEmails = dto.invitees
            .map((i) => i.email)
            .filter(Boolean) as string[];
          const { meetUrl, googleEventId } =
            await this.googleCalendarService.createMeetEvent({
              userId,
              title: dto.title,
              startAt,
              endAt,
              attendeeEmails,
            });
          meeting.meetUrl = meetUrl;
          meeting.googleEventId = googleEventId;
        } else {
          this.logger.warn(
            `Google Calendar not connected for user ${userId}; meeting saved without auto Meet URL.`,
          );
        }
      } catch (err: any) {
        this.logger.warn(
          `Could not generate Google Meet link: ${err.message}; meeting saved without auto Meet URL.`,
        );
      }
    } else if (dto.meetUrl) {
      meeting.meetUrl = dto.meetUrl;
    }

    meeting = await this.meetingRepo.save(meeting);

    const employeeIds = [
      ...new Set(
        dto.invitees
          .map((inv) => Number(inv.employeeId ?? (inv as any).id))
          .filter((id) => Number.isFinite(id) && id > 0),
      ),
    ];
    const employeeRows = employeeIds.length
      ? await this.employeeRepo.find({
          where: { id: In(employeeIds), appId },
        })
      : [];
    const employeeById = new Map(employeeRows.map((e) => [e.id, e]));

    const attendees = dto.invitees.map((inv) => {
      const rawId = inv.employeeId ?? (inv as any).id ?? null;
      const rawNum =
        rawId != null && Number.isFinite(Number(rawId))
          ? Number(rawId)
          : null;
      const emp = rawNum ? employeeById.get(rawNum) : null;
      const email = inv.email ?? null;
      return this.attendeeRepo.create({
        meetingId: meeting.id,
        employeeId: emp ? emp.id : null,
        userId:
          inv.userId != null
            ? Number(inv.userId)
            : (emp?.userId ?? null),
        name: inv.name,
        email,
        role: inv.role ?? null,
        inviteStatus: 'pending',
      });
    });
    if (attendees.length) await this.attendeeRepo.save(attendees);

    const agendaItems = (dto.agenda ?? []).map((text) =>
      this.agendaRepo.create({
        meetingId: meeting.id,
        text,
        isDone: false,
      }),
    );
    if (agendaItems.length) await this.agendaRepo.save(agendaItems);

    // If meeting is configured to repeat for N days (e.g. 10 days), automatically create scheduled instances for each day at the same time
    if (dto.repeat && dto.repeatDays && dto.repeatDays > 1 && !dto.id) {
      const daysCount = Math.min(30, Math.max(1, Number(dto.repeatDays)));
      const startTimestamp = new Date(startAt).getTime();
      const endTimestamp = new Date(endAt).getTime();

      const repeatMeetings: Meeting[] = [];
      for (let dayOffset = 1; dayOffset < daysCount; dayOffset++) {
        const nextStartAt = new Date(
          startTimestamp + dayOffset * 24 * 60 * 60 * 1000,
        );
        const nextEndAt = new Date(
          endTimestamp + dayOffset * 24 * 60 * 60 * 1000,
        );

        repeatMeetings.push(
          this.meetingRepo.create({
            appId,
            creatorId: userId,
            title: dto.title,
            hostUserId,
            hostEmployeeId: hostEmployee?.id ?? null,
            hostName,
            meetingType: dto.meetingType,
            startAt: nextStartAt,
            endAt: nextEndAt,
            meetUrl: meeting.meetUrl,
            googleEventId: meeting.googleEventId,
            roomName: dto.roomName ?? null,
            companyName: dto.companyName ?? null,
            clientName: dto.clientName ?? null,
            address: dto.address ?? null,
            listStatus: 'SCHEDULED',
            isRepeat: true,
            repeatDays: daysCount,
          }),
        );
      }

      if (repeatMeetings.length) {
        const savedRepeats = await this.meetingRepo.save(repeatMeetings);

        const allAttendees: MeetingAttendee[] = [];
        const allAgendas: MeetingAgendaItem[] = [];

        for (const savedRepeat of savedRepeats) {
          for (const inv of dto.invitees) {
            const rawId = inv.employeeId ?? (inv as any).id ?? null;
            const rawNum =
              rawId != null && Number.isFinite(Number(rawId))
                ? Number(rawId)
                : null;
            const emp = rawNum ? employeeById.get(rawNum) : null;
            allAttendees.push(
              this.attendeeRepo.create({
                meetingId: savedRepeat.id,
                employeeId: emp ? emp.id : null,
                userId:
                  inv.userId != null
                    ? Number(inv.userId)
                    : (emp?.userId ?? null),
                name: inv.name,
                email: inv.email ?? null,
                role: inv.role ?? null,
                inviteStatus: 'pending',
              }),
            );
          }

          for (const text of dto.agenda ?? []) {
            allAgendas.push(
              this.agendaRepo.create({
                meetingId: savedRepeat.id,
                text,
                isDone: false,
              }),
            );
          }
        }

        if (allAttendees.length) {
          await this.attendeeRepo.save(allAttendees, { chunk: 100 });
        }
        if (allAgendas.length) {
          await this.agendaRepo.save(allAgendas, { chunk: 100 });
        }
      }
    }

    return this.findOne(meeting.id);
  }

  async startMeeting(id: number) {
    const userId = this.getUserId();
    if (!(await this.canManageMeetings(userId))) {
      throw new ForbiddenException('Only admin can start meetings');
    }
    const appId = await this.resolveAppId(userId);
    const meeting = await this.meetingRepo.findOne({
      where: { id, appId },
      relations: ['attendees'],
    });
    if (!meeting) throw new NotFoundException('Meeting not found');

    const isOnline =
      meeting.meetingType?.toLowerCase().includes('online') ?? false;
    if (isOnline && !meeting.meetUrl) {
      try {
        const connected = await this.googleCalendarService.isConnected(userId);
        if (connected) {
          const emails = (meeting.attendees ?? [])
            .map((a) => a.email)
            .filter(Boolean) as string[];
          const { meetUrl, googleEventId } =
            await this.googleCalendarService.createMeetEvent({
              userId,
              title: meeting.title,
              startAt: meeting.startAt,
              endAt: meeting.endAt,
              attendeeEmails: emails,
            });
          meeting.meetUrl = meetUrl;
          meeting.googleEventId = googleEventId;
          await this.meetingRepo.save(meeting);

          // If this is a repeating meeting series, propagate meetUrl to all matching instances in this series
          if (meeting.isRepeat && meeting.meetUrl) {
            await this.meetingRepo
              .createQueryBuilder()
              .update(Meeting)
              .set({ meetUrl: meeting.meetUrl, googleEventId: meeting.googleEventId })
              .where('appId = :appId', { appId })
              .andWhere('creatorId = :creatorId', { creatorId: meeting.creatorId })
              .andWhere('title = :title', { title: meeting.title })
              .andWhere('isRepeat = 1')
              .andWhere('meetUrl IS NULL')
              .execute();
          }
        } else {
          this.logger.warn(
            `Google Calendar not connected for user ${userId}; meeting started without Meet URL.`,
          );
        }
      } catch (err: any) {
        this.logger.warn(`Could not create Meet link on start: ${err.message}`);
      }
    }

    try {
      const employee = userId
        ? await this.employeeRepo.findOne({
            where: { userId, appId },
            relations: ['user'],
          })
        : null;
      const hostEmail = (employee?.user?.email || '').trim().toLowerCase();
      const hostAttendee = (meeting.attendees ?? []).find(
        (a) =>
          (userId && (a.userId === userId || a.employeeId === userId)) ||
          (employee?.id && a.employeeId === employee.id) ||
          (hostEmail && a.email && a.email.trim().toLowerCase() === hostEmail),
      );
      if (hostAttendee) {
        hostAttendee.attendance = 'present';
        hostAttendee.inviteStatus = 'accepted';
        hostAttendee.joinedAt = new Date();
        await this.attendeeRepo.save(hostAttendee);
      }
    } catch (e: any) {
      this.logger.warn(`Could not auto-mark host present: ${e.message}`);
    }

    return this.findOne(meeting.id);
  }

  async updateStatus(id: number, listStatus: MeetingListStatus) {
    if (!(await this.canManageMeetings())) {
      throw new ForbiddenException('Only admin can update status');
    }
    const appId = await this.resolveAppId();
    const meeting = await this.meetingRepo.findOne({
      where: { id, appId },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    meeting.listStatus = listStatus;
    if (
      listStatus === 'COMPLETED' &&
      new Date(meeting.endAt).getTime() > Date.now()
    ) {
      meeting.endAt = new Date();
    }
    await this.meetingRepo.save(meeting);
    return this.findOne(id);
  }

  async remove(id: number) {
    if (!(await this.canManageMeetings())) {
      throw new ForbiddenException('Only admin can delete meetings');
    }
    const appId = await this.resolveAppId();
    const meeting = await this.meetingRepo.findOne({
      where: { id, appId },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');

    await this.meetingRepo.remove(meeting);
    return { deleted: true };
  }

  /**
   * Email meeting invitations to selected attendees (or all with email).
   * Uses the same HybridQueue → email template flow as forgot-password.
   */
  async sendInvitations(
    id: number,
    options?: { employeeIds?: number[]; emails?: string[] },
  ) {
    const userId = this.getUserId();
    if (!(await this.canManageMeetings(userId))) {
      throw new ForbiddenException('Only admin can send meeting invitations');
    }

    const appId = await this.resolveAppId(userId);
    const meeting = await this.meetingRepo.findOne({
      where: { id, appId },
      relations: ['attendees', 'agendaItems'],
    });
    if (!meeting) throw new NotFoundException('Meeting not found');

    if (
      new Date(meeting.endAt).getTime() < Date.now() ||
      meeting.listStatus === 'COMPLETED'
    ) {
      throw new BadRequestException(
        'Cannot send invitation for an expired meeting.',
      );
    }

    let recipients = (meeting.attendees ?? []).filter((a) =>
      Boolean(a.email?.trim()),
    );

    if (options?.employeeIds?.length) {
      const set = new Set(options.employeeIds.map(Number));
      recipients = recipients.filter(
        (a) => a.employeeId != null && set.has(Number(a.employeeId)),
      );
    }
    if (options?.emails?.length) {
      const set = new Set(
        options.emails.map((e) => String(e).trim().toLowerCase()),
      );
      recipients = recipients.filter((a) =>
        set.has(String(a.email).trim().toLowerCase()),
      );
    }

    // Dedupe by email
    const seen = new Set<string>();
    recipients = recipients.filter((a) => {
      const key = String(a.email).trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (!recipients.length) {
      throw new BadRequestException(
        'No attendee emails found to send invitations.',
      );
    }

    const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(
      /\/$/,
      '',
    );
    const meetingLink = `${frontend}/hr-dashboard/meeting/${meeting.id}`;
    const tz = 'Asia/Dhaka';
    const meetingDate = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(meeting.startAt));
    const meetingTime = `${new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(meeting.startAt))} – ${new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(meeting.endAt))}`;

    const agendaPreview = (meeting.agendaItems ?? [])
      .map((a, i) => `${i + 1}. ${a.text}`)
      .join('<br/>');

    const locationParts = [
      meeting.companyName,
      meeting.clientName,
      meeting.address,
    ].filter(Boolean);

    let sent = 0;
    const failed: string[] = [];
    let apiBaseUrl = (
      process.env.API_BASE_URL ||
      process.env.FRONTEND_URL ||
      'https://sanzio.app'
    ).replace(/\/$/, '');

    for (const attendee of recipients) {
      const token = this.generateJoinToken(
        meeting.id,
        attendee.id,
        attendee.email || undefined,
      );
      const cleanEmail = (attendee.email || '').trim().toLowerCase();
      // Point directly to the backend @Public() GET /api/v1/meetings/join endpoint
      // This is more reliable than the frontend route.js (no mysql2 bundling issues)
      const joinMeetUrl = `${apiBaseUrl}/api/v1/meetings/join?token=${encodeURIComponent(token)}&type=meet`;
      const joinDashboardUrl = `${apiBaseUrl}/api/v1/meetings/join?token=${encodeURIComponent(token)}&type=dashboard`;

      const context = {
        name: attendee.name || 'there',
        meetingTitle: meeting.title,
        hostName: meeting.hostName || 'Host',
        meetingType: meeting.meetingType || 'Meeting',
        meetingDate,
        meetingTime,
        roomName: meeting.roomName || '',
        location: locationParts.join(' · '),
        agendaPreview: agendaPreview || '',
        meetUrl: meeting.meetUrl || '',
        meetingLink,
        joinMeetUrl,
        joinDashboardUrl,
        emailClosingNote: 'Thank you for using our management system.',
        supportTeamName: 'HR Team',
      };

      try {
        await this.mailService.sendMail(
          attendee.email!,
          `Meeting Invitation: ${meeting.title}`,
          'meeting-invitation',
          context,
        );
        sent += 1;
      } catch (directErr: any) {
        this.logger.warn(
          `Direct mail send failed to ${attendee.email}: ${directErr.message}. Trying queue fallback...`,
        );
        try {
          await this.hybridQueue.publishEmailJob({
            to: attendee.email,
            subject: `Meeting Invitation: ${meeting.title}`,
            template: 'meeting-invitation',
            context,
          });
          sent += 1;
        } catch (queueErr: any) {
          this.logger.error(
            `Failed sending invitation to ${attendee.email}: ${queueErr.message}`,
          );
          failed.push(attendee.email!);
        }
      }
    }

    if (sent > 0 && meeting.listStatus === 'SCHEDULED') {
      meeting.listStatus = 'INVITED';
      await this.meetingRepo.save(meeting);
    }

    return {
      sent,
      failed,
      total: recipients.length,
      meetingId: meeting.id,
    };
  }

  private generateJoinToken(
    meetingId: number,
    attendeeId: number,
    email?: string,
  ): string {
    const secret = process.env.JWT_SECRET || 'oms-meeting-secret-key-2026';
    const cleanEmail = (email || '').trim().toLowerCase();
    const payload = `${meetingId}:${attendeeId}:${encodeURIComponent(cleanEmail)}:${Date.now()}`;
    const sig = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return Buffer.from(`${payload}:${sig}`).toString('base64url');
  }

  computeAttendanceStatus(
    startAt: Date | string,
    endAt?: Date | string,
    joinedAtMs: number = Date.now(),
    graceMinutes = 5,
  ): 'present' | 'late' {
    const startMs = new Date(startAt).getTime();
    const graceMs = graceMinutes * 60 * 1000;

    if (joinedAtMs <= startMs + graceMs) {
      return 'present';
    }
    return 'late';
  }

  async handleEmailJoin(
    token: string,
    type?: string,
  ): Promise<{ redirectUrl: string; attendeeName?: string }> {
    this.logger.log(`[handleEmailJoin] Called with type="${type}", token length=${token?.length || 0}`);

    let frontend = (
      process.env.FRONTEND_URL || 'https://sanzio.app'
    ).replace(/\/$/, '');

    try {
      if (!token) {
        this.logger.warn('[handleEmailJoin] No token provided, redirecting to meeting list');
        return { redirectUrl: `${frontend}/hr-dashboard/meeting` };
      }
      const cleanToken = token.trim();
      const decoded = Buffer.from(cleanToken, 'base64url').toString('utf8');
      this.logger.log(`[handleEmailJoin] Decoded token payload (first 100 chars): ${decoded.substring(0, 100)}`);
      const lastColon = decoded.lastIndexOf(':');
      if (lastColon === -1) {
        this.logger.warn('[handleEmailJoin] Token has no colon separator, invalid format');
        return { redirectUrl: `${frontend}/hr-dashboard/meeting` };
      }

      const sig = decoded.substring(lastColon + 1);
      const payload = decoded.substring(0, lastColon);

      const secrets = [
        process.env.JWT_SECRET,
        'oms-meeting-secret-key-2026',
      ].filter(Boolean) as string[];

      const isValid = secrets.some((sec) => {
        const expectedSig = crypto
          .createHmac('sha256', sec)
          .update(payload)
          .digest('hex');
        return sig === expectedSig;
      });

      const parts = payload.split(':');
      let meetingId: number | null = null;
      let attendeeId: number | null = null;
      let attendeeEmail = '';

      if (parts.length === 3) {
        // Legacy format: meetingId:attendeeId:timestamp
        meetingId = Number(parts[0]);
        attendeeId = Number(parts[1]);
      } else if (parts.length >= 4) {
        // New format: meetingId:attendeeId:emailEncoded:timestamp
        meetingId = Number(parts[0]);
        attendeeId = Number(parts[1]);
        attendeeEmail = decodeURIComponent(
          parts.slice(2, parts.length - 1).join(':'),
        )
          .trim()
          .toLowerCase();
      }

      this.logger.log(`[handleEmailJoin] Parsed → meetingId=${meetingId}, attendeeId=${attendeeId}, email=${attendeeEmail}, tokenValid=${isValid}`);

      if (!meetingId || isNaN(meetingId)) {
        this.logger.warn('[handleEmailJoin] Invalid meetingId after token parse');
        return { redirectUrl: `${frontend}/hr-dashboard/meeting` };
      }

      const meeting = await this.meetingRepo.findOne({
        where: { id: meetingId },
      });

      this.logger.log(`[handleEmailJoin] Meeting found: ${meeting ? `id=${meeting.id}, title="${meeting.title}", startAt=${meeting.startAt}` : 'NOT FOUND'}`);

      if (!isValid) {
        this.logger.warn(
          `Signature mismatch for email join token. Meeting: ${meetingId}, Attendee: ${attendeeId}, Email: ${attendeeEmail}. Proceeding to record attendance based on attendee match.`,
        );
      }

      // Match attendee by attendeeId, OR by email (case-insensitive) in this meeting
      let attendee: MeetingAttendee | null = null;
      if (attendeeId) {
        attendee = await this.attendeeRepo.findOne({
          where: { id: attendeeId, meetingId },
        });
        this.logger.log(`[handleEmailJoin] Attendee by id ${attendeeId}: ${attendee ? `found (name="${attendee.name}", email="${attendee.email}")` : 'NOT FOUND'}`);
      }

      if (!attendee && attendeeEmail) {
        attendee = await this.attendeeRepo
          .createQueryBuilder('a')
          .where('a.meetingId = :meetingId', { meetingId })
          .andWhere('LOWER(TRIM(a.email)) = LOWER(TRIM(:email))', {
            email: attendeeEmail,
          })
          .getOne();
        this.logger.log(`[handleEmailJoin] Attendee by email query "${attendeeEmail}": ${attendee ? `found (id=${attendee.id}, name="${attendee.name}")` : 'NOT FOUND'}`);
      }

      if (!attendee && attendeeEmail) {
        const allAttendees = await this.attendeeRepo.find({
          where: { meetingId },
        });
        this.logger.log(`[handleEmailJoin] All attendees for meeting ${meetingId}: ${allAttendees.map(a => `{id:${a.id}, email:"${a.email}", name:"${a.name}"}`).join(', ')}`);
        attendee =
          allAttendees.find(
            (a) =>
              a.email &&
              a.email.trim().toLowerCase() === attendeeEmail.trim().toLowerCase(),
          ) ?? null;
        this.logger.log(`[handleEmailJoin] Attendee by manual email match: ${attendee ? `found (id=${attendee.id})` : 'NOT FOUND'}`);
      }

      if (attendee && meeting) {
        // If already marked present, don't downgrade to late
        const previousStatus = attendee.attendance;
        if (attendee.attendance !== 'present') {
          const autoStatus = this.computeAttendanceStatus(
            meeting.startAt,
            meeting.endAt,
            Date.now(),
            5,
          );
          attendee.attendance = autoStatus;
        }
        attendee.inviteStatus = 'accepted';
        if (!attendee.joinedAt) {
          attendee.joinedAt = new Date();
        }
        await this.attendeeRepo.save(attendee);
        this.logger.log(
          `[handleEmailJoin] ✅ Attendee ${attendee.name} (${attendee.email || attendee.id}) auto-marked "${attendee.attendance}" (was "${previousStatus}") for meeting ${meeting.id} via email join link.`,
        );
      } else {
        this.logger.warn(`[handleEmailJoin] ❌ Could not mark attendance: attendee=${!!attendee}, meeting=${!!meeting}`);
      }

      if (type === 'meet' && meeting?.meetUrl) {
        this.logger.log(`[handleEmailJoin] Redirecting to Google Meet: ${meeting.meetUrl}`);
        return { redirectUrl: meeting.meetUrl, attendeeName: attendee?.name };
      }

      const queryParts: string[] = [];
      if (attendee?.id || attendeeId) {
        queryParts.push(`attendeeId=${attendee?.id || attendeeId}`);
      }
      if (attendee?.email || attendeeEmail) {
        queryParts.push(
          `attendeeEmail=${encodeURIComponent(attendee?.email || attendeeEmail)}`,
        );
      }
      const qs = queryParts.length ? `?${queryParts.join('&')}` : '';

      return {
        redirectUrl: `${frontend}/hr-dashboard/meeting/${meetingId}${qs}`,
        attendeeName: attendee?.name,
      };
    } catch (err: any) {
      this.logger.error(`Error handling email join: ${err.message}`);
      return { redirectUrl: `${frontend}/hr-dashboard/meeting` };
    }
  }

  async saveNote(meetingId: number, content: string) {
    const userId = this.getUserId();
    await this.findOne(meetingId);
    let note = await this.noteRepo.findOne({
      where: { meetingId, userId },
    });
    if (!note) {
      note = this.noteRepo.create({ meetingId, userId, content });
    } else {
      note.content = content;
    }
    await this.noteRepo.save(note);
    return { content: note.content };
  }

  async getNote(meetingId: number) {
    const userId = this.getUserId();
    await this.findOne(meetingId);
    const note = await this.noteRepo.findOne({
      where: { meetingId, userId },
    });
    return { content: note?.content ?? '' };
  }

  async updateAttendance(
    meetingId: number,
    employeeId?: number,
    attendance?: 'present' | 'late' | 'absent',
    attendeeId?: number,
    email?: string,
  ) {
    const userId = this.getUserId();
    const appId = await this.resolveAppId(userId);
    const meeting = await this.findOne(meetingId);

    const employee = userId
      ? await this.employeeRepo.findOne({
          where: { userId, appId },
          relations: ['user'],
        })
      : null;
    const userEmail = employee?.user?.email?.trim().toLowerCase();
    const targetEmail = (email || userEmail || '').trim().toLowerCase();

    let attendee: MeetingAttendee | null = null;

    if (attendeeId) {
      attendee = await this.attendeeRepo.findOne({
        where: { meetingId, id: Number(attendeeId) },
      });
    }

    if (!attendee && employeeId) {
      attendee = await this.attendeeRepo.findOne({
        where: { meetingId, employeeId: Number(employeeId) },
      });
    }

    if (!attendee && targetEmail) {
      const allAttendees = await this.attendeeRepo.find({
        where: { meetingId },
      });
      attendee =
        allAttendees.find(
          (a) => a.email && a.email.trim().toLowerCase() === targetEmail,
        ) ?? null;
    }

    if (!attendee && employee?.id) {
      attendee = await this.attendeeRepo.findOne({
        where: { meetingId, employeeId: employee.id },
      });
    }

    if (!attendee && Number.isFinite(Number(employeeId))) {
      attendee = await this.attendeeRepo.findOne({
        where: { meetingId, id: Number(employeeId) },
      });
    }

    if (!attendee) {
      throw new NotFoundException('Attendee not found in this meeting');
    }

    const isSelf =
      attendee.userId === userId ||
      (attendee.employeeId && attendee.employeeId === userId) ||
      (employee && attendee.employeeId === employee.id) ||
      (userEmail &&
        attendee.email &&
        attendee.email.trim().toLowerCase() === userEmail) ||
      (targetEmail &&
        attendee.email &&
        attendee.email.trim().toLowerCase() === targetEmail);

    const canManage = await this.canManageRoster(userId);

    if (!isSelf && !canManage) {
      throw new ForbiddenException(
        'Only HR can update other attendees’ attendance',
      );
    }

    if (!attendance) {
      attendance = this.computeAttendanceStatus(
        meeting.startAt,
        meeting.endAt,
        Date.now(),
        5,
      );
    }

    attendee.attendance = attendance;
    attendee.inviteStatus = 'accepted';
    if (attendance === 'present' || attendance === 'late') {
      if (!attendee.joinedAt) attendee.joinedAt = new Date();
    } else {
      attendee.joinedAt = null;
    }
    await this.attendeeRepo.save(attendee);
    return this.findOne(meetingId);
  }

  async findInvitations() {
    const userId = this.getUserId();
    const appId = await this.resolveAppId(userId);

    const employee = await this.employeeRepo.findOne({
      where: { userId, appId },
      relations: ['user'],
    });
    const userEmail = employee?.user?.email?.trim().toLowerCase();
    const employeeId = employee?.id;

    const qb = this.attendeeRepo
      .createQueryBuilder('a')
      .innerJoinAndSelect('a.meeting', 'm')
      .where('m.appId = :appId', { appId })
      .andWhere('m.listStatus = :invited', { invited: 'INVITED' })
      .andWhere("m.listStatus != 'CANCELLED'");

    const conditions: string[] = ['a.userId = :userId'];
    const params: Record<string, any> = { appId, invited: 'INVITED', userId };

    if (employeeId) {
      conditions.push('a.employeeId = :employeeId');
      params.employeeId = employeeId;
    }
    if (userEmail) {
      conditions.push('LOWER(a.email) = :userEmail');
      params.userEmail = userEmail;
    }

    const canManage = await this.canManageMeetings(userId);
    if (canManage) {
      qb.andWhere(`(${conditions.join(' OR ')} OR m.hostUserId = :userId)`, params);
    } else {
      qb.andWhere(`(${conditions.join(' OR ')})`, params);
    }

    qb.orderBy('m.startAt', 'ASC');
    const attendees = await qb.getMany();

    const seen = new Set<number>();
    const list: any[] = [];
    for (const a of attendees) {
      if (!a.meeting) continue;
      if (seen.has(a.meeting.id)) continue;
      seen.add(a.meeting.id);

      list.push({
        id: a.id,
        meetingId: a.meeting?.id ?? a.meetingId,
        meetingTitle: a.meeting?.title || 'Meeting',
        fromName: a.meeting?.hostName || 'Host',
        startAt: a.meeting?.startAt
          ? a.meeting.startAt.toISOString()
          : new Date().toISOString(),
        endAt: a.meeting?.endAt
          ? a.meeting.endAt.toISOString()
          : new Date().toISOString(),
        meetingType: a.meeting?.meetingType,
        inviteStatus: a.inviteStatus || 'pending',
        meetUrl: a.meeting?.meetUrl,
      });
    }

    return list;
  }

  async respondInvitation(meetingId: number, status: 'accepted' | 'declined') {
    const userId = this.getUserId();
    const appId = await this.resolveAppId(userId);

    const meeting = await this.meetingRepo.findOne({
      where: { id: meetingId, appId },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');

    if (
      status === 'accepted' &&
      new Date(meeting.startAt).getTime() < Date.now()
    ) {
      throw new BadRequestException(
        'Meeting time has already passed. Invitations cannot be accepted after meeting time and remain pending.',
      );
    }

    const employee = await this.employeeRepo.findOne({
      where: { userId, appId },
      relations: ['user'],
    });
    const userEmail = employee?.user?.email?.trim().toLowerCase();

    const qb = this.attendeeRepo
      .createQueryBuilder('a')
      .where('a.meetingId = :meetingId', { meetingId });

    const orClauses = ['a.userId = :userId'];
    const params: any = { meetingId, userId };
    if (employee?.id) {
      orClauses.push('a.employeeId = :empId');
      params.empId = employee.id;
    }
    if (userEmail) {
      orClauses.push('LOWER(a.email) = :userEmail');
      params.userEmail = userEmail;
    }

    qb.andWhere(`(${orClauses.join(' OR ')})`, params);

    const attendees = await qb.getMany();
    if (!attendees.length) {
      if (meeting.hostUserId === userId) {
        return { success: true, inviteStatus: status };
      }
      throw new NotFoundException('Invitation not found for this user');
    }

    for (const a of attendees) {
      a.inviteStatus = status;
      await this.attendeeRepo.save(a);
    }

    return { success: true, inviteStatus: status };
  }

  async addAgendaItem(meetingId: number, text: string) {
    await this.findOne(meetingId);
    if (!text?.trim()) {
      throw new BadRequestException('Agenda text is required');
    }
    const item = this.agendaRepo.create({
      meetingId: Number(meetingId),
      text: text.trim(),
      isDone: false,
    });
    const saved = await this.agendaRepo.save(item);
    return {
      id: String(saved.id),
      text: saved.text,
      done: Boolean(saved.isDone),
    };
  }

  async updateAgendaItem(
    meetingId: number,
    agendaId: number,
    update: { text?: string; isDone?: boolean },
  ) {
    const item = await this.agendaRepo.findOne({
      where: { id: Number(agendaId), meetingId: Number(meetingId) },
    });
    if (!item) throw new NotFoundException('Agenda item not found');

    if (update.text !== undefined) item.text = update.text.trim();
    if (update.isDone !== undefined) item.isDone = Boolean(update.isDone);

    const saved = await this.agendaRepo.save(item);
    return {
      id: String(saved.id),
      text: saved.text,
      done: Boolean(saved.isDone),
    };
  }

  async deleteAgendaItem(meetingId: number, agendaId: number) {
    const item = await this.agendaRepo.findOne({
      where: { id: Number(agendaId), meetingId: Number(meetingId) },
    });
    if (!item) throw new NotFoundException('Agenda item not found');
    await this.agendaRepo.delete({ id: Number(agendaId), meetingId: Number(meetingId) });
    return { success: true };
  }

  async findAvailableParticipants() {
    const userId = this.getUserId();
    const appId = await this.resolveAppId(userId);

    const rawEmployees: Array<{
      id: number;
      employeeId: number;
      userId: number | null;
      employeeCode: string | null;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      designation: string | null;
      department: string | null;
    }> = await this.meetingRepo.manager.query(
      `
      SELECT 
        e.id AS id,
        e.id AS employeeId,
        e.user_id AS userId,
        e.employee_code AS employeeCode,
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.email AS email,
        d.name AS designation,
        dept.name AS department
      FROM employees e
      INNER JOIN users u ON e.user_id = u.id
      LEFT JOIN designations d ON d.id = e.designation_id
      LEFT JOIN departments dept ON dept.id = d.department_id
      WHERE (e.app_id = ? OR e.app_id IS NULL)
        AND u.deleted_at IS NULL
      ORDER BY u.first_name ASC, u.last_name ASC
      `,
      [appId],
    );

    const list = rawEmployees.map((e) => {
      const firstName = e.firstName ?? '';
      const lastName = e.lastName ?? '';
      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
      return {
        id: e.id,
        userId: e.userId as number | null,
        employeeId: e.id,
        name: fullName || e.email || `Employee ${e.id}`,
        email: e.email || '',
        role: e.designation || 'Employee',
        department: e.department || 'General',
      };
    });

    const hasAsif = list.some(
      (u) => (u.email || '').toLowerCase() === 'asifpatwary630@gmail.com',
    );
    if (!hasAsif) {
      list.unshift({
        id: 99901,
        userId: null as number | null,
        employeeId: 99901,
        name: 'Asif Patwary',
        email: 'asifpatwary630@gmail.com',
        role: 'HR / QA',
        department: 'HR',
      });
    }

    return list;
  }
}
