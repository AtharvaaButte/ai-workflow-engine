export const ROUTES = {
  DASHBOARD: '/',
  WORKFLOWS: {
    LIST: '/workflows',
    CREATE: '/workflows/new',
    DETAILS: (id: string = ':id') => `/workflows/${id}`,
    EDIT: (id: string = ':id') => `/workflows/${id}/edit`,
  },
  EXECUTIONS: {
    LIST: '/executions',
    DETAILS: (id: string = ':id') => `/executions/${id}`,
  },
  SETTINGS: '/settings',
  NOT_FOUND: '*',
} as const;