import { expect, test, type Page } from '@playwright/test';

const STORAGE_KEY = 'fortula-state-v1';

const BASE_STATE = {
  entries: [],
  history: [],
  settings: {
    soundEnabled: false,
    confettiEnabled: false,
    eliminationMode: false,
    spinDurationMs: 2000,
  },
};

async function bootstrapApp(page: Page): Promise<void> {
  await page.addInitScript(
    ({ key, state }) => {
      globalThis.localStorage.setItem(key, JSON.stringify(state));
    },
    { key: STORAGE_KEY, state: BASE_STATE },
  );

  await page.goto('/');
}

async function addEntries(page: Page, names: string[]): Promise<void> {
  const input = page.getByLabel('Add one name');
  const addButton = page.getByRole('button', { name: 'Add' });

  for (const name of names) {
    await input.fill(name);
    await addButton.click();
  }
}

function activeEntries(page: Page) {
  return page.locator('ul[aria-label="Active entries"] > li');
}

async function spinOnce(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Spin' }).click();
  await expect(page.locator('.winner-modal')).toBeVisible({ timeout: 15_000 });
}

test('elimination mode removes winners after each spin', async ({ page }) => {
  await bootstrapApp(page);
  await addEntries(page, ['Alice', 'Bob', 'Cora']);
  await expect(activeEntries(page)).toHaveCount(3);

  await page.getByLabel('Elimination mode').check();

  await spinOnce(page);
  await expect(activeEntries(page)).toHaveCount(2);
  await expect(page.getByText('Removed from wheel')).toBeVisible();
});

test('manual remove still works when elimination mode is off', async ({ page }) => {
  await bootstrapApp(page);
  await addEntries(page, ['Alice', 'Bob']);
  await expect(activeEntries(page)).toHaveCount(2);

  await expect(page.getByLabel('Elimination mode')).not.toBeChecked();

  await spinOnce(page);
  await expect(activeEntries(page)).toHaveCount(2);

  await page.getByRole('button', { name: 'Remove winner' }).click();
  await expect(activeEntries(page)).toHaveCount(1);
  await expect(page.getByText('Removed from wheel')).toBeVisible();
});