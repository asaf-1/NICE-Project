import 'dotenv/config';

function getStringEnv(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

function getNumberEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number(rawValue);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Environment variable ${name} must be a valid number. Received: ${rawValue}`);
  }

  return parsedValue;
}

function getBooleanEnv(name: string, fallback: boolean): boolean {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  return rawValue.toLowerCase() === 'true';
}

function withTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

function withoutTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export const env = {
  baseUrl: withTrailingSlash(getStringEnv('BASE_URL', 'https://parabank.parasoft.com/parabank/')),
  apiBaseUrl: withoutTrailingSlash(
    getStringEnv('API_BASE_URL', 'https://parabank.parasoft.com/parabank/services/bank'),
  ),
  defaultTimeout: getNumberEnv('DEFAULT_TIMEOUT', 15_000),
  expectTimeout: getNumberEnv('EXPECT_TIMEOUT', 15_000),
  transferAmount: getNumberEnv('TRANSFER_AMOUNT', 25),
  openingDeposit: getNumberEnv('OPENING_DEPOSIT', 100),
  parallelWorkers: getNumberEnv('PARALLEL_WORKERS', 2),
  headless: getBooleanEnv('HEADLESS', true),
};
