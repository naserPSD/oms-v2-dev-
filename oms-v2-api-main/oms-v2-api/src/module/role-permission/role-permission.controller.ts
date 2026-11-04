import { Permission } from '@aws-sdk/client-s3';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ParseIntPipe,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { RolePermissionService } from './role-permission.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from '@core/guards/permissions.decorator';
import {
  CreatePermissionDto,
  PermissionResponseDto,
} from './dto/permission.dto';
import { CreateRoleDto } from './dto/role.dto';
import { PermissionGuard } from '@core/guards/permission.guard';
import { Helpers } from '@core/utils/helpers';
import { Role } from './entities/role.entity';
import { CommonResponseDto } from '@core/utils/common-response-dto';

@UseGuards(JwtAuthGuard)
// @UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth('access_token')
@ApiTags('Role Permission')
@Controller('api/v1/role-permission')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Get('/users/get-all-permissions')
  async getUserPermissions(@Req() req) {
    const permissions = await this.rolePermissionService.getUserPermissions(
      req.user.id,
    );
    return { permissions };
  }

  @Get('/permission/get-all-with-pagination')
  // @Permissions('permission.view')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
    type: [PermissionResponseDto], // Indicate this will return an array of Contract objects
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "name": "Jon Doe", "isActive": "false" }',
    example: '{ "name": "Jon Doe" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, name:asc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description:
      'Limit the fields returned in the response & fields seperate by comma',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
  })
  async getAllPermissionsWithPagination(@Query() query: any) {
    // async getAllPermissionsWithPagination(): Promise<PermissionResponseDto[]> {
    const queryResult =
      await this.rolePermissionService.getAllPermissionsWithPagination(query);
    return {
      message: 'Permissions retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Post('/permission/add-or-update')
  // @Permissions('permission.create')
  @ApiOperation({ summary: 'Add or Update permission' })
  async createOrUpdatePermission(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<any> {
    const permission =
      await this.rolePermissionService.createOrUpdatePermission(
        createPermissionDto,
      );

    return {
      message: `Permission ${createPermissionDto.id ? 'updated' : 'added'} successfully`,
      data: permission,
    };
  }

  private mapToPermissionResponseDto(permission: any): PermissionResponseDto {
    return {
      id: permission.id,
      parentId: permission?.parent?.id ? permission.parent.id : null,
      parentName: permission?.parent?.name ? permission.parent.name : null,
      type: permission.type,
      name: permission.name,
      code: permission.code,
      description: permission.description,
      path: permission.path,
      icon: permission.icon,
      sortOrder: permission.sortOrder,
      isActive: permission.isActive,
      isSystem: permission.isSystem,
      isRequired: permission.isRequired,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
      children: permission.children
        ? permission.children.map((child) =>
            this.mapToPermissionResponseDto(child),
          )
        : undefined,
    };
  }

  @Patch('/permission/change-active-status/:id')
  @ApiOperation({ summary: 'Change Active Status' })
  async changePermissionActiveStatus(@Param('id') id: string) {
    const result =
      await this.rolePermissionService.changePermissionActiveStatus(+id);
    return {
      status: 'success',
      message: 'Permission active status changed successfully',
      data: result,
    };
  }

  @Patch('/permission/change-system-status/:id')
  @ApiOperation({ summary: 'Change System Status' })
  async changePermissionSystemStatus(@Param('id') id: string) {
    const result =
      await this.rolePermissionService.changePermissionSystemStatus(+id);
    return {
      status: 'success',
      message: 'Permission system status changed successfully',
      data: result,
    };
  }

  @Patch('/permission/change-required-status/:id')
  @ApiOperation({ summary: 'Change Required Status' })
  async changePermissionRequiredStatus(@Param('id') id: string) {
    const result =
      await this.rolePermissionService.changePermissionRequiredStatus(+id);
    return {
      status: 'success',
      message: 'Permission required status changed successfully',
      data: result,
    };
  }

  // 🔹 Permissions Endpoints
  @Get('permission/tree')
  getAllPermissionsTree() {
    return this.rolePermissionService.getAllPermissionsTree();
  }

  @Get('permission/code/:code')
  getPermissionByCode(@Param('code') code: string) {
    return this.rolePermissionService.getPermissionByCode(code);
  }

  @Delete('permission/:id')
  deletePermission(@Param('id', ParseIntPipe) id: number) {
    return this.rolePermissionService.deletePermissionById(id);
  }

  @Get('/permission/get-all-list')
  // @Permissions('permission.view')
  async getAllPermissions(@Query() query: any) {
    return await this.rolePermissionService.getAllPermissions(query);
  }

  @Get('/permission/get-all-module-list')
  // @Permissions('permission.view')
  async getAllModulePermissions(): Promise<CommonResponseDto[]> {
    return await this.rolePermissionService.getAllModulePermissions();
  }

  @Get('/permission/get-all-tree')
  // @Permissions('permission.view')
  async findTree(): Promise<PermissionResponseDto[]> {
    const permissions =
      await this.rolePermissionService.getAllPermissionsTree();
    return permissions.map(PermissionResponseDto.from);
  }

  @Get('/permission/:id')
  // @Permissions('permission.view')
  async getPermissionById(
    @Param('id') id: string,
  ): Promise<PermissionResponseDto> {
    const permission = await this.rolePermissionService.getPermissionById(+id);
    return this.mapToPermissionResponseDto(permission);
  }

  @Delete('/permission/:id')
  @Permissions('permission.delete')
  async deletePermissionById(@Param('id') id: string): Promise<void> {
    await this.rolePermissionService.deletePermissionById(+id);
  }
  @Get('/users/menu')
  async getUserMenu(@Req() req) {
    const menu = await this.rolePermissionService.getUserMenu(req.user.id);
    return { menu };
  }

  @Get('has-permission/:permissionCode')
  async hasPermission(
    @Req() req,
    @Param('permissionCode') permissionCode: string,
  ) {
    const hasPerm = await this.rolePermissionService.userHasPermission(
      req.user.id,
      permissionCode,
    );
    return { hasPermission: hasPerm };
  }

  // 🔹 Roles Endpoints
  @Post('roles/add-or-update')
  async addOrUpdateRole(@Body() dto: CreateRoleDto) {
    // return this.rolePermissionService.addOrUpdateRole(dto);
    const queryResult = await this.rolePermissionService.addOrUpdateRole(dto);

    return {
      message: `Role ${queryResult.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  // ── Company-scoped user roles (company Admin) ──────────────────────────

  @UseGuards(PermissionGuard)
  @Permissions('settings.company-user-roles')
  @Get('roles/company/get-all')
  @ApiOperation({ summary: 'List company-scoped custom roles' })
  async getCompanyRolesWithPagination(@Query() query: any) {
    const queryResult =
      await this.rolePermissionService.getCompanyRolesWithPagination(query);

    return {
      message: 'Company roles retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @UseGuards(PermissionGuard)
  @Permissions('settings.company-user-roles')
  @Get('roles/company/get-by-id/:id')
  @ApiOperation({ summary: 'Get a company-scoped role by id' })
  async getCompanyRoleById(@Param('id', ParseIntPipe) id: number) {
    const role = await this.rolePermissionService.getCompanyRoleById(id);
    return { message: 'Company role retrieved successfully', data: role };
  }

  @UseGuards(PermissionGuard)
  @Permissions('settings.company-user-roles')
  @Post('roles/company/add-or-update')
  @ApiOperation({ summary: 'Create or update a company-scoped custom role' })
  async addOrUpdateCompanyRole(@Req() req, @Body() dto: CreateRoleDto) {
    const actionCode = dto.id
      ? 'settings.company_user_roles_edit'
      : 'settings.company_user_roles_add';
    const allowed = await this.rolePermissionService.userHasPermission(
      req.user.id,
      actionCode,
      req.user.activeAppId ?? req.activeAppId,
    );
    if (!allowed) {
      throw new ForbiddenException(`Missing permission: ${actionCode}`);
    }

    const queryResult =
      await this.rolePermissionService.addOrUpdateCompanyRole(dto);

    return {
      message: `Company role ${dto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @UseGuards(PermissionGuard)
  @Permissions('settings.company_user_roles_delete')
  @Delete('roles/company/:id')
  @ApiOperation({ summary: 'Delete a company-scoped custom role' })
  async deleteCompanyRole(@Param('id', ParseIntPipe) id: number) {
    await this.rolePermissionService.deleteCompanyRoleById(id);
    return { message: 'Company role deleted successfully' };
  }

  @UseGuards(PermissionGuard)
  @Permissions('settings.company_user_roles_edit')
  @Patch('roles/company/change-active-status/:id')
  @ApiOperation({ summary: 'Toggle company role active status' })
  async changeCompanyRoleActiveStatus(@Param('id') id: string) {
    const result =
      await this.rolePermissionService.changeCompanyRoleActiveStatus(+id);
    return {
      status: 'success',
      message: 'Company role active status changed successfully',
      data: result,
    };
  }

  @Get('roles/company/assignable-active-list')
  @ApiOperation({
    summary: 'Active roles assignable by company Admin (Admin + custom)',
  })
  async getCompanyAssignableActiveRoles() {
    const data =
      await this.rolePermissionService.getCompanyAssignableActiveRoles();
    return { message: 'Assignable roles retrieved successfully', data };
  }

  @UseGuards(PermissionGuard)
  @Permissions('settings.company-user-roles')
  @Get('permission/company/assignable-list')
  @ApiOperation({
    summary: 'Permissions company Admin may attach to custom roles',
  })
  async getCompanyAssignablePermissionList(@Query() query: any) {
    const data =
      await this.rolePermissionService.getCompanyAssignablePermissionList(
        query,
      );
    return data;
  }

  @Get('roles/get-active-role-list')
  @ApiOperation({ summary: 'Get all list of active roles' })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
    type: [CommonResponseDto], // Indicate this will return an array of Contract objects
  })
  getAllRoles() {
    return this.rolePermissionService.getAllActiveRoles();
  }

  @Get('roles/get-all')
  @ApiOperation({ summary: 'Get all list of roles' })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
    type: [Role], // Indicate this will return an array of Contract objects
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "name": "Admin", "isActive": "false" }',
    example: '{ "name": "Admin" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, name:asc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description:
      'Limit the fields returned in the response & fields seperate by comma',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
  })
  async getRolesWithPagination(@Query() query: any) {
    const queryResult =
      await this.rolePermissionService.getRolesWithPagination(query);

    return {
      message: 'Roles retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Patch('roles/change-active-status/:id')
  @ApiOperation({ summary: 'Change Active Status' })
  async changeRoleActiveStatus(@Param('id') id: string) {
    const result = await this.rolePermissionService.changeRoleActiveStatus(+id);
    return {
      status: 'success',
      message: 'Role active status changed successfully',
      data: result,
    };
  }

  @Patch('roles/change-is-system-status/:id')
  @ApiOperation({ summary: 'Change Is System Status' })
  async changeRoleIsSystemStatus(@Param('id') id: string) {
    const result =
      await this.rolePermissionService.changeRoleIsSystemStatus(+id);
    return {
      status: 'success',
      message: 'Role is system status changed successfully',
      data: result,
    };
  }

  @Get('roles/get-by-id/:id')
  getRoleById(@Param('id', ParseIntPipe) id: number) {
    return this.rolePermissionService.getRoleById(id);
  }

  @Get('roles/get-by-name/:name')
  findRoleByName(@Param('name') name: string) {
    return this.rolePermissionService.findRoleByName(name);
  }

  @Delete('roles/:id')
  deleteRoleById(@Param('id', ParseIntPipe) id: number) {
    return this.rolePermissionService.deleteRoleById(id);
  }

  @Post('roles/:id/assign-permissions')
  assignRolePermissions(
    @Param('id', ParseIntPipe) roleId: number,
    @Body('permissionIds') permissionIds: number[],
  ) {
    return this.rolePermissionService.assignRolePermissions(
      roleId,
      permissionIds,
    );
  }

  // 🔹 User Permissions & Roles
  @Get('users/:id/permission-codes')
  getUserPermissionCodes(@Param('id', ParseIntPipe) userId: number) {
    return this.rolePermissionService.getUserPermissionCodes(userId);
  }

  @Post('users/:id/assign-roles')
  @ApiOperation({ summary: 'Assign roles to a user' })
  @ApiResponse({ status: 200, description: 'Roles assigned successfully' })
  @ApiBody({ type: [Number], description: 'Array of role IDs' })
  assignRoles(
    @Param('id', ParseIntPipe) userId: number,
    @Body('roleIds') roleIds: number[],
  ) {
    return this.rolePermissionService.assignRolesToUser(userId, roleIds);
  }

  // 🔹 Permission checks
  @Get('users/:id/has-permission/:code')
  userHasPermission(
    @Param('id', ParseIntPipe) userId: number,
    @Param('code') code: string,
  ) {
    return this.rolePermissionService.userHasPermission(userId, code);
  }

  @Post('users/:id/has-any-permission')
  userHasAnyPermission(
    @Param('id', ParseIntPipe) userId: number,
    @Body('codes') codes: string[],
  ) {
    return this.rolePermissionService.userHasAnyPermission(userId, codes);
  }

  @Post('users/:id/has-all-permissions')
  userHasAllPermissions(
    @Param('id', ParseIntPipe) userId: number,
    @Body('codes') codes: string[],
  ) {
    return this.rolePermissionService.userHasAllPermissions(userId, codes);
  }

  @Post()
  create(@Body() createRolePermissionDto: CreateRolePermissionDto) {
    return this.rolePermissionService.create(createRolePermissionDto);
  }

  @Get()
  findAll() {
    return this.rolePermissionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolePermissionService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRolePermissionDto: UpdateRolePermissionDto,
  ) {
    return this.rolePermissionService.update(+id, updateRolePermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolePermissionService.remove(+id);
  }
}
