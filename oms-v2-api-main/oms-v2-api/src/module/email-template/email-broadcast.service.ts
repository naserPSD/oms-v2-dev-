import { randomUUID } from 'crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestContext } from '@common/request-context';
import { MailService } from 'src/mail/mail.service';
import { HybridQueueService } from 'src/queue/hybrid-queue.service';
import { EmailBroadcast } from './entities/email-broadcast.entity';
import { SaveEmailBroadcastDto } from './dto/email-broadcast.dto';

type Recipient = {
  userId?: number;
  name: string;
  email: string;
  status?: string;
};

type ListQuery = {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  recipientType?: string;
};

@Injectable()
export class EmailBroadcastService {
  constructor(
    @InjectRepository(EmailBroadcast)
    private readonly repo: Repository<EmailBroadcast>,
    private readonly mailService: MailService,
    private readonly hybridQueue: HybridQueueService,
  ) {}

  private companyContext(): { appId: number; userId: number | null } {
    const appId = Number(RequestContext.get('activeAppId'));
    const userId = Number(RequestContext.get('userId')) || null;
    if (!appId) {
      throw new BadRequestException('Active company is required');
    }
    return { appId, userId };
  }

  private toResponse(row: EmailBroadcast) {
    return {
      ...row,
      isScheduled: Boolean(row.isScheduled),
      recipientDetails: Array.isArray(row.recipientDetails)
        ? row.recipientDetails
        : [],
      attachmentDetails: Array.isArray(row.attachmentDetails)
        ? row.attachmentDetails
        : [],
    };
  }

  async list(query: ListQuery) {
    const { appId } = this.companyContext();
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));

    const qb = this.repo
      .createQueryBuilder('broadcast')
      .where('broadcast.appId = :appId', { appId });

    if (query.search) {
      qb.andWhere(
        '(broadcast.subject LIKE :search OR broadcast.message LIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }
    if (query.status) {
      qb.andWhere('broadcast.status = :status', { status: query.status });
    }
    if (query.recipientType) {
      qb.andWhere('broadcast.recipientType = :recipientType', {
        recipientType: query.recipientType,
      });
    }

    qb.orderBy('broadcast.updatedAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [rows, total] = await qb.getManyAndCount();
    return {
      message: 'Email broadcasts retrieved successfully',
      data: rows.map((row) => this.toResponse(row)),
      pagination: {
        page,
        limit,
        total,
        lastPage: Math.max(1, Math.ceil(total / limit)),
        resultRows: rows.length,
      },
    };
  }

  async save(dto: SaveEmailBroadcastDto, id?: number) {
    const { appId, userId } = this.companyContext();
    let entity: EmailBroadcast;
    if (id) {
      const found = await this.repo.findOne({ where: { id, appId } });
      if (!found) throw new NotFoundException('Email broadcast not found');
      entity = found;
    } else {
      entity = this.repo.create({
        appId,
        createdBy: userId,
        recipients: 0,
        bounced: 0,
        received: 0,
        attachments: 0,
        recipientDetails: [],
        attachmentDetails: [],
      });
    }

    const scheduled = Boolean(dto.isScheduled);
    entity.subject = dto.subject.trim();
    entity.message = dto.message;
    entity.recipientType = dto.recipientType;
    entity.customEmails = dto.customEmails?.trim() || null;
    entity.isScheduled = scheduled;
    entity.scheduleTime =
      scheduled && dto.scheduleTime ? new Date(dto.scheduleTime) : null;
    entity.appId = appId;
    if (Array.isArray(dto.attachmentDetails)) {
      entity.attachmentDetails = dto.attachmentDetails;
      entity.attachments = dto.attachmentDetails.length;
    }

    const recipients = await this.resolveRecipients(appId, dto);
    if (!recipients.length) {
      throw new BadRequestException('Add at least one recipient');
    }

    if (scheduled) {
      if (!entity.scheduleTime || entity.scheduleTime.getTime() <= Date.now()) {
        throw new BadRequestException('Choose a future date and time');
      }
      entity.status = 'scheduled';
      entity.queueToken = randomUUID();
      entity.sentAt = null;
      entity.recipients = recipients.length;
      entity.received = 0;
      entity.bounced = 0;
      entity.recipientDetails = recipients.map((person) => ({
        ...person,
        status: 'scheduled',
      })) as EmailBroadcast['recipientDetails'];
      const saved = await this.repo.save(entity);
      await this.enqueue(saved, recipients, saved.scheduleTime);
      return this.toResponse(saved);
    }

    entity.scheduleTime = null;
    await this.deliver(entity, recipients);
    return this.toResponse(await this.repo.save(entity));
  }

  async listRecipients() {
    const { appId } = this.companyContext();
    const people = await this.companyUsers(appId);
    return {
      message: 'Recipients retrieved successfully',
      data: people,
    };
  }

  async markSent(id: number) {
    const { appId } = this.companyContext();
    const found = await this.repo.findOne({ where: { id, appId } });
    if (!found) throw new NotFoundException('Email broadcast not found');
    const recipients: Recipient[] = (found.recipientDetails || []).map(
      (person) => ({
        userId: person.userId ? Number(person.userId) : undefined,
        name: String(person.name || person.email || ''),
        email: String(person.email || ''),
      }),
    );
    if (!recipients.length) {
      throw new BadRequestException('This broadcast has no recipients');
    }
    found.isScheduled = false;
    found.scheduleTime = null;
    await this.hybridQueue.cancelBroadcastJobs(found.id).catch(() => undefined);
    await this.deliver(found, recipients);
    return this.toResponse(await this.repo.save(found));
  }

  private async deliver(entity: EmailBroadcast, recipients: Recipient[]) {
    let received = 0;
    let bounced = 0;
    const details: Recipient[] = [];

    for (const person of recipients) {
      try {
        await this.mailService.sendHtml(
          person.email,
          entity.subject,
          entity.message,
        );
        received += 1;
        details.push({ ...person, status: 'delivered' });
      } catch {
        bounced += 1;
        details.push({ ...person, status: 'bounced' });
      }
    }

    entity.recipients = recipients.length;
    entity.received = received;
    entity.bounced = bounced;
    entity.recipientDetails = details as EmailBroadcast['recipientDetails'];
    entity.status = received === 0 ? 'failed' : 'sent';
    entity.sentAt = new Date();
  }

  private async enqueue(
    broadcast: EmailBroadcast,
    recipients: Recipient[],
    runAt: Date | null,
  ) {
    const when = runAt ? new Date(runAt) : null;
    try {
      await this.hybridQueue.cancelBroadcastJobs(broadcast.id);
      await Promise.all(
        recipients.map((person) =>
          this.hybridQueue.publishBroadcastEmailJob(
            {
              kind: 'broadcast',
              broadcastId: broadcast.id,
              to: person.email,
              name: person.name,
              userId: person.userId,
            subject: broadcast.subject,
            html: broadcast.message,
            queueToken: broadcast.queueToken,
          },
            when || undefined,
          ),
        ),
      );
    } catch {
      broadcast.status = 'failed';
      await this.repo.save(broadcast);
      throw new BadRequestException(
        'The email queue is unavailable, so this broadcast was not scheduled',
      );
    }
  }

  private async companyUsers(appId: number, userIds?: number[]) {
    const params: number[] = [appId];
    let idFilter = '';
    if (userIds?.length) {
      idFilter = ` AND u.id IN (${userIds.map(() => '?').join(', ')})`;
      params.push(...userIds);
    }
    const rows = (await this.repo.query(
      `SELECT u.id AS userId, u.email AS email, u.first_name AS firstName, u.last_name AS lastName
       FROM users u
       INNER JOIN app_users au ON au.user_id = u.id
       WHERE au.app_id = ?
         AND u.deleted_at IS NULL
         AND u.email IS NOT NULL
         AND u.email <> ''
         ${idFilter}
       ORDER BY u.first_name ASC, u.last_name ASC`,
      params,
    )) as Array<{
      userId: number;
      email: string;
      firstName: string;
      lastName: string;
    }>;

    return rows.map((row) => ({
      userId: Number(row.userId),
      email: row.email,
      name: `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.email,
    }));
  }

  private async resolveRecipients(
    appId: number,
    dto: SaveEmailBroadcastDto,
  ): Promise<Recipient[]> {
    if (dto.recipientType === 'custom') {
      const emails = (dto.customEmails || '')
        .split(/[,;\s]+/)
        .map((email) => email.trim())
        .filter(Boolean);
      return emails.map((email) => ({ name: email, email }));
    }

    if (dto.recipientType === 'selected') {
      const ids = (dto.recipientUserIds || [])
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id));
      if (!ids.length) return [];
      return this.companyUsers(appId, ids);
    }

    return this.companyUsers(appId);
  }

  async remove(id: number) {
    const { appId } = this.companyContext();
    const found = await this.repo.findOne({ where: { id, appId } });
    if (!found) throw new NotFoundException('Email broadcast not found');
    await this.hybridQueue.cancelBroadcastJobs(id);
    await this.repo.softDelete(id);
    return { message: 'Email broadcast deleted' };
  }
}
