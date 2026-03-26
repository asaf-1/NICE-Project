import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { ACCOUNT_TYPE_CODES } from '../constants/bank';
import { Account, CurlJsonResponse } from '../types/bank';

const execFileAsync = promisify(execFile);

function getCurlBinary(): string {
  return process.platform === 'win32' ? 'curl.exe' : 'curl';
}

function buildCommandPreview(binary: string, args: string[]): string {
  return [binary, ...args.map((arg) => (arg.includes(' ') ? `"${arg}"` : arg))].join(' ');
}

async function runCurlJson<T>(url: string, method: 'GET' | 'POST'): Promise<CurlJsonResponse<T>> {
  const binary = getCurlBinary();
  const args = [
    '--silent',
    '--show-error',
    '--location',
    '--request',
    method,
    '--header',
    'Accept: application/json',
    '--write-out',
    '\\n%{http_code}',
    url,
  ];

  const { stdout, stderr } = await execFileAsync(binary, args, {
    windowsHide: true,
  });

  if (stderr.trim()) {
    throw new Error(`curl wrote to stderr: ${stderr.trim()}`);
  }

  const outputLines = stdout.trimEnd().split(/\r?\n/);
  const statusLine = outputLines.pop();
  const responseBody = outputLines.join('\n');
  const statusCode = Number(statusLine);

  if (Number.isNaN(statusCode)) {
    throw new Error(`Unable to parse curl status code from output: ${stdout}`);
  }

  if (!responseBody) {
    throw new Error(`curl returned an empty body with status ${statusCode}.`);
  }

  if (statusCode >= 400) {
    throw new Error(`curl returned status ${statusCode}: ${responseBody}`);
  }

  return {
    body: JSON.parse(responseBody) as T,
    command: buildCommandPreview(binary, args),
    rawBody: responseBody,
    statusCode,
  };
}

export async function createCheckingAccountViaCurl(options: {
  apiBaseUrl: string;
  customerId: number;
  fromAccountId: number;
}): Promise<CurlJsonResponse<Account>> {
  const url = new URL(`${options.apiBaseUrl}/createAccount`);

  url.searchParams.set('customerId', String(options.customerId));
  url.searchParams.set('newAccountType', String(ACCOUNT_TYPE_CODES.CHECKING));
  url.searchParams.set('fromAccountId', String(options.fromAccountId));

  return runCurlJson<Account>(url.toString(), 'POST');
}

