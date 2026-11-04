import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'user_google_tokens' })
export class UserGoogleToken {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({
    name: 'user_id',
    type: 'int',
    unsigned: true,
    unique: true,
  })
  userId: number;

  @Column({ name: 'access_token', type: 'text', nullable: true })
  accessToken: string | null;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken: string | null;

  @Column({ name: 'token_expiry', type: 'datetime', nullable: true })
  tokenExpiry: Date | null;

  @Column({ name: 'scope', type: 'varchar', length: 512, nullable: true })
  scope: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
