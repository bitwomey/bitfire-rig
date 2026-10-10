import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// One test per story per theme, generated from the static build's index.json.
// Docs entries and the proof stories (../proof, only built under A11Y_PROOF)
// are excluded.
const index = JSON.parse(readFileSync(fileURLToPath(new URL('../storybook-static/index.json', import.meta.url)), 'utf8'));
const stories = Object.values<any>(index.entries).filter((e) => e.type === 'story' && !/(^|\/)proof\//.test(e.importPath));
if (!stories.length) throw new Error('no stories in storybook-static/index.json');

// Storybook emits `storyRendered` on the preview channel after the render AND
// the play function have completed (preview runtime: phases rendering, playing,
// completing, completed; STORY_RENDERED is emitted in "completed"). A failed
// render or play emits one of the error events instead. The channel is created
// by assignment to a window global, so a setter catches it before any story
// runs and no event can be missed.
const hook = () => {
  const state: { done: boolean; error: string | null } = { done: false, error: null };
  (window as any).__vr = state;
  let channel: any;
  Object.defineProperty(window, '__STORYBOOK_ADDONS_CHANNEL__', {
    configurable: true,
    get: () => channel,
    set(c) {
      channel = c;
      if (!c || c.__vrHooked) return;
      c.__vrHooked = true;
      c.on('storyRendered', () => { state.done = true; });
      for (const ev of ['storyErrored', 'storyThrewException', 'playFunctionThrewException', 'storyMissing']) {
        c.on(ev, (p: any) => { state.error = `${ev}: ${p?.message ?? JSON.stringify(p)}`; });
      }
    },
  });
};

for (const theme of ['dark', 'light']) {
  for (const s of stories) {
    test(`${s.id} [${theme}]`, async ({ page }) => {
      await page.addInitScript(hook);
      await page.goto(`/iframe.html?id=${s.id}&viewMode=story&globals=theme:${theme}`);
      await page.waitForFunction(() => (window as any).__vr.done || (window as any).__vr.error, null, { timeout: 20_000 });
      const err = await page.evaluate(() => (window as any).__vr.error);
      if (err) throw new Error(`story did not render: ${err}`);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe(theme);

      // Pointer state must not depend on timing. A play function drives hover with
      // simulated events, and Chromium's own fake mouse move (after layout) can
      // clear that state before the screenshot, so the same story gave a hovered
      // image in one run and a plain one in the next. So: hover is baselined only
      // by the *-hovered stories, with a REAL mouse over the control, and
      // incidental hover left by any other story is removed.
      if (/hovered/.test(s.id)) {
        const target = page.locator('#storybook-root').locator('button, a').first();
        await target.hover();
        await expect(target).toHaveAttribute('data-hovered', 'true');
      } else {
        await page.evaluate(() => document.querySelectorAll('[data-hovered]').forEach((e) => e.removeAttribute('data-hovered')));
      }

      // Deliberate-change proof (scripts/check-visual.mjs): must be caught.
      if (process.env.VISUAL_PROOF === '1') await page.addStyleTag({ content: '* { border-radius: 9px !important; }' });

      await expect(page).toHaveScreenshot(`${s.id}--${theme}.png`, { fullPage: true, animations: 'disabled', caret: 'hide' });
    });
  }
}
