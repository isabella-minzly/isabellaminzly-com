import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  use: { baseURL: 'http://localhost:4330' },
  webServer: {
    // --ignore-lock: Astro refuses to start if an earlier preview left its lock file behind
    command: 'npm run build && npx astro preview --port 4330 --ignore-lock',
    url: 'http://localhost:4330',
    reuseExistingServer: false, // always test a fresh build, never a preview left running
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1680, height: 1000 } } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 800 } } },
    { name: 'dark', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 }, colorScheme: 'dark' } },
  ],
});
