export const ACCOUNT_TYPE_CODES = {
  CHECKING: 0,
  SAVINGS: 1,
  LOAN: 2,
} as const;

export const PARABANK_MESSAGES = {
  invalidLogin: 'The username and password could not be verified.',
  passwordMismatch: 'Passwords did not match.',
} as const;

