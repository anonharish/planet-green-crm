// All permission keys used throughout the CRM
export const PERMISSIONS = {
  // Leads
  LEAD_VIEW: 'lead.view',
  LEAD_CREATE: 'lead.create',
  LEAD_EDIT: 'lead.edit',
  LEAD_ASSIGN: 'lead.assign',
  LEAD_STATUS_UPDATE: 'lead.status.update',

  // Agents (EXPMNG)
  AGENT_VIEW: 'agent.view',
  AGENT_CREATE: 'agent.create',
  AGENT_EDIT: 'agent.edit',
  AGENT_DELETE: 'agent.delete',
  AGENT_ASSIGN: 'agent.assign',

  // Managers (RELMNG)
  MANAGER_VIEW: 'manager.view',
  MANAGER_CREATE: 'manager.create',
  MANAGER_EDIT: 'manager.edit',
  MANAGER_DELETE: 'manager.delete',
  MANAGER_ASSIGN: 'manager.assign',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Maps role codes (from API) to their allowed permissions.
 * To change what a role can do, update ONLY this map — nothing else changes.
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // SADMIN — Read-only overview
  SADMIN: [
    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.AGENT_VIEW,
    PERMISSIONS.MANAGER_VIEW,
    // PERMISSIONS.AGENT_CREATE,
    // PERMISSIONS.AGENT_EDIT,
    // PERMISSIONS.AGENT_DELETE,
    // PERMISSIONS.AGENT_ASSIGN,
    // PERMISSIONS.MANAGER_CREATE,
    // PERMISSIONS.MANAGER_EDIT,
    // PERMISSIONS.MANAGER_DELETE,
    // PERMISSIONS.MANAGER_ASSIGN,
  ],

  // ADMIN — Full control
  ADMIN: [
    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.LEAD_CREATE,
    PERMISSIONS.LEAD_EDIT,
    PERMISSIONS.LEAD_ASSIGN,
    PERMISSIONS.LEAD_STATUS_UPDATE,
    PERMISSIONS.AGENT_VIEW,
    PERMISSIONS.AGENT_CREATE,
    PERMISSIONS.AGENT_EDIT,
    PERMISSIONS.AGENT_DELETE,
    PERMISSIONS.AGENT_ASSIGN,
    PERMISSIONS.MANAGER_VIEW,
    PERMISSIONS.MANAGER_CREATE,
    PERMISSIONS.MANAGER_EDIT,
    PERMISSIONS.MANAGER_DELETE,
    PERMISSIONS.MANAGER_ASSIGN,
  ],

  // RELMNG — Relationship Manager: controls agents, manages leads
  RELMNG: [
    PERMISSIONS.LEAD_VIEW,
    // PERMISSIONS.LEAD_CREATE,
    PERMISSIONS.LEAD_EDIT,
    PERMISSIONS.LEAD_ASSIGN,
    PERMISSIONS.LEAD_STATUS_UPDATE,
    PERMISSIONS.AGENT_VIEW,
    PERMISSIONS.AGENT_CREATE,
    PERMISSIONS.AGENT_EDIT,
    PERMISSIONS.AGENT_DELETE,
    PERMISSIONS.AGENT_ASSIGN,
  ],

  // EXPMNG — Site Experience Manager (Agent): minimal access
  EXPMNG: [
    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.LEAD_EDIT,
    PERMISSIONS.LEAD_STATUS_UPDATE,
  ],
};
