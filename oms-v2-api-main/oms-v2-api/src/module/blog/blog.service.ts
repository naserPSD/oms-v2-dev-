import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { APIFeatures } from '@core/utils/apiFeatures';
import { Repository } from 'typeorm';
import { MediaService } from '@module/media/media.service';
import { CreateOrUpdateBlogDto } from './dto/blog.dto';
import { Blog } from './entities/blog.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepo: Repository<Blog>,
    private readonly mediaService: MediaService,
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
      const existing = await this.blogRepo.findOne({ where: { slug } });
      if (!existing || (excludeId && existing.id === excludeId)) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }
  }

  async findAllPublished(
    queryString: any,
  ): Promise<{ data: Blog[]; total: number }> {
    const query = this.blogRepo.createQueryBuilder('blog');
    query.andWhere('blog.isPublished = :isPublished', { isPublished: true });

    const params = queryString?.params
      ? typeof queryString.params === 'string'
        ? JSON.parse(queryString.params)
        : queryString.params
      : {};

    if (params.search) {
      query.andWhere(
        `(blog.title LIKE :search OR blog.excerpt LIKE :search OR blog.category LIKE :search)`,
        { search: `%${String(params.search).trim()}%` },
      );
    }

    if (params.category) {
      query.andWhere('blog.category = :category', {
        category: String(params.category).trim(),
      });
    }

    const features = new APIFeatures(query, queryString)
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async findAllAdmin(
    queryString: any,
  ): Promise<{ data: Blog[]; total: number }> {
    const query = this.blogRepo.createQueryBuilder('blog');

    const params = queryString?.params
      ? typeof queryString.params === 'string'
        ? JSON.parse(queryString.params)
        : queryString.params
      : {};

    if (params.search) {
      query.andWhere(
        `(blog.title LIKE :search OR blog.excerpt LIKE :search OR blog.slug LIKE :search)`,
        { search: `%${String(params.search).trim()}%` },
      );
    }

    if (typeof params.isPublished !== 'undefined') {
      const published =
        params.isPublished === true ||
        params.isPublished === 'true' ||
        params.isPublished === 1 ||
        params.isPublished === '1';
      query.andWhere('blog.isPublished = :isPublished', {
        isPublished: published,
      });
    }

    const features = new APIFeatures(query, queryString)
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async findBySlug(slug: string): Promise<Blog> {
    const blog = await this.blogRepo.findOne({
      where: { slug, isPublished: true },
    });
    if (!blog) {
      throw new NotFoundException(`Blog with slug "${slug}" not found`);
    }
    return blog;
  }

  async findById(id: number): Promise<Blog> {
    const blog = await this.blogRepo.findOne({ where: { id } });
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    return blog;
  }

  async createOrUpdate(dto: CreateOrUpdateBlogDto): Promise<Blog> {
    if (!dto.title?.trim()) {
      throw new BadRequestException('Title is required');
    }

    const baseSlug = this.slugify(dto.slug || dto.title);
    if (!baseSlug) {
      throw new BadRequestException('A valid slug is required');
    }

    let blog: Blog;

    if (dto.id) {
      blog = await this.findById(dto.id);
      blog.slug = await this.ensureUniqueSlug(baseSlug, blog.id);
    } else {
      blog = this.blogRepo.create();
      blog.slug = await this.ensureUniqueSlug(baseSlug);
    }

    blog.title = dto.title.trim();
    blog.category = dto.category?.trim() || undefined;
    blog.excerpt = dto.excerpt?.trim() || undefined;
    blog.content = dto.content ?? undefined;
    blog.coverImage = dto.coverImage?.trim() || undefined;
    blog.seoTitle = dto.seoTitle?.trim() || undefined;
    blog.seoDescription = dto.seoDescription?.trim() || undefined;
    blog.seoKeywords = dto.seoKeywords?.trim() || undefined;
    blog.ogImage = dto.ogImage?.trim() || undefined;
    blog.canonicalUrl = dto.canonicalUrl?.trim() || undefined;
    blog.noIndex =
      typeof dto.noIndex === 'boolean'
        ? dto.noIndex
        : dto.id
          ? !!blog.noIndex
          : false;
    blog.authorName = dto.authorName?.trim() || 'Sanzio Team';
    blog.authorRole = dto.authorRole?.trim() || 'Product';
    blog.readTime = dto.readTime?.trim() || '4 min read';
    blog.isPublished =
      typeof dto.isPublished === 'boolean' ? dto.isPublished : true;
    blog.publishedAt = dto.publishedAt
      ? new Date(dto.publishedAt)
      : blog.publishedAt || new Date();

    return this.blogRepo.save(blog);
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const media = await this.mediaService.uploadFile(file);
    return media.fileUrl;
  }

  async delete(id: number): Promise<void> {
    const result = await this.blogRepo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
  }
}
