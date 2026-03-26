$ErrorActionPreference = 'Stop'

Write-Host 'Installing npm dependencies...'
npm.cmd install

Write-Host 'Installing Playwright Chromium...'
npx.cmd playwright install chromium

Write-Host 'Running the full Playwright suite...'
npm.cmd test

