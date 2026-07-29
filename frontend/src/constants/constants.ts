export const APP_NAME = 'AI Workflow Engine';

export const API_ENDPOINTS = {
  WORKFLOWS: '/workflows',
  EXECUTIONS: '/executions',
} as const;

export const SIDEBAR_MENU = [
  { label: 'Dashboard', path: '/' },
  { label: 'Workflows', path: '/workflows' },
  { label: 'Executions', path: '/executions' },
  { label: 'Settings', path: '/settings' },
];