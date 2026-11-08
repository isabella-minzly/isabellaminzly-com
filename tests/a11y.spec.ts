import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { allNavItems, footerLinks } from '../src/data/navigation';

// A Set, because the Mandala parent and its first child share /mandala/
const pages = [...new Set(['/design-system/', footerLinks.accessibilityStatement, ...allNavItems.map((item) => item.href)])];

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

  // WCAG 1.4.12: with the text spacing a reader may set, no text is cut off and the page does not scroll sideways
  test(`text spacing: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.addStyleTag({
      content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
        p { margin-block-end: 2em !important; }`,
    });
    const problems = await page.evaluate(() => {
      const found: string[] = [];
      const overflow = document.documentElement.scrollWidth - window.innerWidth;
      if (overflow > 0) found.push(`page scrolls sideways by ${overflow}px`);
      for (const el of document.querySelectorAll<HTMLElement>('body *')) {
        if (el.closest('.visually-hidden, dialog:not([open]), [hidden]') || !el.offsetParent) continue;
        const style = getComputedStyle(el);
        const clips = (value: string) => value === 'hidden' || value === 'clip';
        // Scroll containers (the slider) may scroll, they do not cut text off
        const cutX = clips(style.overflowX) && el.scrollWidth > el.clientWidth + 1;
        const cutY = clips(style.overflowY) && el.scrollHeight > el.clientHeight + 1;
        if ((cutX || cutY) && el.textContent?.trim()) found.push(`${el.tagName.toLowerCase()}.${el.className} is cut off`);
      }
      return found;
    });
    expect(problems).toEqual([]);
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

test('disabled button stays focusable, does nothing and explains itself in a tooltip', async ({ page }) => {
  await page.goto('/design-system/');
  const button = page.getByRole('button', { name: 'Disabled button' }).first();
  const tooltip = page.getByRole('tooltip').first();
  await expect(button).toHaveAttribute('aria-disabled', 'true');
  await expect(button).toHaveAccessibleDescription('Tooltip text explains why an element is disabled.');
  await expect(tooltip).toBeHidden();
  const look = () => button.evaluate((b) => { const s = getComputedStyle(b); return [s.backgroundColor, s.color, s.outlineStyle].join(); });
  const resting = await look();
  // Keyboard focus: the tooltip is the only visible change
  await button.focus();
  await expect(tooltip).toBeVisible();
  expect(await look()).toBe(resting);
  // Escape closes it (WCAG 1.4.13)
  await page.keyboard.press('Escape');
  await expect(tooltip).toBeHidden();
  // Enter, Space and clicks do nothing
  await button.evaluate((b) => b.addEventListener('click', () => ((window as any).activated = true)));
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  // Playwright refuses to click aria-disabled elements, so click with the mouse directly
  const b = (await button.boundingBox())!;
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  expect(await page.evaluate(() => (window as any).activated)).toBeUndefined();
  // Hover shows it again, and the pointer can move onto the tooltip without it closing
  await page.mouse.move(0, 0);
  await button.hover();
  await expect(tooltip).toBeVisible();
  expect(await look()).toBe(resting);
  await tooltip.hover();
  await expect(tooltip).toBeVisible();
  // The tooltip stays inside the screen
  const box = (await tooltip.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
});

test('tooltip lines up with the element near the right edge of the screen', async ({ page }) => {
  await page.goto('/design-system/');
  const button = page.locator('.row--end').getByRole('button', { name: 'Disabled button' });
  await button.focus();
  const tooltip = page.locator('.row--end').getByRole('tooltip');
  await expect(tooltip).toBeVisible();
  const [b, t] = [(await button.boundingBox())!, (await tooltip.boundingBox())!];
  const viewport = page.viewportSize()!.width;
  expect(t.x + t.width).toBeLessThanOrEqual(viewport);
  // Centred if it fits, otherwise lined up with the button's right edge
  if (b.x + b.width / 2 + t.width / 2 > viewport - 16) expect(Math.abs(t.x + t.width - (b.x + b.width))).toBeLessThan(1);
});

test('skip link moves focus to the main content', async ({ page }) => {
  await page.goto('/bigfix/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('theme switch changes the theme with the keyboard, says what it does and remembers the choice', async ({ page }) => {
  await page.goto('/');
  const width = page.viewportSize()?.width ?? 0;
  // Below 1280 the switch is in the menu overlay
  if (width < 1280) await page.getByRole('button', { name: 'Menu' }).click();
  const scope = width < 1280 ? page.getByRole('dialog', { name: 'Menu' }) : page.locator('.sidebar');
  const systemDark = await page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches);
  const toDark = scope.getByRole('button', { name: 'Dark mode' });
  const toLight = scope.getByRole('button', { name: 'Light mode' });

  const first = systemDark ? toLight : toDark;
  await first.focus();
  await page.keyboard.press('Enter');
  const chosen = systemDark ? 'light' : 'dark';
  await expect(page.locator('html')).toHaveAttribute('data-theme', chosen);
  await expect(systemDark ? toDark : toLight).toBeVisible();

  // The choice survives a reload and applies on other pages
  await page.goto('/bigfix/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', chosen);
});

test('axe passes with the light theme chosen while the system is dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});
