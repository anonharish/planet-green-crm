import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { ROLE_PERMISSIONS, type Permission } from '../config/permissions';

export const usePermissions = () => {
  const { currentRole, user } = useSelector((state: RootState) => state.auth);
  
  const roleCode = React.useMemo(() => currentRole?.code ?? '', [currentRole]);
  const permissions: Permission[] = React.useMemo(() => ROLE_PERMISSIONS[roleCode] ?? [], [roleCode]);

  const can = React.useCallback((permission: Permission): boolean => 
    permissions.includes(permission), [permissions]);

  return React.useMemo(() => ({
    can,
    currentRole,
    roleCode,
    permissions,
    user,
  }), [can, currentRole, roleCode, permissions, user]);
};
