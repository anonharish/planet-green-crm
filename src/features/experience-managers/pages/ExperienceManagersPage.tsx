import React from 'react';
import { UsersFeaturePage } from '../../users/pages/UsersFeaturePage';

export const ExperienceManagersPage = () => {
  return (
    <UsersFeaturePage
      roleId={4}
      roleLabel="Site Experience Manager"
      title="Experience Managers"
      description="Manage and monitor your on-site experience team."
      permissionPrefix="agent"
      searchPlaceholder="Search EM's"
    />
  );
};
