import { PermissionGuard } from './permission.guard';

describe('PermissionGuard', () => {
  it('passes the active app id to the permission check', async () => {
    const rolePermissionService = {
      userHasAllPermissions: jest.fn().mockResolvedValue(true),
    };

    const reflector = {
      get: jest.fn().mockReturnValue(['accounts.income.view']),
    };

    const guard = new PermissionGuard(
      reflector as any,
      rolePermissionService as any,
    );

    const context = {
      getHandler: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 42, activeAppId: 7 },
        }),
      }),
    } as any;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(rolePermissionService.userHasAllPermissions).toHaveBeenCalledWith(
      42,
      ['accounts.income.view'],
      7,
    );
  });
});
