import { Transform, TransformFnParams } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'website_contents', synchronize: false })
export class WebsiteContent {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
    unsigned: true,
  })
  @Transform((params: TransformFnParams) => Number(params.value))
  id: number;

  @Index('idx_website_contents_section_key')
  @Column({
    name: 'section_key',
    type: 'varchar',
    length: 100,
  })
  sectionKey: string;

  @Index('idx_website_contents_slug', { unique: true })
  @Column({
    name: 'slug',
    type: 'varchar',
    length: 150,
  })
  slug: string;

  /** meta = section header, item = card/row */
  @Column({
    name: 'content_type',
    type: 'varchar',
    length: 20,
    default: 'item',
  })
  contentType: 'meta' | 'item';

  @Column({
    name: 'eyebrow',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  eyebrow?: string | null;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'icon_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  iconUrl?: string | null;

  @Column({
    name: 'preview_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  previewUrl?: string | null;

  @Column({
    name: 'preview_bg',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  previewBg?: string | null;

  @Column({
    name: 'features',
    type: 'json',
    nullable: true,
  })
  features?: string[] | null;

  @Column({
    name: 'cta_label',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  ctaLabel?: string | null;

  @Column({
    name: 'cta_href',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  ctaHref?: string | null;

  @Column({
    name: 'accent_color',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  accentColor?: string | null;

  @Column({
    name: 'icon_bg',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  iconBg?: string | null;

  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder: number;

  @Index('idx_website_contents_is_active')
  @Column({
    name: 'is_active',
    type: 'tinyint',
    width: 1,
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isActive: boolean;

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
