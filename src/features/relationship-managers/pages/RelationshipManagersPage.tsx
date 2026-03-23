import React from 'react';
import { UsersFeaturePage } from '../../users/pages/UsersFeaturePage';

export const RelationshipManagersPage = () => {
  return (
    <UsersFeaturePage
      roleId={3}
      roleLabel="Relationship Manager"
      title="Relationship Managers"
      description="Manage your team of relationship managers and their access levels."
      permissionPrefix="manager"
    />
  );
};
