import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestContext } from '@common/request-context';
import { EmailTemplate } from './entities/email-template.entity';
import { SaveEmailTemplateDto } from './dto/email-template.dto';

type ListQuery = {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  category?: string;
  isDefault?: string;
};

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly repo: Repository<EmailTemplate>,
  ) {}

  private companyContext(): { appId: number; userId: number | null } {
    const appId = Number(RequestContext.get('activeAppId'));
    const userId = Number(RequestContext.get('userId')) || null;
    if (!appId) {
      throw new BadRequestException('Active company is required');
    }
    return { appId, userId };
  }

  private extractVariables(content: string): string[] {
    const found = new Set<string>();
    const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    let match = regex.exec(content || '');
    while (match) {
      found.add(match[1]);
      match = regex.exec(content || '');
    }
    return Array.from(found);
  }

  private async list(
    scope: 'master' | 'company',
    appId: number | null,
    query: ListQuery,
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));

    const qb = this.repo
      .createQueryBuilder('template')
      .where('template.scope = :scope', { scope });

    if (scope === 'company') {
      qb.andWhere('template.appId = :appId', { appId });
    } else {
      qb.andWhere('template.appId IS NULL');
    }

    if (query.search) {
      qb.andWhere(
        '(template.name LIKE :search OR template.subject LIKE :search OR template.description LIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }
    if (query.status) {
      qb.andWhere('template.status = :status', { status: query.status });
    }
    if (query.category) {
      qb.andWhere('template.category = :category', {
        category: query.category,
      });
    }
    if (query.isDefault === 'true' || query.isDefault === 'false') {
      qb.andWhere('template.isDefault = :isDefault', {
        isDefault: query.isDefault === 'true' ? 1 : 0,
      });
    }

    qb.orderBy('template.updatedAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [rows, total] = await qb.getManyAndCount();
    return {
      message: 'Email templates retrieved successfully',
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

  private toResponse(row: EmailTemplate) {
    return {
      ...row,
      availableForSubscriber: Boolean(row.availableForSubscriber),
      isDefault: Boolean(row.isDefault),
      variables: Array.isArray(row.variables) ? row.variables : [],
      usedCount: 0,
    };
  }

  private async clearOtherDefaults(
    scope: 'master' | 'company',
    appId: number | null,
    exceptId?: number,
  ) {
    const qb = this.repo
      .createQueryBuilder()
      .update(EmailTemplate)
      .set({ isDefault: false })
      .where('scope = :scope', { scope })
      .andWhere('is_default = 1');

    if (scope === 'company') {
      qb.andWhere('app_id = :appId', { appId });
    } else {
      qb.andWhere('app_id IS NULL');
    }
    if (exceptId) {
      qb.andWhere('id != :exceptId', { exceptId });
    }
    await qb.execute();
  }

  async listMaster(query: ListQuery) {
    return this.list('master', null, query);
  }

  async listCompany(query: ListQuery) {
    const { appId } = this.companyContext();
    return this.list('company', appId, query);
  }

  async listImportable() {
    const rows = await this.repo.find({
      where: {
        scope: 'master',
        availableForSubscriber: true,
      },
      order: { name: 'ASC' },
    });
    return rows.map((row) => this.toResponse(row));
  }

  async saveMaster(dto: SaveEmailTemplateDto, id?: number) {
    const userId = Number(RequestContext.get('userId')) || null;
    let entity: EmailTemplate;
    if (id) {
      const found = await this.repo.findOne({
        where: { id, scope: 'master' },
      });
      if (!found) throw new NotFoundException('Master template not found');
      entity = found;
    } else {
      entity = this.repo.create({
        scope: 'master',
        appId: null,
        createdBy: userId,
      });
    }

    this.applyDto(entity, dto, true);
    if (entity.isDefault) {
      const saved = await this.repo.save(entity);
      await this.clearOtherDefaults('master', null, saved.id);
      return this.toResponse(saved);
    }
    return this.toResponse(await this.repo.save(entity));
  }

  async deleteMaster(id: number) {
    const found = await this.repo.findOne({ where: { id, scope: 'master' } });
    if (!found) throw new NotFoundException('Master template not found');
    await this.repo.softDelete(id);
    return { message: 'Master template deleted' };
  }

  async saveCompany(dto: SaveEmailTemplateDto, id?: number) {
    const { appId, userId } = this.companyContext();
    let entity: EmailTemplate;
    if (id) {
      const found = await this.repo.findOne({
        where: { id, scope: 'company', appId },
      });
      if (!found) throw new NotFoundException('Email template not found');
      entity = found;
    } else {
      entity = this.repo.create({
        scope: 'company',
        appId,
        createdBy: userId,
        availableForSubscriber: false,
      });
    }

    this.applyDto(entity, dto, false);
    entity.appId = appId;
    entity.scope = 'company';
    entity.availableForSubscriber = false;

    if (entity.isDefault) {
      const saved = await this.repo.save(entity);
      await this.clearOtherDefaults('company', appId, saved.id);
      return this.toResponse(saved);
    }
    return this.toResponse(await this.repo.save(entity));
  }

  async deleteCompany(id: number) {
    const { appId } = this.companyContext();
    const found = await this.repo.findOne({
      where: { id, scope: 'company', appId },
    });
    if (!found) throw new NotFoundException('Email template not found');
    await this.repo.softDelete(id);
    return { message: 'Email template deleted' };
  }

  async importMaster(masterId: number) {
    const { appId, userId } = this.companyContext();
    const master = await this.repo.findOne({
      where: { id: masterId, scope: 'master' },
    });
    if (!master) throw new NotFoundException('Master template not found');
    if (!master.availableForSubscriber) {
      throw new BadRequestException(
        'This master template is not available for subscribers',
      );
    }

    const copy = this.repo.create({
      appId,
      scope: 'company',
      availableForSubscriber: false,
      sourceTemplateId: master.id,
      name: master.name,
      subject: master.subject,
      description: master.description,
      category: master.category,
      status: 'draft',
      isDefault: false,
      content: master.content,
      variables: master.variables,
      createdBy: userId,
    });
    return this.toResponse(await this.repo.save(copy));
  }

  private applyDto(
    entity: EmailTemplate,
    dto: SaveEmailTemplateDto,
    isMaster: boolean,
  ) {
    entity.name = dto.name.trim();
    entity.subject = dto.subject.trim();
    entity.description = dto.description?.trim() || null;
    entity.category = dto.category;
    entity.status = dto.status;
    entity.isDefault = Boolean(dto.isDefault);
    entity.content = dto.content;
    entity.variables = this.extractVariables(dto.content);
    if (isMaster) {
      entity.availableForSubscriber = Boolean(dto.availableForSubscriber);
      entity.appId = null;
      entity.scope = 'master';
    }
  }
}
