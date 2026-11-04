import googleMeetConfig from '@config/google-meet.config';
import { AuthModule } from '@module/auth/auth.module';
import { Employee } from '@module/hr-management/entities/employees.entity';
import { RolePermissionModule } from '@module/role-permission/role-permission.module';
import { AppUser } from '@module/users/entities/app-user.entity';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { HybridQueueModule } from 'src/queue/hybrid-queue.module';
import { MeetingAgendaItem } from './entities/meeting-agenda-item.entity';
import { MeetingAttendee } from './entities/meeting-attendee.entity';
import { MeetingNote } from './entities/meeting-note.entity';
import { Meeting } from './entities/meeting.entity';
import { UserGoogleToken } from './entities/user-google-token.entity';
import { GoogleCalendarService } from './google-calendar.service';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';

@Module({
  imports: [
    ConfigModule.forFeature(googleMeetConfig),
    TypeOrmModule.forFeature([
      Meeting,
      MeetingAttendee,
      MeetingAgendaItem,
      MeetingNote,
      UserGoogleToken,
      Employee,
      AppUser,
    ]),
    forwardRef(() => AuthModule),
    RolePermissionModule,
    forwardRef(() => MailModule),
    forwardRef(() => HybridQueueModule),
  ],
  controllers: [MeetingController],
  providers: [MeetingService, GoogleCalendarService],
  exports: [MeetingService, GoogleCalendarService],
})
export class MeetingModule {}
