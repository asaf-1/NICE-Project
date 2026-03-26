import { RegistrationUser } from '../types/bank';

type RegistrationUserOverrides = Partial<RegistrationUser>;

function buildUniqueSuffix(): string {
  const timestamp = Date.now().toString(36);
  const randomChunk = Math.random().toString(36).slice(2, 6);

  return `${timestamp}${randomChunk}`;
}

export function createRegistrationUser(
  overrides: RegistrationUserOverrides = {},
): RegistrationUser {
  const suffix = buildUniqueSuffix();
  const baseAddress = {
    street: '123 Test Street',
    city: 'Tel Aviv',
    state: 'TA',
    zipCode: '12345',
  };

  return {
    firstName: 'Asaf',
    lastName: 'NICE',
    address: {
      ...baseAddress,
      ...overrides.address,
    },
    phoneNumber: '0501234567',
    ssn: `123-45-${suffix.slice(-4).padStart(4, '0')}`,
    username: `pw${suffix}`,
    password: 'Passw0rd!',
    ...overrides,
  };
}
