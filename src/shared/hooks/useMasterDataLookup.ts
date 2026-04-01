import React from 'react';
import { useGetAllMasterDataQuery } from '../../features/master/api/masterApi';
import { useGetAllUsersByRoleIdQuery } from '../../features/users/api/usersApi';

export const useMasterDataLookup = () => {
  const { data: masterData } = useGetAllMasterDataQuery();
  const { data: rms = [] } = useGetAllUsersByRoleIdQuery({ role_id: 3, offset: 0 });
  const { data: ems = [] } = useGetAllUsersByRoleIdQuery({ role_id: 4, offset: 0 });

  const getStatusLabel = React.useCallback((id: number | null | undefined) => {
    if (!id) return '--';
    return masterData?.lead_statuses.find(s => s.id === id)?.description || `ID: ${id}`;
  }, [masterData]);

  const getCustomerStatusLabel = React.useCallback((id: number | null | undefined) => {
    if (!id) return '--';
    return masterData?.customer_statuses.find(s => s.id === id)?.description || `ID: ${id}`;
  }, [masterData]);

  const getProjectLabel = React.useCallback((id: number | null | undefined) => {
    if (!id) return '--';
    return masterData?.projects.find(p => p.id === id)?.description || `ID: ${id}`;
  }, [masterData]);

  const getSourceLabel = React.useCallback((id: number | null | undefined) => {
    if (!id) return '--';
    return masterData?.sources.find(s => s.id === id)?.description || `ID: ${id}`;
  }, [masterData]);

  const getRmLabel = React.useCallback((id: number | null | undefined) => {
    if (!id) return '--';
    const rm = rms.find(r => r.id === id);
    return rm ? `${rm.first_name} ${rm.last_name}` : '--';
  }, [rms]);

  const getEmLabel = React.useCallback((id: number | null | undefined) => {
    if (!id) return '--';
    const em = ems.find(e => e.id === id);
    return em ? `${em.first_name} ${em.last_name}` : '--';
  }, [ems]);

  return React.useMemo(() => ({
    getStatusLabel,
    getCustomerStatusLabel,
    getProjectLabel,
    getSourceLabel,
    getRmLabel,
    getEmLabel,
    masterData,
    isLoading: !masterData && (rms.length === 0 || ems.length === 0)
  }), [
    getStatusLabel,
    getCustomerStatusLabel,
    getProjectLabel,
    getSourceLabel,
    getRmLabel,
    getEmLabel,
    masterData,
    rms.length,
    ems.length
  ]);
};
