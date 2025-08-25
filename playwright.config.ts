import { defineConfig, devices, type Project } from '@playwright/test';

const projects: Project[] = [

  {
    name: 'Chrome',
    use: {
      browserName: 'chromium',
      channel: 'chrome',
      viewport: { width: 1920, height: 1080 }, 
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
   },
  {
    name: 'Edge',
    use: {
      browserName: 'chromium',
      channel: 'msedge',
      viewport: { width: 1920, height: 1080 }, 
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    },
  },
  {
    name: 'Firefox',
    use: {
      browserName: 'firefox',
      viewport: { width: 1920, height: 1080 }, 
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    },
  },
];



export default defineConfig({
  testDir: './tests/specs',
  timeout: 60_000,
  retries: 0,
  workers: 1,
  reporter: [['html', { open: 'on-failure' }]],
  fullyParallel: true,
  globalSetup: './tests/fixtures/global/setup.ts',
  globalTeardown: './tests/fixtures/global/teardown.ts',
  use: {
    baseURL: 'http://localhost:3000',
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    testIdAttribute: 'data-qa-id',
    actionTimeout: 10000,    
    ignoreHTTPSErrors: true, 
  },
  projects: projects,
});
