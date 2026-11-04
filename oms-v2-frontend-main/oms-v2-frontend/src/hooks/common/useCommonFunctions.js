import { useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useMenuStore } from '@/store/useMenuStore';

const useCommonFunctions = () => {

  const permissions = useAuthStore((state) => state.permissions) || [];
  const leftSidebarMenu = useMenuStore((state) => state.leftSidebarMenu) || [];

  // console.log('permissions in useCommonFunctions', permissions)

    const hasPermission = useCallback((permissionCode) => {
        let permissionDisable = false;

        if (permissionDisable) {
            return true;
        }
        if (!permissionCode) return false;
        if (permissionCode === "permitted") return true;

        if (permissions && permissions.length) {
            if (permissions.includes("*") || permissions.includes("super_admin") || permissions.includes("all")) {
                return true;
            }
            if (permissions.includes(permissionCode)) {
                return true;
            }
            // If user has top-level 'accounts' permission, grant access to accounts sub-permissions
            if (permissionCode.startsWith("accounts.") && permissions.includes("accounts")) {
                return true;
            }
        }

        // Check inside leftSidebarMenu pages permissions (for granular action/feature permissions)
        if (leftSidebarMenu && leftSidebarMenu.length > 0) {
            for (const menuItem of leftSidebarMenu) {
                if (menuItem.pages) {
                    for (const page of menuItem.pages) {
                        if (page.permissions && page.permissions.includes(permissionCode)) {
                            return true;
                        }
                    }
                }
            }
        }

        // Fallback for development/accounts module when permission list is not populated
        if ((!permissions || permissions.length === 0) && permissionCode.startsWith("accounts")) {
            return true;
        }

        return false;
    }, [permissions, leftSidebarMenu]);


    return {
        hasPermission
    };
};

export default useCommonFunctions;