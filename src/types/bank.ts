export type AccountType = 'CHECKING' | 'SAVINGS' | 'LOAN';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  address: Address;
  phoneNumber: string;
  ssn: string;
}

export interface Account {
  id: number;
  customerId: number;
  type: AccountType;
  balance: number;
}

export type TransactionType = 'Credit' | 'Debit';

export interface Transaction {
  id: number;
  accountId: number;
  type: TransactionType;
  date: string;
  amount: number;
  description: string;
}

export interface RegistrationUser {
  firstName: string;
  lastName: string;
  address: Address;
  phoneNumber: string;
  ssn: string;
  username: string;
  password: string;
}

export interface TransferDetails {
  amount: number;
  fromAccountId: number;
  toAccountId: number;
}

export interface CurlJsonResponse<T> {
  body: T;
  command: string;
  rawBody: string;
  statusCode: number;
}
