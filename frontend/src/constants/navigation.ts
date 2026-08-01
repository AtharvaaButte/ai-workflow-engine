
export interface NavItem {
  label: string;
  path: string;
  iconName: string;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', iconName: 'dashboard' },
  { label: 'Workflows', path: '/workflows', iconName: 'workflow' },
  { label: 'Executions', path: '/executions', iconName: 'execution' },
  { label: 'Settings', path: '/settings', iconName: 'settings' },
];