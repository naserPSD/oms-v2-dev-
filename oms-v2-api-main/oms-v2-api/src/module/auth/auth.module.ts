import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthOtp } from './entites/auth_otp.entity';
import { PasswordReset } from './entites/password_reset.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';

import { UserContextService } from './user-context.service';
import { User } from '@module/users/entities/user.entity';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@module/users/users.module';
import { JwtStrategy } from '@core/guards/jwt.strategy';
import { GoogleStrategy } from '@core/strategy/google.strategy';
import { FacebookStrategy } from '@core/strategy/facebook.strategy';
import googleOauthConfig from '@config/google-Oauth.config';
import facebookOatuthConfig from '@config/facebook-oatuth.config';
import { MailModule } from 'src/mail/mail.module';
import { DbConfigsModule } from '@module/db-configs/db-configs.module';
import { DbConfig } from '@module/db-configs/entities/db-config.entity';
import { Status } from '@module/status/entities/status.entity';
import { Country } from '@module/country/entities/country.entity';
import { UserLanguageProficiency } from '@module/users/entities/user-language-proficiency.entity';
import { UserContactInfo } from '@module/users/entities/user-contact-info.entity';
import { UserWorkExperience } from '@module/users/entities/user-work-experience.entity';
import { UserSkill } from '@module/users/entities/user-skill.entity';
import { UserCertification } from '@module/users/entities/user-certification.entity';
import { UserProject } from '@module/users/entities/user-project.entity';
import { UserTraining } from '@module/users/entities/user-training.entity';
import { UserReference } from '@module/users/entities/user-reference.entity';
import { CacheService } from 'src/redis/cache.service';
import { RequestContext } from '@common/request-context';
import { HybridQueueModule } from 'src/queue/hybrid-queue.module';
import { EmpInvitation } from '@module/hr-management/entities/employee-invitations.entity';
import { AuditLogService } from '@module/audit-log/audit-log.service';
import { AuditLogModule } from '@module/audit-log/audit-log.module';
import { Permission } from '@module/role-permission/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      AuthOtp,
      Status,
      Country,
      UserLanguageProficiency,
      UserContactInfo,
      UserWorkExperience,
      PasswordReset,
      DbConfig,
      UserSkill,
      UserCertification,
      UserProject,
      UserTraining,
      UserReference,
      EmpInvitation,
      Permission,
    ]), // ✅ Make sure User is here
    // ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '90d' },
    }),
    forwardRef(() => PassportModule),
    forwardRef(() => UsersModule),
    forwardRef(() => MailModule),
    forwardRef(() => DbConfigsModule),
    forwardRef(() => HybridQueueModule),
    forwardRef(() => AuditLogModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    MailService,
    JwtAuthGuard,
    UserContextService,
    RequestContext,
    CacheService,
    // AuditLogService,
  ],
  exports: [AuthService, JwtAuthGuard, JwtModule, UserContextService], // ✅ Export everything needed
})
export class AuthModule {}
