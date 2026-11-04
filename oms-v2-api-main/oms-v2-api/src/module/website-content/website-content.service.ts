import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { APIFeatures } from '@core/utils/apiFeatures';
import { Repository } from 'typeorm';
import { CreateOrUpdateWebsiteContentDto } from './dto/website-content.dto';
import { WebsiteContent } from './entities/website-content.entity';

@Injectable()
export class WebsiteContentService {
  constructor(
    @InjectRepository(WebsiteContent)
    private readonly contentRepo: Repository<WebsiteContent>,
  ) {}

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private async ensureUniqueSlug(baseSlug: string, excludeId?: number) {
    let slug = baseSlug;
    let counter = 2;
    while (true) {
      const existing = await this.contentRepo.findOne({ where: { slug } });
      if (!existing || (excludeId && existing.id === excludeId)) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }
  }

  async findBySection(sectionKey: string) {
    const rows = await this.contentRepo.find({
      where: { sectionKey, isActive: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });

    const meta = rows.find((row) => row.contentType === 'meta') || null;
    const items = rows.filter((row) => row.contentType === 'item');

    return { meta, items };
  }

  async findAllAdmin(
    queryString: any,
  ): Promise<{ data: WebsiteContent[]; total: number }> {
    const query = this.contentRepo.createQueryBuilder('content');

    const params = queryString?.params
      ? typeof queryString.params === 'string'
        ? JSON.parse(queryString.params)
        : queryString.params
      : {};

    if (params.search) {
      query.andWhere(
        `(content.title LIKE :search OR content.slug LIKE :search OR content.sectionKey LIKE :search)`,
        { search: `%${String(params.search).trim()}%` },
      );
    }

    if (params.sectionKey) {
      query.andWhere('content.sectionKey = :sectionKey', {
        sectionKey: String(params.sectionKey).trim(),
      });
    }

    if (params.contentType) {
      query.andWhere('content.contentType = :contentType', {
        contentType: String(params.contentType).trim(),
      });
    }

    if (typeof params.isActive !== 'undefined') {
      const active =
        params.isActive === true ||
        params.isActive === 'true' ||
        params.isActive === 1 ||
        params.isActive === '1';
      query.andWhere('content.isActive = :isActive', { isActive: active });
    }

    const features = new APIFeatures(query, {
      ...queryString,
      sort:
        queryString?.sort && queryString.sort !== 'undefined'
          ? queryString.sort
          : 'sortOrder:asc',
    })
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    const total = await query.getCount();
    return { data, total };
  }

  async findById(id: number): Promise<WebsiteContent> {
    const row = await this.contentRepo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Website content with ID ${id} not found`);
    }
    return row;
  }

  async createOrUpdate(
    dto: CreateOrUpdateWebsiteContentDto,
  ): Promise<WebsiteContent> {
    if (!dto.title?.trim()) {
      throw new BadRequestException('Title is required');
    }
    if (!dto.sectionKey?.trim()) {
      throw new BadRequestException('Section key is required');
    }

    const baseSlug = this.slugify(dto.slug || dto.title);
    if (!baseSlug) {
      throw new BadRequestException('A valid slug is required');
    }

    let row: WebsiteContent;
    if (dto.id) {
      row = await this.findById(dto.id);
      row.slug = await this.ensureUniqueSlug(baseSlug, row.id);
    } else {
      row = this.contentRepo.create();
      row.slug = await this.ensureUniqueSlug(baseSlug);
    }

    row.sectionKey = dto.sectionKey.trim();
    row.contentType = dto.contentType || 'item';
    row.eyebrow = dto.eyebrow?.trim() || null;
    row.title = dto.title.trim();
    row.description = dto.description?.trim() || null;
    row.iconUrl = dto.iconUrl?.trim() || null;
    row.previewUrl = dto.previewUrl?.trim() || null;
    row.previewBg = dto.previewBg?.trim() || null;
    row.features = Array.isArray(dto.features)
      ? dto.features.map((f) => String(f).trim()).filter(Boolean)
      : null;
    row.ctaLabel = dto.ctaLabel?.trim() || null;
    row.ctaHref = dto.ctaHref?.trim() || null;
    row.accentColor = dto.accentColor?.trim() || null;
    row.iconBg = dto.iconBg?.trim() || null;
    row.sortOrder =
      typeof dto.sortOrder === 'number' ? dto.sortOrder : row.sortOrder || 0;
    row.isActive = typeof dto.isActive === 'boolean' ? dto.isActive : true;

    return this.contentRepo.save(row);
  }

  async delete(id: number): Promise<void> {
    const result = await this.contentRepo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Website content with ID ${id} not found`);
    }
  }
}
