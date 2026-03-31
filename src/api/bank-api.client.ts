import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { Account, Customer, Transaction } from '../types/bank';
import { ACCOUNT_TYPE_CODES } from '../constants/bank';

export class BankApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string,
  ) {}

  async login(username: string, password: string): Promise<Customer> {
    const response = await this.fetchJson<Customer>(`login/${username}/${password}`);

    return response;
  }

  async getCustomerAccounts(customerId: number): Promise<Account[]> {
    const response = await this.fetchJson<Account[]>(`customers/${customerId}/accounts`);

    return response;
  }

  async getAccount(accountId: number): Promise<Account> {
    const response = await this.fetchJson<Account>(`accounts/${accountId}`);

    return response;
  }

  async getTransactions(accountId: number): Promise<Transaction[]> {
    const response = await this.fetchJson<Transaction[]>(`accounts/${accountId}/transactions`);

    return response;
  }

  async transferFunds(fromAccountId: number, toAccountId: number, amount: number): Promise<string> {
    const response = await this.fetchText(`transfer?fromAccountId=${fromAccountId}&toAccountId=${toAccountId}&amount=${amount}`, 'POST');

    return response;
  }

  async getAccountResponse(accountId: number): Promise<APIResponse> {
    return this.request.fetch(this.buildUrl(`accounts/${accountId}`), {
      failOnStatusCode: false,
      headers: {
        Accept: 'application/json',
      },
    });
  }

  async createCheckingAccountResponse(customerId: number, fromAccountId: number): Promise<APIResponse> {
    return this.request.fetch(
      this.buildUrl(
        `createAccount?customerId=${customerId}&newAccountType=${ACCOUNT_TYPE_CODES.CHECKING}&fromAccountId=${fromAccountId}`,
      ),
      {
        method: 'POST',
        failOnStatusCode: false,
        headers: {
          Accept: 'application/json',
        },
      },
    );
  }

  async createCheckingAccountResponseWithOptions(customerId: number, fromAccountId: number, accountType: number): Promise<APIResponse> {
    return this.request.fetch(
      this.buildUrl(`createAccount?customerId=${customerId}&newAccountType=${accountType}&fromAccountId=${fromAccountId}`),
      {
        method: 'POST',
        failOnStatusCode: false,
        headers: {
          Accept: 'application/json',
        },
      },
    );
  }

  private async fetchJson<T>(path: string): Promise<T> {
    const response = await this.request.fetch(this.buildUrl(path), {
      failOnStatusCode: false,
      headers: {
        Accept: 'application/json',
      },
    });

    expect(response.status(), `Unexpected status for ${path}`).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    return (await response.json()) as T;
  }

  private async fetchText(path: string, method: 'GET' | 'POST'): Promise<string> {
    const response = await this.request.fetch(this.buildUrl(path), {
      method,
      failOnStatusCode: false,
      headers: {
        Accept: 'text/plain, application/json',
      },
    });

    expect(response.status(), `Unexpected status for ${path}`).toBe(200);

    return response.text();
  }

  private buildUrl(path: string): string {
    return new URL(path, `${this.baseUrl}/`).toString();
  }
}
