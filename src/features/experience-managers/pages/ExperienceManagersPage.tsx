import React from 'react';
import { UsersFeaturePage } from '../../users/pages/UsersFeaturePage';

export const ExperienceManagersPage = () => {
  return (
    <UsersFeaturePage
      roleId={4}
      roleLabel="Site Experience Manager"
      title="Site Experience Managers"
      description="Manage your team of site experience managers and their field officer assignments."
      permissionPrefix="agent"
    />
  );
};
