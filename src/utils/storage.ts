import { Merchant, Transaction, Settlement, FraudLog } from '../types';
import { INITIAL_MERCHANTS, INITIAL_TRANSACTIONS, INITIAL_SETTLEMENTS, INITIAL_FRAUD_LOGS } from '../mockData';

export interface AppState {
  merchants: Merchant[];
  transactions: Transaction[];
  settlements: Settlement[];
  fraudLogs: FraudLog[];
}

const STORAGE_KEY = 'upi_gateway_platform_state';

export const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return {
        merchants: INITIAL_MERCHANTS,
        transactions: INITIAL_TRANSACTIONS,
        settlements: INITIAL_SETTLEMENTS,
        fraudLogs: INITIAL_FRAUD_LOGS,
      };
    }
    const parsed = JSON.parse(serialized);
    if (!parsed || typeof parsed !== 'object') {
      return {
        merchants: INITIAL_MERCHANTS,
        transactions: INITIAL_TRANSACTIONS,
        settlements: INITIAL_SETTLEMENTS,
        fraudLogs: INITIAL_FRAUD_LOGS,
      };
    }
    return {
      merchants: Array.isArray(parsed.merchants) ? parsed.merchants : INITIAL_MERCHANTS,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : INITIAL_TRANSACTIONS,
      settlements: Array.isArray(parsed.settlements) ? parsed.settlements : INITIAL_SETTLEMENTS,
      fraudLogs: Array.isArray(parsed.fraudLogs) ? parsed.fraudLogs : INITIAL_FRAUD_LOGS,
    };
  } catch (error) {
    console.error('Failed to load state from localStorage', error);
    return {
      merchants: INITIAL_MERCHANTS,
      transactions: INITIAL_TRANSACTIONS,
      settlements: INITIAL_SETTLEMENTS,
      fraudLogs: INITIAL_FRAUD_LOGS,
    };
  }
};

export const saveState = (state: AppState): void => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save state to localStorage', error);
  }
};
