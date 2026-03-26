import { useGetAllMasterDataQuery } from '../../features/master/api/masterApi';
import { useGetAllUsersByRoleIdQuery } from '../../features/users/api/usersApi';

export const useMasterDataLookup = () => {
  const { data: masterData } = useGetAllMasterDataQuery();
  const { data: rms = [] } = useGetAllUsersByRoleIdQuery({ role_id: 3, offset: 0 });
  const { data: ems = [] } = useGetAllUsersByRoleIdQuery({ role_id: 4, offset: 0 });

  const getStatusLabel = (id: number | null | undefined) => {
    if (!id) return '--';
    return masterData?.lead_statuses.find(s => s.id === id)?.description || `ID: ${id}`;
  };

  const getCustomerStatusLabel = (id: number | null | undefined) => {
    if (!id) return '--';
    return masterData?.customer_statuses.find(s => s.id === id)?.description || `ID: ${id}`;
  };

  const getProjectLabel = (id: number | null | undefined) => {
    if (!id) return '--';
    return masterData?.projects.find(p => p.id === id)?.description || `ID: ${id}`;
  };

  const getSourceLabel = (id: number | null | undefined) => {
    if (!id) return '--';
    return masterData?.sources.find(s => s.id === id)?.description || `ID: ${id}`;
  };

  const getRmLabel = (id: number | null | undefined) => {
    if (!id) return '--';
    const rm = rms.find(r => r.id === id);
    return rm ? `${rm.first_name} ${rm.last_name}` : '--';
  };

  const getEmLabel = (id: number | null | undefined) => {
    if (!id) return '--';
    const em = ems.find(e => e.id === id);
    return em ? `${em.first_name} ${em.last_name}` : '--';
  };

  return {
    getStatusLabel,
    getCustomerStatusLabel,
    getProjectLabel,
    getSourceLabel,
    getRmLabel,
    getEmLabel,
    masterData,
    isLoading: !masterData && (rms.length === 0 || ems.length === 0)
  };
};
