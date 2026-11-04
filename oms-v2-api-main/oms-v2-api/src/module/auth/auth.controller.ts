// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Res,
  HttpStatus,
  HttpCode,
  Req,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  UserRegisterRequestDto,
  UserRegisterRequestSwagger,
} from './dto/user-register-request.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginRequestDto, UserLogoutDto } from './dto/login-request.dto';
import {
  ForgotPasswordDto,
  ForgotPasswordDoc,
} from './dto/forgot-password.dto';
import {
  ResetPasswordDto,
  ResetPasswordDoc,
  VerifyOtpDto,
  verifyOTPDoc,
  ChangePasswordDto,
  ChangePasswordDoc,
} from './dto/reset-password.dto';

import { UserContextService } from './user-context.service';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { tz } from 'moment-timezone';
import { ApiStandardResponses } from '@core/utils/api-standard-responses.decorator';
import { User } from '@module/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { GoogleAuthGuard } from '@core/guards/google-auth/google-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { FacebookAuthGuard } from '@core/guards/facebook-auth/facebook-auth.guard';
import { Request, Response } from 'express';
import { LoginResponseDto } from './dto/login-response-dto';
import { Public } from '@common/decorators/public.decorator';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userContextService: UserContextService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Get('check-email')
  @ApiOperation({ summary: 'Check if email already exists' })
  async checkEmail(@Query('email') email: string) {
    const result = await this.authService.checkEmailExists(email);
    return {
      message: result.message,
      data: result,
    };
  }

  @Public()
  @Post('check-email')
  @ApiOperation({ summary: 'Check if email already exists' })
  async checkEmailPost(@Body('email') email: string) {
    const result = await this.authService.checkEmailExists(email);
    return {
      message: result.message,
      data: result,
    };
  }

  @Public()
  @Post('register')
  @ApiBody({ type: UserRegisterRequestSwagger })
  @ApiStandardResponses('User registered successfully')
  async register(@Body() body: UserRegisterRequestSwagger) {
    // return this.authService.register(body);
    body.lastTimezone = tz.guess();

    const result = await this.authService.register(body);

    return {
      message: 'Login successful',
      data: result,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User Login' })
  @ApiBody({ type: LoginRequestDto })
  @ApiStandardResponses('Login successful')
  async login(@Req() req, @Body() body: LoginRequestDto) {
    body.lastTimezone = tz.guess();
    const ipAddress = (
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket?.remoteAddress ||
      req.ip
    ).replace(/^::1$/, '127.0.0.1');

    body.userAgent = req.headers['user-agent'];
    body.ipAddress = ipAddress;

    const result = await this.authService.login(body);

    return {
      message: 'Login successful',
      data: result, // Nest result under data to match frontend expectations
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiStandardResponses('Set active app successfully')
  @Post('set-active-app-user')
  async setActiveAppUser(@Body() body: { activeAppId: number }, @Req() req) {
    const user: User = req.user;
    return await this.authService.setActiveAppUser(user, body.activeAppId);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string; sessionId: string }) {
    return this.authService.refreshToken(body.refreshToken, body.sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiStandardResponses('Auth User Info retrieved successfully')
  @Post('user-logout')
  async userLogout(@Body() body: UserLogoutDto, @Req() req) {
    const user: User = req.user;
    return await this.authService.userLogout(user, body.sessionId);
  }

  @Get('me')
  @ApiStandardResponses('Auth User Info retrieved successfully')
  getMyProfile(@Req() req) {
    return { user: req.user };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @Post('send-verification-otp')
  @ApiOperation({ summary: 'Verify' })
  async sendverifyAccountEmail() {
    return this.authService.sendVerifyEmail(); // single responsibility
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @Post('verify-account')
  @ApiOperation({ summary: 'Verify' })
  @ApiBody({ type: verifyOTPDoc })
  async userAccountVerify(@Body() body: VerifyOtpDto) {
    return this.authService.verifyEmailOTP(body); // single responsibility
  }

  @Public()
  @Post('forget-password')
  @ApiOperation({ summary: 'Send password reset link to email' })
  @ApiBody({ type: ForgotPasswordDoc })
  async forgot(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  @Public()
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP for password reset' })
  // @ApiBody({ type: ForgotPasswordDoc })
  // @ApiBody()
  async verify_otp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body);
  }

  @Public()
  @Post('verify-otp-for-email-verification')
  @ApiOperation({ summary: 'Verify OTP for email verification' })
  // @ApiBody({ type: ForgotPasswordDoc })
  // @ApiBody()
  async verifyOtpForEmailVerification(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtpForEmailVerification(body);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password with token' })
  @ApiBody({ type: ResetPasswordDoc })
  async reset(@Body() body: ResetPasswordDto) {
    // return body;
    return this.authService.resetPassword(body);
  }

  @Public()
  @Post('reset-first-password')
  @ApiOperation({ summary: 'Reset user first password' })
  @ApiBody({ type: ResetPasswordDoc })
  async resetFirstPassword(@Body() body: ResetPasswordDto) {
    // return body;
    return this.authService.resetFirstPassword(body);
  }

  @Post('/change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordDoc })
  async changePassword(@Body() body: ChangePasswordDto) {
    // return body;
    return this.authService.changePassword(body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiStandardResponses('Auth User Info retrieved successfully')
  @Get('auth-user-info')
  async getAuthUserInfo(@Req() req) {
    const user: User = req.user;
    console.log('Auth User Info Request for user:', user);
    const headerSessionId = req.headers?.['x-session-id'];
    const result = await this.authService.authUserInfo(
      user,
      typeof headerSessionId === 'string' &&
        headerSessionId !== 'undefined' &&
        headerSessionId !== 'null'
        ? headerSessionId
        : undefined,
    );

    return {
      message: 'Auth User Info retrieved successfully',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiStandardResponses('User profile')
  @Get('profile')
  getProfile() {
    return {
      status: 'success',
      message: 'Users retrieved successfully',
      data: this.userContextService.getUser(),
    };
  }

  @Public()
  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  // @UseGuards(GoogleAuthGuard)
  googleLogin(@Req() req) {
    return req.user;
  }

  @Public()
  @Get('google/oauth/callback')
  @ApiOperation({ summary: 'Google OAuth Callback' })
  @UseGuards(AuthGuard('google'))
  async googleCallbackPopup(@Req() req: Request, @Res() res: Response) {
    const user = req.user;

    if (!user || !user['email']) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Google authentication failed. No user data received.',
      });
    }

    const input = new UserRegisterRequestSwagger();
    input.firstName = user['firstName'];
    input.lastName = user['lastName'];
    input.email = user['email'];
    input.password = user['id'];
    input.confirmPassword = user['id'];
    input.lastTimezone = tz.guess();

    const result: LoginResponseDto =
      await this.authService.registerWithSocialData(input);

    // Send token and user info to the opener window and close the popup
    res.send(`
    <html>
      <body>
        <script>
          const data = ${JSON.stringify({
            accessToken: result.accessToken,
            user: result.user,
            tokenType: result.tokenType,
            permissions: result.permissions,
          })};
          window.opener.postMessage(data, "${process.env.FRONTEND_URL}");
          window.close();
          setTimeout(() => window.close(), 100); // Slight delay; // Close the popup after a short delay
        </script>
      </body>
    </html>
  `);
  }

  @Public()
  @Get('google/oauth/callback-redirect')
  @ApiOperation({ summary: 'Google OAuth Callback' })
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user;

    if (!user || !user['email']) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Google authentication failed. No user data received.',
      });
    }

    const input = new UserRegisterRequestSwagger();
    input.firstName = user['firstName'];
    input.lastName = user['lastName'];
    input.email = user['email'];
    input.password = user['id']; // Use Google ID as password
    input.confirmPassword = user['id']; // Use Google ID as confirm password
    input.lastTimezone = tz.guess(); // Get the user's timezone

    const result: LoginResponseDto =
      await this.authService.registerWithSocialData(input);

    res.redirect(
      `${process.env.FRONTEND_URL}/login-success?token=${result.accessToken}&email=${user['email']}&name=${user['name']}&picture=${user['picture']}`,
    );
  }

  @Public()
  @Get('facebook/login')
  @UseGuards(AuthGuard('facebook'))
  facebookLogin() {}

  @Public()
  @Get('facebook/oauth/callback')
  // @UseGuards(FacebookAuthGuard)
  @UseGuards(AuthGuard('facebook'))
  async facebookCallbackPopup(@Req() req: Request, @Res() res: Response) {
    const user = req.user;

    if (!user || !user['email']) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Google authentication failed. No user data received.',
      });
    }

    const input = new UserRegisterRequestSwagger();
    input.firstName = user['firstName'];
    input.lastName = user['lastName'];
    input.email = user['email'];
    input.password = user['id'];
    input.confirmPassword = user['id'];
    input.lastTimezone = tz.guess();

    const result: LoginResponseDto =
      await this.authService.registerWithSocialData(input);

    res.send(`
        <html>
          <body>
            <script>
              const data = ${JSON.stringify({
                accessToken: result.accessToken,
                user: result.user,
                tokenType: result.tokenType,
                permissions: result.permissions,
              })};
              window.opener.postMessage(data, "${process.env.FRONTEND_URL}");
              window.close();
              setTimeout(() => window.close(), 100); // Slight delay; // Close the popup after a short delay
            </script>
          </body>
        </html>
      `);
  }

  @Get('facebook/oauth/callback-redirect')
  // @UseGuards(FacebookAuthGuard)
  @UseGuards(AuthGuard('facebook'))
  async facebookCallbackRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user;

    if (!user || !user['email']) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Google authentication failed. No user data received.',
      });
    }

    const input = new UserRegisterRequestSwagger();
    input.firstName = user['firstName'];
    input.lastName = user['lastName'];
    input.email = user['email'];
    input.password = user['id'];
    input.confirmPassword = user['id'];
    input.lastTimezone = tz.guess();

    const result: LoginResponseDto =
      await this.authService.registerWithSocialData(input);

    res.redirect(
      `${process.env.FRONTEND_URL}/login-success?token=${result.accessToken}&email=${user['email']}&name=${user['name']}&picture=${user['picture']}`,
    );
  }
}
