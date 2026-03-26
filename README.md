# ParaBank Playwright Home Assignment

Production-ready Playwright framework that validates the ParaBank core banking flow across UI, API, and `curl`.

## What is Covered

Happy path:

1. Register a new user in the UI
2. Log in through the UI
3. Get the customer id through the API
4. Get the existing account through the API
5. Create a new `CHECKING` account using a real `curl` command
6. Verify the new account appears in the UI
7. Transfer money between accounts in the UI
8. Validate the updated balances through the API
9. Log out

Negative scenarios:

1. Invalid login credentials
2. Registration with mismatched passwords
3. API lookup for a non-existing account

## Stack

- Playwright with TypeScript
- Page Object Model for UI workflows
- API client layer for REST validation
- `curl` execution through Node child process for the account-creation step
- HTML, JSON, and JUnit reporting

## Project Structure

```text
src/
  api/          API client
  assertions/   shared response assertions
  config/       environment loading
  constants/    domain constants and messages
  data/         test data factories
  pages/        page objects
  types/        shared domain types
  utils/        curl and currency helpers
tests/
  e2e/          end-to-end flow
  negative/     negative scenarios
.github/workflows/
  playwright.yml
```

## Setup

Prerequisites:

- Node.js 20+
- `npm`
- `curl`

Install:

```powershell
npm.cmd install
npx.cmd playwright install chromium
```

One-command Windows bootstrap:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap.ps1
```

Optional local config:

```powershell
Copy-Item .env.example .env
```

Default values already target the public ParaBank environment, so no secrets or API keys are required.

## Execution

Run the full suite:

```powershell
npm.cmd test
```

Run only the core banking scenario:

```powershell
npm.cmd run test:core
```

Run only the negative scenarios:

```powershell
npm.cmd run test:negative
```

Run type-checking:

```powershell
npm.cmd run typecheck
```

Open the HTML report after execution:

```powershell
npm.cmd run report
```

Docker execution:

```powershell
docker compose up --build playwright
```

## Environment Configuration

Config is centralized in [`src/config/env.ts`](/c:/Users/asafn/Desktop/NICE-Project/src/config/env.ts) and can be overridden through `.env`.

Supported keys:

- `BASE_URL`
- `API_BASE_URL`
- `DEFAULT_TIMEOUT`
- `EXPECT_TIMEOUT`
- `TRANSFER_AMOUNT`
- `OPENING_DEPOSIT`
- `HEADLESS`

## Design Decisions

- The UI, API, and command-line concerns are intentionally separated.
  UI behavior lives in page objects, API behavior lives in [`src/api/bank-api.client.ts`](/c:/Users/asafn/Desktop/NICE-Project/src/api/bank-api.client.ts), and the `curl` flow lives in [`src/utils/curl.ts`](/c:/Users/asafn/Desktop/NICE-Project/src/utils/curl.ts).
- Test data is generated dynamically.
  Unique usernames avoid collisions in a shared public environment.
- Assertions validate both behavior and data integrity.
  The suite checks status codes, response structure, UI visibility, account presence, and balance conservation.
- Money validation is done in cents.
  This avoids flaky floating-point comparisons for currency assertions.
- The happy path is implemented as one business flow.
  That matches the assignment and keeps the test readable as a real user journey.

## Tradeoffs

- Chromium is the default execution target.
  This keeps execution fast and stable for the assignment, but cross-browser coverage would be a natural next step.
- I did not use destructive admin endpoints such as database cleanup.
  The site is public and shared, so the framework is designed to be self-isolating through unique data rather than resetting the environment.
- The suite uses lightweight hand-written response assertions instead of adding a schema-validation library.
  This keeps the dependency footprint small while still validating structure and critical fields.

## Assumptions

- The ParaBank public demo remains reachable and reasonably stable.
- New registrations are allowed without pre-provisioning.
- `curl` is available on the execution machine or container.
- The initial funding for a newly opened account is `100.00`, as indicated by the UI flow.
- Observed system behavior: the `POST /createAccount` response can return a new account object with `balance: 0`, while follow-up `GET` calls and the UI show the actual funded balance.
  Because of that, the framework validates final account state with follow-up API reads rather than assuming the create response is the final truth.

## How to Scale It

- Add more page components for reusable widgets such as the account-services sidebar and transaction tables.
- Expand the API layer into domain services per capability: accounts, customers, transfers, loans, bill pay.
- Add tagged test suites such as `@smoke`, `@regression`, and `@api`.
- Introduce fixture-based authenticated contexts for faster suites that do not need full UI login every time.
- Add multi-browser projects and an environment matrix in CI.
- Add contract/schema validation and richer observability around API failures.

## Infrastructure Considerations

### Project Architecture

- UI layer: page objects
- API layer: request client
- Domain helpers: assertions, data factories, currency utilities
- Tests: thin orchestration layer using `test.step(...)`

This keeps maintenance predictable as the suite grows and avoids mixing selectors, request logic, and assertions in one place.

### Configuration Management

- Defaults live in `.env.example`
- Runtime loading lives in [`src/config/env.ts`](/c:/Users/asafn/Desktop/NICE-Project/src/config/env.ts)
- Public URLs are configurable for future environments without changing test code

For multiple environments, I would keep `.env.qa`, `.env.staging`, `.env.prod-like` and select them in CI via environment-specific jobs.

### Reporting and Debugging

The framework is configured to produce:

- console list output
- HTML report
- JSON report
- JUnit XML report
- screenshot on failure
- video on failure
- trace on first retry

These are enough for local debugging and CI artifact retention without introducing extra tooling too early.

### CI Implementation

A GitHub Actions workflow is included at [`.github/workflows/playwright.yml`](/c:/Users/asafn/Desktop/NICE-Project/.github/workflows/playwright.yml).

The pipeline:

1. Checks out the repository
2. Installs Node dependencies
3. Installs Playwright Chromium
4. Runs typecheck + tests
5. Uploads reports as artifacts

No GitHub API key is needed for this setup. The site under test is public, and `actions/checkout` uses the standard GitHub-provided token automatically.

### Dockerization

A basic Docker setup is included with [`Dockerfile`](/c:/Users/asafn/Desktop/NICE-Project/Dockerfile) and [`docker-compose.yml`](/c:/Users/asafn/Desktop/NICE-Project/docker-compose.yml).

Run it with:

```powershell
docker compose up --build playwright
```

Generated reports are mounted back to the host through `playwright-report/`, `reports/`, and `test-results/` so the container output is easy to inspect after a run.

For a larger setup, I would:

- pin Node and Playwright versions more strictly
- separate dependency install and source copy for better layer caching
- mount reports to a host volume
- allow environment injection per container/job
- create a slimmer runtime image if browsers are pre-baked

## Transfer to Another PC

Best option:

1. Push the repository to GitHub
2. On the other PC run `git clone https://github.com/asaf-1/NICE-Poroject.git`
3. Run `npm.cmd install`
4. Run `npx.cmd playwright install chromium`
5. Run `npm.cmd test`

If you are transferring with SSD/USB:

1. Copy the whole project folder, including the hidden `.git` folder, to the SSD
2. Move it to the new PC
3. Open the folder in the IDE
4. Run `npm.cmd install`
5. Run `npx.cmd playwright install chromium`

Recommended for clean transfer:

- You can skip copying `node_modules/`, `playwright-report/`, `reports/`, and `test-results/`
- Keep `.git/`, `package.json`, `package-lock.json`, source files, tests, and the README
- If PowerShell script execution is restricted on the new PC, use the raw commands instead of the bootstrap script

If you need to hand it over as a ZIP for the assignment, zip the repository root after the files are committed. That will satisfy the "GitHub repository / ZIP" submission requirement.

## Validation Performed

Executed locally against the public ParaBank site on March 26, 2026:

- `npm.cmd run typecheck`
- `npm.cmd run test:negative`
- `npm.cmd run test:core`
- `npm.cmd test`

Result: 4 tests passed.
