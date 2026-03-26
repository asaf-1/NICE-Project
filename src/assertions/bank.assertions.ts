import { expect } from '@playwright/test';
import { Account, Customer, RegistrationUser } from '../types/bank';
import { toCents } from '../utils/currency';

export function expectCustomerShape(customer: Customer, user: RegistrationUser): void {
  expect(customer.id).toEqual(expect.any(Number));
  expect(customer.firstName).toBe(user.firstName);
  expect(customer.lastName).toBe(user.lastName);
  expect(customer.address.street).toBe(user.address.street);
  expect(customer.address.city).toBe(user.address.city);
  expect(customer.address.state).toBe(user.address.state);
  expect(customer.address.zipCode).toBe(user.address.zipCode);
  expect(customer.phoneNumber).toBe(user.phoneNumber);
  expect(customer.ssn).toBe(user.ssn);
}

export function expectAccountShape(account: Account, expected: Partial<Account> = {}): void {
  expect(account.id).toEqual(expect.any(Number));
  expect(account.customerId).toEqual(expect.any(Number));
  expect(account.type).toEqual(expect.stringMatching(/CHECKING|SAVINGS|LOAN/));
  expect(account.balance).toEqual(expect.any(Number));

  if (expected.id !== undefined) {
    expect(account.id).toBe(expected.id);
  }

  if (expected.customerId !== undefined) {
    expect(account.customerId).toBe(expected.customerId);
  }

  if (expected.type !== undefined) {
    expect(account.type).toBe(expected.type);
  }

  if (expected.balance !== undefined) {
    expect(toCents(account.balance)).toBe(toCents(expected.balance));
  }
}
