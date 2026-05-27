import { authHandlers } from './auth';
import { productHandlers } from './products';
import { dashboardHandlers } from './dashboard';

export const handlers = [
  ...authHandlers,
  ...productHandlers,
  ...dashboardHandlers,
];
