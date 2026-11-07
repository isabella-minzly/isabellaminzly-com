import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { allNavItems, footerLinks } from '../src/data/navigation';

const pages = ['/design-system/', footerLinks.accessibilityStatement, ...allNavItems.map((item) => item.href)];

for (const path of pages) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} element(s), ${v.help}`)).toEqual([]);
  });

  test(`no horizontal scroll: ${path}`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('mobile menu opens, names itself and closes with Escape', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Menu button only exists below 1024');
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Menu' });
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
  await toggle.click();
  await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menu' })).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
});

test('current page is marked in the navigation', async ({ page }) => {
  await page.goto('/bigfix/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  if (await nav.isHidden()) await page.getByRole('button', { name: 'Menu' }).click();
  await expect(nav.getByRole('link', { name: 'BigFix: the case study' })).toHaveAttribute('aria-current', 'page');
});

test('skip link moves focus to the main content', async ({ page }) => {
  await page.goto('/bigfix/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});
