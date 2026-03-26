import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { Account, Customer } from '../types/bank';

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

  async getAccountResponse(accountId: number): Promise<APIResponse> {
    return this.request.fetch(this.buildUrl(`accounts/${accountId}`), {
      failOnStatusCode: false,
      headers: {
        Accept: 'application/json',
      },
    });
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

  private buildUrl(path: string): string {
    return new URL(path, `${this.baseUrl}/`).toString();
  }
}

