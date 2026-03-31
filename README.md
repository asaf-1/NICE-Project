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
4. Duplicate username registration attempt

Additional focused coverage:

1. Smoke test for a fresh customer's default account in UI + API
2. API-focused validation for customer + account retrieval after registration
3. API validation for transfer history with matching debit and credit records
4. OpenAPI contract checks against a checked-in Swagger-derived spec
5. Protected-route, duplicate-user, and invalid-create/transfer negative coverage

## Stack

- Playwright with TypeScript
- Page Object Model for UI workflows
- API client layer for REST validation
- `curl` execution through Node child process for the account-creation step
- HTML, JSON, and JUnit reporting

## Project Structure

```text
src/
  contracts/    local OpenAPI contract helpers
  api/          API client
  assertions/   shared response assertions
  config/       environment loading
  constants/    domain constants and messages
  data/         test data factories
  pages/        page objects
  types/        shared domain types
  utils/        curl and currency helpers
tests/
  api/          API-focused scenarios
  contract/     OpenAPI/Swagger-backed contract checks
  e2e/          end-to-end flow
  fixtures/     custom Playwright fixtures
  negative/     negative scenarios
  smoke/        short critical-path validations
openapi/
  parabank.openapi.json
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

## Quick Start For Another User

If you are using this repository on a new machine:

1. Clone or download the repository
2. Run `npm.cmd install`
3. Run `npx.cmd playwright install chromium`
4. Run `npm.cmd test`

If you prefer Docker instead of a local Node setup:

1. Install Docker Desktop
2. Run `docker compose up --build playwright`

The rest of the README below explains the available suites, Docker lanes, Jenkins support, and configuration options.

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

Run only smoke scenarios:

```powershell
npm.cmd run test:smoke
```

Run only API-tagged scenarios:

```powershell
npm.cmd run test:api
```

Run only OpenAPI contract scenarios:

```powershell
npm.cmd run test:contract
```

Run all regression-tagged scenarios:

```powershell
npm.cmd run test:regression
```

Run the parallel-safe suite:

```powershell
npm.cmd run test:parallel
```

Run smoke coverage across Chromium, Firefox, and WebKit:

```powershell
npm.cmd run test:cross-browser
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

Docker execution for the parallel-safe lane:

```powershell
docker compose --profile parallel up --build playwright-parallel
```

Recommended first run for a new user:

```powershell
npm.cmd run typecheck
npm.cmd test
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
- `PARALLEL_WORKERS`
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
- A small custom fixture layer is used for reusable test setup.
  This reduces repeated page-object and API-client wiring in shorter smoke/API scenarios and makes the suite easier to expand.
- A checked-in OpenAPI document is used as a local contract source.
  This supports Swagger-backed contract tests without relying on the live documentation endpoint at runtime.
- Parallel execution is treated as an explicit lane, not the default.
  The public ParaBank environment is shared and can be flaky under higher load, so the full regression stays conservative while parallel-safe API and contract coverage can scale independently.

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
- Add contract checks that validate live API payloads against the checked-in OpenAPI document.
- Introduce fixture-based authenticated contexts for faster suites that do not need full UI login every time.
- Add multi-browser projects and an environment matrix in CI.
- Add contract/schema validation and richer observability around API failures.

## Future Plans

- Add explicit contract validation against the ParaBank OpenAPI/Swagger specification.
- Expand the negative coverage with more business edge cases around transfers, account creation, and invalid inputs.
- Add Jenkins pipeline support alongside GitHub Actions for teams that standardize on Jenkins.
- Extend browser coverage beyond Chromium when execution time and maintenance budget allow.
- Introduce richer test tagging and suite segmentation for smoke, regression, and API-focused runs.

## Infrastructure Considerations

### Project Architecture

- UI layer: page objects
- API layer: request client
- Domain helpers: assertions, data factories, currency utilities
- Tests: thin orchestration layer using `test.step(...)`

This keeps maintenance predictable as the suite grows and avoids mixing selectors, request logic, and assertions in one place.

### Suite Taxonomy

- `@smoke`: short critical-path validations
- `@api`: API-focused checks
- `@contract`: OpenAPI/Swagger-backed checks
- `@negative`: failure and validation scenarios
- `@regression`: broader business coverage
- `@parallel`: read-only or low-risk scenarios that can safely run in parallel against the shared public environment

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

### CI Implementation

A GitHub Actions workflow is included at [`.github/workflows/playwright.yml`](/c:/Users/asafn/Desktop/NICE-Project/.github/workflows/playwright.yml).

The workflow is structured in layers:

1. Fast lane for typecheck + smoke + API + contract coverage
2. Full regression lane for the broader suite
3. Optional cross-browser smoke matrix for Chromium, Firefox, and WebKit
4. Artifact upload per job

No GitHub API key is needed for this setup. The site under test is public, and `actions/checkout` uses the standard GitHub-provided token automatically.

### Jenkins Support

A local [`Jenkinsfile`](/c:/Users/asafn/Desktop/NICE-Project/Jenkinsfile) is included.

It mirrors the same layered approach:

1. Checkout + install
2. Typecheck
3. Parallel quality lanes for smoke, API, and contract coverage
4. Optional parallel-safe lane
5. Optional full regression
6. Artifact archiving

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

Executed locally against the public ParaBank site on March 31, 2026:

- `npm.cmd run typecheck`
- `npm.cmd run test:parallel`
- `npm.cmd test`

Result:

- native full suite passed: 15 tests
- dedicated parallel-safe lane passed: 6 tests

Docker and Jenkins definitions are included in the repository.
Docker execution requires a running Docker daemon on the target machine.
