import { test, expect } from '@playwright/test';
const game = page => page.locator('#game');
async function keys(page, ...sequence) { for (const key of sequence) await page.keyboard.press(key); }
async function start(page) {
  await page.goto('/');
  await expect(game(page)).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: 'Start adventure' }).click();
  await expect(game(page)).toHaveAttribute('data-mode', 'playing');
}
test('loads title, Phaser canvas and placeholder assets without errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
  await page.goto('/');
  await expect(game(page)).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Follow your curiosity.' })).toBeVisible();
  expect(errors).toEqual([]);
});
test('arrows and WASD move and clamp at grid boundaries', async ({ page }) => {
  await start(page);
  await keys(page, 'ArrowRight', 'w');
  await expect(game(page)).toHaveAttribute('data-x', '2');
  await expect(game(page)).toHaveAttribute('data-y', '2');
  await keys(page, 'a', 's', 'ArrowLeft', 'ArrowLeft', 'ArrowLeft');
  await expect(game(page)).toHaveAttribute('data-x', '0');
  await expect(game(page)).toHaveAttribute('data-y', '3');
  await keys(page, 'd', 'ArrowDown', 'ArrowDown');
  await expect(game(page)).toHaveAttribute('data-x', '1');
  await expect(game(page)).toHaveAttribute('data-y', '4');
});
test('empty collection does not score; correct answers score and win', async ({ page }) => {
  await start(page);
  await keys(page, 'Space');
  await expect(page.locator('#score')).toHaveText('0');
  await expect(page.locator('#lives')).toHaveText('3');
  await keys(page, 'ArrowUp', 'ArrowUp', 'ArrowRight', 'ArrowRight', 'Space');
  await expect(page.locator('#score')).toHaveText('100');
  await expect(page.locator('#question')).toHaveText('4 + 4 = ?');
  await keys(page, 'w', 'w', 'd', 'd', 'd', 'd', 'Space');
  await expect(page.locator('#score')).toHaveText('200');
  await keys(page, 'w', 'w', 'Space');
  await expect(game(page)).toHaveAttribute('data-mode', 'won');
  await expect(page.locator('#score')).toHaveText('300');
  await expect(page.getByRole('heading', { name: 'You’re a number star!' })).toBeVisible();
  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(page.locator('#score')).toHaveText('0');
  await expect(game(page)).toHaveAttribute('data-mode', 'playing');
});
test('wrong answers lose lives, loss freezes controls, R restarts cleanly', async ({ page }) => {
  await start(page);
  await keys(page, 'w', 'w', 'Space', 'Space', 'Space');
  await expect(game(page)).toHaveAttribute('data-mode', 'lost');
  await expect(page.locator('#lives')).toHaveText('0');
  await expect(page.getByRole('heading', { name: 'Every try is learning.' })).toBeVisible();
  await keys(page, 'ArrowRight', 'Space');
  await expect(game(page)).toHaveAttribute('data-x', '1');
  await expect(page.locator('#lives')).toHaveText('0');
  await keys(page, 'r');
  await expect(game(page)).toHaveAttribute('data-mode', 'playing');
  await expect(game(page)).toHaveAttribute('data-y', '3');
  await expect(game(page)).toHaveAttribute('data-round', '0');
  await expect(page.locator('#lives')).toHaveText('3');
});
test('Enter starts and restart button resets a scored mission', async ({ page }) => {
  await page.goto('/');
  await expect(game(page)).toHaveAttribute('data-ready', 'true');
  await keys(page, 'Enter', 'w', 'w', 'd', 'd', 'Space');
  await expect(page.locator('#score')).toHaveText('100');
  await page.getByRole('button', { name: 'Restart mission' }).click();
  await expect(page.locator('#score')).toHaveText('0');
  await expect(page.locator('#question')).toHaveText('2 + 3 = ?');
});
test('small viewport fits and touch buttons operate the game', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await start(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  for (const direction of ['Move up', 'Move up', 'Move right', 'Move right']) await page.getByRole('button', { name: direction, exact: true }).click();
  await page.getByRole('button', { name: 'Collect star', exact: true }).click();
  await expect(page.locator('#score')).toHaveText('100');
  const bounds = await page.locator('canvas').boundingBox();
  expect(bounds.width).toBeLessThanOrEqual(375);
  expect(bounds.height).toBeGreaterThan(0);
});
