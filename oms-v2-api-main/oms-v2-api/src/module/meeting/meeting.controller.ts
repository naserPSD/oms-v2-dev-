import { Public } from '@common/decorators/public.decorator';
import { RequestContext } from '@common/request-context';
import { UserContextService } from '@module/auth/user-context.service';
import googleMeetConfig from '@config/google-meet.config';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigType } from '@nestjs/config';
import { Response } from 'express';
import {
  AddAgendaItemDto,
  CreateMeetingDto,
  RespondInvitationDto,
  SaveMeetingNoteDto,
  UpdateAgendaItemDto,
  UpdateAttendanceDto,
  UpdateMeetingStatusDto,
} from './dto/create-meeting.dto';
import { GoogleCalendarService } from './google-calendar.service';
import { MeetingService } from './meeting.service';

@ApiTags('Meetings')
@ApiBearerAuth('access_token')
@Controller('api/v1/meetings')
export class MeetingController {
  constructor(
    private readonly meetingService: MeetingService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly userContext: UserContextService,
    @Inject(googleMeetConfig.KEY)
    private readonly meetConfig: ConfigType<typeof googleMeetConfig>,
  ) {}

  private resolveAuthUserId(): number {
    const userId =
      this.userContext.getUserId() ||
      RequestContext.get<number>('userId') ||
      null;
    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }
    return Number(userId);
  }

  @Get('google/connect-url')
  @ApiOperation({ summary: 'Get Google Calendar OAuth URL for Meet links' })
  async getGoogleConnectUrl() {
    const userId = this.resolveAuthUserId();
    const url = this.googleCalendarService.buildConnectUrl(userId);
    return {
      message: 'Google Calendar connect URL generated',
      data: { url },
    };
  }

  @Public()
  @Get('google/callback')
  @ApiOperation({ summary: 'Google Calendar OAuth callback' })
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const userId = await this.googleCalendarService.handleOAuthCallback(
      code,
      state,
    );
    const redirect = `${this.meetConfig.frontendUrl}/hr-dashboard/meeting?googleCalendar=connected`;
    res.redirect(redirect);
    return { userId };
  }

  @Public()
  @Get('join')
  @ApiOperation({ summary: 'Auto-record attendance from email link and redirect' })
  async joinFromEmail(
    @Query('token') token: string,
    @Query('type') type: string,
    @Res() res: Response,
  ) {
    const result = await this.meetingService.handleEmailJoin(token, type);
    res.redirect(result.redirectUrl);
  }

  @Get('google/status')
  @ApiOperation({ summary: 'Check if Google Calendar is connected' })
  async googleStatus() {
    const userId = this.resolveAuthUserId();
    const status = await this.googleCalendarService.getConnectionStatus(userId);
    return {
      message: status.calendarApiReady
        ? 'Google Calendar ready for Meet links'
        : status.connected
          ? 'Google connected but Calendar API not ready'
          : 'Google Calendar not connected',
      data: status,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List meetings' })
  @ApiQuery({ name: 'tab', required: false, enum: ['today', 'upcoming', 'previous', 'all'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async list(
    @Query('tab') tab?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.meetingService.findAll({
      tab: (tab as any) ?? 'all',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
    return {
      message: 'Meetings fetched successfully',
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get('invitations')
  @ApiOperation({ summary: 'List meeting invitations for current user' })
  async getInvitations() {
    const data = await this.meetingService.findInvitations();
    return { message: 'Invitations fetched successfully', data };
  }

  @Get('participants')
  @ApiOperation({ summary: 'List all available users/participants for meetings from database' })
  async getParticipants() {
    const data = await this.meetingService.findAvailableParticipants();
    return { message: 'Participants fetched successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meeting by id' })
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.meetingService.findOne(id);
    return { message: 'Meeting fetched successfully', data };
  }

  @Post('add-or-update')
  @ApiOperation({ summary: 'Create or update a meeting' })
  async createOrUpdate(@Body() dto: CreateMeetingDto) {
    const data = await this.meetingService.createOrUpdate(dto);
    return {
      message: dto.id
        ? 'Meeting updated successfully'
        : 'Meeting created successfully',
      data,
    };
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start meeting — ensure Google Meet link exists' })
  async start(@Param('id', ParseIntPipe) id: number) {
    const data = await this.meetingService.startMeeting(id);
    return { message: 'Meeting started', data };
  }

  @Post(':id/send-invitation')
  @ApiOperation({ summary: 'Email meeting invitations to attendees' })
  async sendInvitation(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body?: { employeeIds?: number[]; emails?: string[] },
  ) {
    const data = await this.meetingService.sendInvitations(id, body);
    return {
      message:
        data.sent > 0
          ? `Invitation sent to ${data.sent} attendee(s)`
          : 'No invitations were sent',
      data,
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update meeting list status' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMeetingStatusDto,
  ) {
    const data = await this.meetingService.updateStatus(
      id,
      dto.listStatus as any,
    );
    return { message: 'Status updated', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete meeting' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.meetingService.remove(id);
    return { message: 'Meeting deleted successfully' };
  }

  @Get(':id/notes')
  @ApiOperation({ summary: 'Get private notes for current user' })
  async getNotes(@Param('id', ParseIntPipe) id: number) {
    const data = await this.meetingService.getNote(id);
    return { message: 'Notes fetched', data };
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Save private notes for current user' })
  async saveNotes(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SaveMeetingNoteDto,
  ) {
    const data = await this.meetingService.saveNote(id, dto.content);
    return { message: 'Notes saved', data };
  }

  @Patch(':id/attendance')
  @ApiOperation({ summary: 'Update attendee attendance (HR)' })
  async updateAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceDto,
  ) {
    const data = await this.meetingService.updateAttendance(
      id,
      dto.employeeId,
      dto.attendance,
      dto.attendeeId,
      dto.email,
    );
    return { message: 'Attendance updated', data };
  }

  @Post(':id/respond-invitation')
  @ApiOperation({ summary: 'Accept or decline meeting invitation' })
  async respondInvitation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RespondInvitationDto,
  ) {
    const data = await this.meetingService.respondInvitation(id, dto.status);
    return { message: `Invitation ${dto.status}`, data };
  }

  @Post(':id/agendas')
  @ApiOperation({ summary: 'Add agenda item to meeting' })
  async addAgenda(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddAgendaItemDto,
  ) {
    const data = await this.meetingService.addAgendaItem(id, dto.text);
    return { message: 'Agenda item added', data };
  }

  @Patch(':id/agendas/:agendaId')
  @ApiOperation({ summary: 'Update agenda item in meeting' })
  async updateAgenda(
    @Param('id', ParseIntPipe) id: number,
    @Param('agendaId', ParseIntPipe) agendaId: number,
    @Body() dto: UpdateAgendaItemDto,
  ) {
    const data = await this.meetingService.updateAgendaItem(id, agendaId, dto);
    return { message: 'Agenda item updated', data };
  }

  @Delete(':id/agendas/:agendaId')
  @ApiOperation({ summary: 'Delete agenda item from meeting' })
  async deleteAgenda(
    @Param('id', ParseIntPipe) id: number,
    @Param('agendaId', ParseIntPipe) agendaId: number,
  ) {
    const data = await this.meetingService.deleteAgendaItem(id, agendaId);
    return { message: 'Agenda item deleted', data };
  }
}
