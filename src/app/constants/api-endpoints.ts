export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login'
  },
  dashboard: '/dashboard',
  pacientes: '/patients',
  atenciones: '/appointments',
  medicamentos: '/medicines',
  inventario: '/inventory',
  reportes: '/reports',
  roles: '/admin/roles',
  empleados: '/admin/empleados'
} as const;
