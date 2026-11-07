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
    expect(results.violations.map((v) => `${v.id}: ${v.help} at ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });

  test(`no horizontal scroll: ${path}`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('menu overlay opens as a dialog, keeps focus inside and closes with Escape', async ({ page }, testInfo) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 1280, 'The menu button exists below 1280');
  await page.goto('/');
  const open = page.getByRole('button', { name: 'Menu' });
  await open.click();
  const dialog = page.getByRole('dialog', { name: 'Menu' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('aria-current', 'page');
  // Focus stays in the dialog while it is open
  for (let i = 0; i < 25; i++) await page.keyboard.press('Tab');
  expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(open).toBeFocused();
});

test('testimonial slider wraps around at both ends', async ({ page }) => {
  // Reduced motion makes the scroll instant, and checks that preference is respected
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const prev = page.getByRole('button', { name: 'Previous testimonials' });
  const next = page.getByRole('button', { name: 'Next testimonials' });
  // Whether a person's card is fully visible inside the slider
  const shown = (name: string) =>
    page.evaluate((n) => {
      const track = document.querySelector('.slider__track')!.getBoundingClientRect();
      const card = Array.from(document.querySelectorAll('.slide')).find((s) => s.textContent!.includes(n))!.getBoundingClientRect();
      return card.left >= track.left - 2 && card.right <= track.right + 2;
    }, name);
  await page.locator('.slider').scrollIntoViewIfNeeded();
  expect(await shown('Aaron Bauer')).toBe(true);
  // Previous on the first card goes to the last
  await prev.click();
  await expect.poll(() => shown('Marte Berentine Fredriksen')).toBe(true);
  await expect(page.locator('.slider__status')).toContainText('of 13');
  // Next on the last card goes back to the first
  await next.click();
  await expect.poll(() => shown('Aaron Bauer')).toBe(true);
});

test('current page is marked in the navigation', async ({ page }) => {
  await page.goto('/bigfix/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  if (await nav.isHidden()) await page.getByRole('button', { name: 'Menu' }).click();
  const visibleNav = page.getByRole('navigation', { name: 'Main' }).filter({ visible: true });
  await expect(visibleNav.getByRole('link', { name: 'BigFix: the case study' })).toHaveAttribute('aria-current', 'page');
});

test('skip link moves focus to the main content', async ({ page }) => {
  await page.goto('/bigfix/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});
