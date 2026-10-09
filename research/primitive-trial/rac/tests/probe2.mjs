// Keyboard-only path to a sortable header (no mouse), and combobox Escape/typing details.
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge' });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:4173/');
await p.getByRole('switch', { name: 'Show empty' }).focus();
await p.keyboard.press('Tab'); // into table
const a = () => p.evaluate(() => document.activeElement.getAttribute('role') + ':' + document.activeElement.textContent.slice(0, 20));
console.log('Tab into table ->', await a());
await p.keyboard.press('ArrowUp'); console.log('ArrowUp ->', await a());
await p.keyboard.press('ArrowRight'); console.log('ArrowRight ->', await a());
await p.keyboard.press('Enter'); await p.waitForTimeout(80);
console.log('Enter ->', await p.getByRole('columnheader').evaluateAll((h) => h.map((x) => x.getAttribute('aria-sort')).join(',')), await p.locator('tbody tr').first().innerText().then((t) => t.split('\t')[0]));
await p.keyboard.press('Enter'); await p.keyboard.press('Enter'); await p.waitForTimeout(80);
console.log('Enter x2 more ->', await p.getByRole('columnheader').evaluateAll((h) => h.map((x) => x.getAttribute('aria-sort')).join(',')));
// 360 dialog + popover
await p.setViewportSize({ width: 360, height: 800 });
await p.getByRole('button', { name: /Danger band/ }).click(); await p.waitForTimeout(150);
const r = await p.getByRole('listbox').evaluate((l) => { const x = l.parentElement.getBoundingClientRect(); return [Math.round(x.left), Math.round(x.right)]; });
console.log('360px select popover left/right:', r);
await p.screenshot({ path: 'shots/select-open-360-dark.png' });
await p.keyboard.press('Escape');
await b.close();
