import { PARABANK_MESSAGES } from '../../src/constants/bank';
import { createRegistrationUser } from '../../src/data/user.factory';
import { test } from '../fixtures/bank.fixture';

test.describe('@negative @auth Registration Edge Cases', () => {
  test('blocks registering the same username twice', async ({
    user,
    registerPage,
    accountsOverviewPage,
  }) => {
    await registerPage.goto();
    await registerPage.register(user);
    await registerPage.expectRegistrationSuccess(user.username);
    await accountsOverviewPage.logout();

    const duplicateAttemptUser = createRegistrationUser({
      username: user.username,
    });

    await registerPage.goto();
    await registerPage.register(duplicateAttemptUser);
    await registerPage.expectDuplicateUsernameError(PARABANK_MESSAGES.duplicateUsername);
  });
});
