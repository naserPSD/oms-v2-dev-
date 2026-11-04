import { User } from '@module/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'Access token' })
  accessToken: string;

  @ApiProperty({ description: 'Session id' })
  sessionId: string;

  @ApiProperty({ example: 'Bearer', description: 'Token type' })
  tokenType: string;

  // @ApiProperty( { description: 'Refresh token' } )
  refreshToken: string;

  @ApiProperty({
    name: 'user',
    type: User,
    description: 'User data',
  })
  user: any;

  @ApiProperty({
    name: 'permissions',
    type: Array,
    description: 'User permissions code',
  })
  permissions: string[];

  @ApiProperty({
    name: 'LeftSidebarMenu',
  })
  leftSidebarMenu: any;

  @ApiProperty({
    name: 'NavbarMenu',
  })
  navbarMenu: any;

  @ApiProperty({
    name: 'PublicPermissions',
  })
  publicPermissions: any;

  @ApiProperty({
    name: 'appUsers',
    type: Array,
    description: 'User app users data',
  })
  appUsers: [];
}
