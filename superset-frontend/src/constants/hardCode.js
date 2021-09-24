export const IS_SYSTEM_USER = roleName => roleName === 'System User';

export const IS_DATA_CITIZEN = roleName => roleName === 'Data Citizen';

export const IS_SYSTEM_ASSIGN_DATAROLE = roleName =>
  roleName === 'Data Domain Owner' ||
  roleName === 'Data Owner' ||
  roleName === 'Data Steward';

export const IS_NOT_DELETABLE_ROLE = value =>
  value === 'System User' ||
  value === 'Data Citizen' ||
  value === 'Data Domain Owner' ||
  value === 'Data Owner' ||
  value === 'Data Steward';
