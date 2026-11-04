import { Transform, TransformFnParams } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'blogs' })
export class Blog {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
    unsigned: true,
  })
  @Transform((params: TransformFnParams) => Number(params.value))
  id: number;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Index('idx_blogs_slug', { unique: true })
  @Column({
    name: 'slug',
    type: 'varchar',
    length: 255,
  })
  slug: string;

  @Index('idx_blogs_category')
  @Column({
    name: 'category',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  category?: string;

  @Column({
    name: 'excerpt',
    type: 'text',
    nullable: true,
  })
  excerpt?: string;

  @Column({
    name: 'content',
    type: 'longtext',
    nullable: true,
  })
  content?: string;

  @Column({
    name: 'cover_image',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  coverImage?: string;

  @Column({
    name: 'seo_title',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  seoTitle?: string;

  @Column({
    name: 'seo_description',
    type: 'varchar',
    length: 320,
    nullable: true,
  })
  seoDescription?: string;

  @Column({
    name: 'seo_keywords',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  seoKeywords?: string;

  @Column({
    name: 'og_image',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  ogImage?: string;

  @Column({
    name: 'canonical_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  canonicalUrl?: string;

  @Column({
    name: 'no_index',
    type: 'tinyint',
    width: 1,
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  noIndex: boolean;

  @Column({
    name: 'author_name',
    type: 'varchar',
    length: 150,
    nullable: true,
    default: 'Sanzio Team',
  })
  authorName?: string;

  @Column({
    name: 'author_role',
    type: 'varchar',
    length: 150,
    nullable: true,
    default: 'Product',
  })
  authorRole?: string;

  @Column({
    name: 'read_time',
    type: 'varchar',
    length: 50,
    nullable: true,
    default: '4 min read',
  })
  readTime?: string;

  @Index('idx_blogs_is_published')
  @Column({
    name: 'is_published',
    type: 'tinyint',
    width: 1,
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isPublished: boolean;

  @Index('idx_blogs_published_at')
  @Column({
    name: 'published_at',
    type: 'datetime',
    nullable: true,
  })
  publishedAt?: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: 0,
    nullable: true,
  })
  createdAt: Date | null;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    precision: 0,
    nullable: true,
  })
  updatedAt: Date | null;
}
