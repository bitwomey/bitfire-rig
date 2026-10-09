import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge' });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:4173/');
const cb = p.getByRole('combobox', { name: 'Region' });
await cb.click(); await p.keyboard.type('zzz'); await p.waitForTimeout(300);
console.log('listbox count', await p.getByRole('listbox').count(), '| text "No regions match" visible:', await p.getByText('No regions match').isVisible().catch(() => false), '| popover count', await p.locator('[data-trigger=ComboBox]').count(), '| aria-expanded', await cb.getAttribute('aria-expanded'));
await p.screenshot({ path: 'shots/combobox-empty-1280-dark.png' });
await b.close();
