// src/scheduler/scheduler.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HybridQueueService } from 'src/queue/hybrid-queue.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { MailService } from 'src/mail/mail.service';
import { HrManagementService } from '@module/hr-management/hr-management.service';
import { CacheService } from 'src/redis/cache.service';
import { Application } from '@module/application/entities/application.entity';
import { Model } from 'mongoose';
import { UserActivity } from '@module/audit-log/schema/user-activity.schema';
import { InjectModel } from '@nestjs/mongoose';

import { ModuleRef } from '@nestjs/core';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly hybridQueue: HybridQueueService,
    // @InjectRepository(UserSubscription)
    // private readonly subscriptionRepo: Repository<UserSubscription>,
    @InjectModel(UserActivity.name)
    private readonly userActivityModel: Model<UserActivity>,

    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,

    private readonly mailService: MailService,
    private readonly cacheService: CacheService,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.logger.log('⏰ SchedulerService initialized');
  }

  /**
   * Runs every day at 9 AM → Send subscription expiry warnings.
   */
  //   @Cron('0 9 * * *', { timeZone: 'Asia/Dhaka' })
  //   async sendSubscriptionWarnings() {
  //     this.logger.log('📅 Checking for expiring subscriptions...');

  //     const today = new Date();
  //     const upcoming = await this.subscriptionRepo.find({
  //       where: [
  //         { expiresAt: LessThan(new Date(today.getTime() + 7 * 86400000)) },
  //       ],
  //       relations: ['user'],
  //     });

  //     for (const sub of upcoming) {
  //       const daysLeft = Math.ceil(
  //         (sub.expiresAt.getTime() - today.getTime()) / 86400000,
  //       );

  //       if ([7, 3, 1].includes(daysLeft)) {
  //         await this.hybridQueue.publishEmailJob({
  //           to: sub.user.email,
  //           subject: `Your subscription expires in ${daysLeft} day(s)`,
  //           template: 'subscription-warning',
  //           context: {
  //             name: sub.user.name,
  //             daysLeft,
  //           },
  //         });
  //         this.logger.log(`📧 Queued subscription warning for ${sub.user.email}`);
  //       }
  //     }
  //   }

  /**
   * Runs every night at 2 AM → Clean old user activity logs.
   */
  @Cron('0 2 * * *', { timeZone: 'Asia/Dhaka' })
  async cleanupOldUserActivity() {
    this.logger.log('🧹 Cleaning user activity older than 5 days...');
    const threshold = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 5 days ago
    const result = await this.userActivityModel
      .deleteMany({
        createdAt: { $lt: threshold },
      })
      .exec();
    this.logger.log(`✅ Deleted ${result.deletedCount} old user activities.`);
    // this.logger.log(`✅ Deleted ${result.affected} old user activity records`);

    // try {
    //   await this.mailService.sendMail(
    //     updatedSubscription.user.email,
    //     isUpdate ? 'Subscription Updated' : 'Subscription Created',
    //     'subscription-details',
    //     {
    //       name: `${updatedSubscription.user.firstName} ${updatedSubscription.user.lastName}`,
    //       planName: updatedSubscription.subscriptionPlan.name,
    //       startDate: Helpers.dDate(updatedSubscription.startDate),
    //       endDate: Helpers.dDate(updatedSubscription.endDate),
    //       price: updatedSubscription.subscriptionPlan.price,
    //       statusName: updatedSubscription.status.name,
    //       emailClosingNote: 'Thank you for using our subscription service.',
    //       supportTeamName: 'Support Team',
    //       isUpdate,
    //     },
    //   );

    // } catch (error) {
    //   console.error('Error sending subscription email:', error);
    // }

    // await this.usersService.createUserNotification(
    //   userId,
    //   `Your subscription for <b>${updatedSubscription.subscriptionPlan.name}</b> is ${updatedSubscription.status.name}`,
    // );
  }

  @Cron('45 * * * * *')
  handleCron() {
    this.logger.debug('Called when the current second is 45');
  }

  // Runs every day at 11 PM
  // @Cron('23 15 * * *', { timeZone: 'Asia/Dhaka' })
  // async runAttendanceAbsent() {
  //   await this.hrService.setEmployeeAttendanceStatusAbsent();
  //   // this.logger.log('📅 Checking for absent employees...');
  // }

  // Runs every day at 11:15 PM
  @Cron('0 15 * * *', { timeZone: 'Asia/Dhaka' })
  async runAttendanceAbsent() {
    const lockKey = 'attendance-absent-lock';

    const acquired = await this.cacheService.acquireLock(
      lockKey,
      10 * 60 * 1000,
    );

    if (!acquired) {
      this.logger.log('Another instance is running this job.');
      return;
    }

    try {
      const applications = await this.applicationRepo.find({
        where: { deletedAt: IsNull() },
        select: ['id'],
      });

      this.logger.log(
        `📅 Queueing attendance processing for ${applications.length} applications...`,
      );

      for (const app of applications) {
        await this.hybridQueue.publishAttendanceJob({
          appId: app.id,
        });
      }

      this.logger.log(
        `✅ Queued ${applications.length} attendance jobs to hybrid queue`,
      );
    } finally {
      await this.cacheService.releaseLock(lockKey);
    }
  }

  @Cron('11 3 * * *', { timeZone: 'Asia/Dhaka' })
  async sendBirthdayEmails() {
    const hrService = await this.moduleRef.resolve(HrManagementService, undefined, { strict: false });
    await hrService.sendBirthdayWishes();
    // this.logger.log('🎂 Sending birthday emails...');
  }
}
