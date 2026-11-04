import { Application } from '@module/application/entities/application.entity';
import { User } from '@module/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum OtpType {
  LOGIN = 'login',
  RESET_PASSWORD = 'reset_password',
  EMAIL_VERIFICATION = 'email_verification',
}

export enum OtpChannel {
  EMAIL = 'email',
  PHONE = 'phone',
}
@Entity('auth_otp')
export class AuthOtp {
  @PrimaryGeneratedColumn({ name: 'id', unsigned: true, type: 'int' })
  id: number;

  @Column({ name: 'user_id', type: 'int', unsigned: true })
  userId: number;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Unique(['sessionId'])
  @Column({ name: 'session_id', type: 'varchar', length: 255 })
  sessionId: string;

  @Column({ name: 'otp_type', type: 'enum', enum: OtpType })
  otpType: OtpType;

  @Column({ name: 'otp_channel', type: 'enum', enum: OtpChannel })
  otpChannel: OtpChannel;

  @Column({ name: 'otp', type: 'varchar', length: 20 })
  otp: string;

  @Column({ name: 'expired_at', type: 'datetime', nullable: true })
  expiredAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;
}
