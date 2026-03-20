import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { ROLE_PERMISSIONS, type Permission } from '../config/permissions';

/**
 * usePermissions — the only hook you need for access control.
 *
 * Usage:
 *   const { can, currentRole } = usePermissions();
 *   can('lead.create')   → true / false
 *   can('agent.delete')  → true / false
 */
export const usePermissions = () => {
  const currentRole = useSelector((state: RootState) => state.auth.currentRole);

  const roleCode = currentRole?.code ?? '';
  const permissions: Permission[] = ROLE_PERMISSIONS[roleCode] ?? [];

  const can = (permission: Permission): boolean => permissions.includes(permission);

  return {
    can,
    currentRole,
    roleCode,
    permissions,
  };
};
