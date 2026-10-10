import { defineConfig } from '@playwright/test';

// Everything that makes a screenshot repeatable is set here or in the spec;
// see "Visual baselines" in CONTRIBUTING.md. Baselines are Linux-only (the CI
// runner's Chromium), so file names carry {platform}.
export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  outputDir: '../test-results/visual',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}-{platform}{ext}',
  // One browser at a time: the baselines do not need parallelism and CI
  // runners are shared. Retries would hide flakiness, so there are none.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  // 'none' = a missing or different snapshot FAILS and nothing is ever written.
  // Only `npm run visual:update` (VISUAL_UPDATE=1) regenerates baselines, and
  // never in the deliberate-change proof run.
  updateSnapshots: process.env.VISUAL_UPDATE === '1' && !process.env.VISUAL_PROOF ? 'all' : 'none',
  reporter: process.env.VISUAL_JSON ? [['list'], ['json', { outputFile: process.env.VISUAL_JSON }]] : 'list',
  // Colours are compared exactly (threshold 0). Up to 50 pixels may differ: on
  // Linux the same Switch rendered 7 pixels apart between two runs, from edge
  // anti-aliasing. A real change is far larger (a hover colour is ~4,000 pixels,
  // a popover ~14,000), and the deliberate-change proof checks that it is caught.
  expect: { toHaveScreenshot: { maxDiffPixels: 50, threshold: 0 } },
  use: {
    viewport: { width: 800, height: 600 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    locale: 'en-AU',
    timezoneId: 'UTC',
    baseURL: 'http://127.0.0.1:6107',
  },
  webServer: {
    command: 'node serve.mjs',
    url: 'http://127.0.0.1:6107/index.json',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
