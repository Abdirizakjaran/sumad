export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  TRAFFIC_ADMIN: 'Traffic Admin',
  TRAFFIC_OFFICER: 'Traffic Officer',
  FINANCE_OFFICER: 'Finance Officer',
  CAMERA_OPERATOR: 'Camera Operator',
};

export const canManageVehicles = (role) =>
  ['SUPER_ADMIN', 'TRAFFIC_ADMIN', 'TRAFFIC_OFFICER'].includes(role);

export const canManageFines = (role) =>
  ['SUPER_ADMIN', 'TRAFFIC_ADMIN', 'TRAFFIC_OFFICER'].includes(role);

export const canManagePayments = (role) =>
  ['SUPER_ADMIN', 'FINANCE_OFFICER'].includes(role);

export const canUseCamera = (role) =>
  ['SUPER_ADMIN', 'CAMERA_OPERATOR', 'TRAFFIC_ADMIN'].includes(role);

export const canViewReports = (role) =>
  ['SUPER_ADMIN', 'TRAFFIC_ADMIN', 'FINANCE_OFFICER'].includes(role);

export const canManageUsers = (role) =>
  ['SUPER_ADMIN', 'TRAFFIC_ADMIN'].includes(role);
