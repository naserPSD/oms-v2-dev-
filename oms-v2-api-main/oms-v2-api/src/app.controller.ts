import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { GoogleAuthGuard } from '@core/guards/google-auth/google-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { FacebookAuthGuard } from '@core/guards/facebook-auth/facebook-auth.guard';
import { SchedulerService } from './scheduler/scheduler.service';
import { Public } from '@common/decorators/public.decorator';

@Controller('')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly jwtService: JwtService,
    private readonly schedulerService: SchedulerService,
  ) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('auth/google/login')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('auth/google/oauth/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req) {
    const user = req.user;
    const token = await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
    });

    return {
      message: 'Login successful',
      access_token: token,
      user: user,
    };
  }
  @UseGuards(AuthGuard('facebook'))
  @Get('auth/facebook/login')
  facebookLogin() {}

  @Get('auth/facebook/oauth/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookCallback(@Req() req) {
    const user = req.user;
    const token = await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
    });

    return {
      message: 'Login successful',
      access_token: token,
      user: user,
    };
  }
  // @Get('api/v1/status/:id')
  // @ApiOkResponse({ description: 'Get status by ID type (user/shipping/office/employee)' })
  // @ApiParam({
  //   name: 'id',
  //   required: false,
  //   description: 'Type of status to retrieve (user/shipping/office/employee)',
  // })
  // getStatusById(@Param('id') id: string) {
  //   return id;
  //   return this.appService.getAllStatuses(id);
  // }

  // @Get('status-group')
  // async getStatusGroup(
  //   @Query('id') id?: number,
  //   @Query('code') code?: string,
  // ) {
  //   if (id || code) {
  //     return this.appService.getSingleStatusGroup({ id, code });
  //   }

  //   return this.appService.getAllStatusGroups();
  // }

  @Get('test-cleanup')
  @Public()
  async testCleanup() {
    await this.schedulerService.cleanupOldUserActivity();
    return { message: 'Cleanup job triggered manually' };
  }

  @Get('attendance-cron')
  @Public()
  async testCron() {
    await this.schedulerService.runAttendanceAbsent();
    return { message: 'Cron job triggered manually' };
  }

  @Get('birthday-cron')
  @Public()
  async testBirthdayCron() {
    await this.schedulerService.sendBirthdayEmails();
    return { message: 'Cron job triggered manually' };
  }

  @Get('health')
  @Public()
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
