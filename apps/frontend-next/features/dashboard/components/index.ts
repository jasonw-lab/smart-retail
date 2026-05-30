export { WelcomeMessage } from './welcome-message';
export { KPICards, KPICardsBottom } from './kpi-cards';
export { SalesChart } from './sales-chart';
export { AlertPanel } from './alert-panel';
// Re-export mock data functions and types from lib (server-compatible)
export {
  getMockKPIData,
  getMockAlerts,
  type KPIData,
  type AlertItem,
  type AlertType,
} from '../lib/mock-data';
