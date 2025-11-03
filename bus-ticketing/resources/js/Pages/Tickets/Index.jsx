import { Client, Transaction, Payment, User, FinancialNotes } from '../types';

// Local Storage Keys
const USERS_KEY = 'financial_app_users';
const CURRENT_USER_KEY = 'financial_app_current_user';
const CLIENTS_KEY = 'financial_app_clients';
const TRANSACTIONS_KEY = 'financial_app_transactions';
const PAYMENTS_KEY = 'financial_app_payments';
const FINANCIAL_NOTES_KEY = 'financial_app_financial_notes';

// Clear all data from localStorage
export const clearAllData = (): void => {
  [USERS_KEY, CURRENT_USER_KEY, CLIENTS_KEY, TRANSACTIONS_KEY, PAYMENTS_KEY, FINANCIAL_NOTES_KEY].forEach(
    (key) => localStorage.removeItem(key)
  );
};

// Generic get and set functions with safety
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.warn(`Erreur en lisant la clé ${key} de localStorage:`, err);
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Erreur en écrivant la clé ${key} dans localStorage:`, err);
  }
};

// User related functions
export const getUsers = (): User[] => getItem<User[]>(USERS_KEY, []);
export const setUsers = (users: User[]): void => setItem(USERS_KEY, users);

export const getCurrentUser = (): User | null => getItem<User | null>(CURRENT_USER_KEY, null);
export const setCurrentUser = (user: User | null): void => setItem(CURRENT_USER_KEY, user);

// Client related functions
export const getClients = (): Client[] => getItem<Client[]>(CLIENTS_KEY, []);
export const setClients = (clients: Client[]): void => setItem(CLIENTS_KEY, clients);

// Transaction related functions
export const getTransactions = (): Transaction[] => getItem<Transaction[]>(TRANSACTIONS_KEY, []);
export const setTransactions = (transactions: Transaction[]): void => setItem(TRANSACTIONS_KEY, transactions);

// Payment related functions
export const getPayments = (): Payment[] => getItem<Payment[]>(PAYMENTS_KEY, []);
export const setPayments = (payments: Payment[]): void => setItem(PAYMENTS_KEY, payments);

// Financial notes related functions
export const getFinancialNotes = (): FinancialNotes =>
  getItem<FinancialNotes>(FINANCIAL_NOTES_KEY, {
    globalCashBalance: 0,
    yawiAshBalance: 0,
    lpvBalance: 0,
    airtelMoneyBalance: 0,
    availableCash: 0,
    baldeAlphaDebt: 0,
    mdOwesUs: 0,
    weOweMd: 0,
    lastUpdated: new Date().toISOString(),
  });

export const setFinancialNotes = (notes: FinancialNotes): void => setItem(FINANCIAL_NOTES_KEY, notes);

// Initialize default admin user if none exists
export const initializeDefaultUser = (): void => {
  const users = getUsers();
  if (users.length === 0) {
    setUsers([
      {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        isActive: true,
      },
    ]);
  }
};
