// Drives the built page in real Edge via Playwright. Prints OBSERVED lines; no assertions hidden.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const URL = 'http://localhost:4173/';
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const log = (...a) => console.log(...a);
const errs = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errs.push(`${m.type()}: ${m.text()}`); });
page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));

const active = () => page.evaluate(() => {
  const e = document.activeElement;
  if (!e || e === document.body) return 'BODY';
  const l = e.getAttribute('aria-label') || (e.labels && e.labels[0]?.textContent) || e.textContent?.trim().slice(0, 30);
  return `${e.tagName.toLowerCase()}${e.type ? '[' + e.type + ']' : ''}${e.getAttribute('role') ? '{' + e.getAttribute('role') + '}' : ''} "${l}"`;
});
const tabs = async (n, key = 'Tab') => { const out = []; for (let i = 0; i < n; i++) { await page.keyboard.press(key); out.push(await active()); } return out; };

await page.goto(URL);
await page.waitForSelector('h1');

log('## 1 Tab order (forward)');
log((await tabs(22)).join('\n'));
log('## 1b Shift+Tab x5 from there');
log((await tabs(5, 'Shift+Tab')).join('\n'));

log('## 2 Submit empty form');
await page.click('button:has-text("Submit")');
await page.waitForTimeout(300);
log('focused after failed submit:', await active());
log('error messages:', JSON.stringify(await page.$$eval('[data-invalid]', (els) => els.map((e) => (e.getAttribute('data-react-aria-pressable') ? '' : '') + e.tagName + ':' + (e.closest('[class]')?.querySelector('[slot=errorMessage]')?.textContent || '')))));
log('errorMessage slots:', JSON.stringify(await page.$$eval('[slot=errorMessage]', (e) => e.map((x) => x.textContent))));
log('aria-describedby on name input resolves to:', await page.$eval('form input[type=text] >> nth=0', (i) => i.getAttribute('aria-describedby') && i.getAttribute('aria-describedby').split(' ').map((id) => document.getElementById(id)?.textContent).join(' | ')));
await page.screenshot({ path: 'shots/errors-1280-dark.png', fullPage: true });

log('## 3 Revalidate on change');
await page.fill('form input[type=text] >> nth=0', 'ab');
await page.waitForTimeout(150);
log('after typing "ab":', await page.$eval('form input[type=text] >> nth=0', (i) => i.getAttribute('aria-invalid') + ' / ' + document.getElementById(i.getAttribute('aria-describedby')?.split(' ').pop() || 'x')?.textContent));
await page.fill('form input[type=text] >> nth=0', 'Test Fire');
await page.waitForTimeout(150);
log('after typing "Test Fire": aria-invalid=', await page.$eval('form input[type=text] >> nth=0', (i) => i.getAttribute('aria-invalid')));

log('## 4 Select keyboard');
const selBtn = page.getByRole('button', { name: /Danger band/ });
await selBtn.focus();
await page.keyboard.press('Enter');
await page.waitForTimeout(150);
log('Enter opens listbox:', await page.locator('[role=listbox]').count());
await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown');
log('focused option:', await page.evaluate(() => document.activeElement.textContent));
await page.keyboard.press('Escape');
await page.waitForTimeout(150);
log('Escape closes:', await page.locator('[role=listbox]').count(), 'focus:', await active());
await page.keyboard.press('Space'); await page.waitForTimeout(150);
log('Space opens:', await page.locator('[role=listbox]').count());
await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown');
log('focused option after 3 downs:', await page.evaluate(() => document.activeElement.textContent));
await page.keyboard.press('Enter'); await page.waitForTimeout(150);
log('selected value:', await selBtn.textContent(), '| listbox open:', await page.locator('[role=listbox]').count());

log('## 5 Date field');
const seg = page.locator('[role=spinbutton]');
log('segments:', await seg.count());
await seg.nth(0).focus();
await page.keyboard.type('15102026');
await page.waitForTimeout(200);
log('future date typed (15/10/2026) -> text:', await page.locator('[role=group]').first().textContent(), '| invalid:', await page.$eval('[role=spinbutton]', (i) => i.closest('[data-invalid]') ? 'data-invalid' : 'valid'));
log('start error text:', JSON.stringify(await page.$$eval('[slot=errorMessage]', (e) => e.map((x) => x.textContent))));
await seg.nth(0).focus();
await page.keyboard.type('08102026');
await page.waitForTimeout(200);
log('segment order/labels:', JSON.stringify(await seg.evaluateAll((s) => s.map((x) => x.getAttribute('aria-label') + '=' + x.textContent))));
await page.fill('input[type=email]', 'not-an-email');
await page.waitForTimeout(150);
log('email error:', JSON.stringify(await page.$$eval('[slot=errorMessage]', (e) => e.map((x) => x.textContent))));
await page.fill('input[type=email]', 'a@example.org');

log('## 6 Combobox');
const cb = page.getByRole('combobox', { name: 'Region' });
await cb.click();
await page.waitForTimeout(150);
log('options on focus/click (menuTrigger=focus):', await page.getByRole('option').count());
await cb.fill('');
await page.keyboard.type('hun');
await page.waitForTimeout(200);
log('"hun" ->', JSON.stringify(await page.getByRole('option').allTextContents()));
await page.keyboard.press('ArrowDown');
log('ArrowDown active option (aria-activedescendant):', await cb.evaluate((i) => document.getElementById(i.getAttribute('aria-activedescendant'))?.textContent));
await page.keyboard.press('Enter'); await page.waitForTimeout(150);
log('Enter -> input value:', await cb.inputValue(), '| open:', await page.getByRole('listbox').count());
await cb.fill(''); await page.keyboard.type('zzz'); await page.waitForTimeout(200);
log('"zzz" ->', JSON.stringify(await page.locator('[role=listbox]').allTextContents()), '| options:', await page.getByRole('option').count());
await page.keyboard.press('Escape'); await page.waitForTimeout(150);
log('Escape: listbox count', await page.locator('[role=listbox]').count(), '| input value now:', JSON.stringify(await cb.inputValue()));
await cb.fill(''); await page.keyboard.type('PILB'); await page.waitForTimeout(150);
await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
log('case-insensitive PILB ->', await cb.inputValue());

log('## 7 Notes validation');
await page.fill('textarea', 'short'); await page.waitForTimeout(100);
log('notes short error:', JSON.stringify(await page.$$eval('[slot=errorMessage]', (e) => e.map((x) => x.textContent))));
await page.fill('textarea', ''); await page.waitForTimeout(100);

log('## 8 Dialog');
const submit = page.locator('form button[type=submit]');
await submit.focus();
await page.keyboard.press('Enter');
await page.waitForSelector('[role=dialog]');
await page.waitForTimeout(250);
log('dialog open. focus:', await active());
log('dialog labelledby text:', await page.$eval('[role=dialog]', (d) => document.getElementById(d.getAttribute('aria-labelledby'))?.textContent));
log('summary:', (await page.locator('dl').innerText()).replace(/\n/g, ' / '));
await page.screenshot({ path: 'shots/dialog-1280-dark.png' });
log('trap Tab x6:', (await tabs(6)).join(' > '));
log('trap Shift+Tab x3:', (await tabs(3, 'Shift+Tab')).join(' > '));
await page.keyboard.press('Escape'); await page.waitForTimeout(250);
log('Escape closes:', await page.locator('[role=dialog]').count(), 'focus restored to:', await active());
await submit.focus(); await page.keyboard.press('Enter'); await page.waitForSelector('[role=dialog]'); await page.waitForTimeout(200);
await page.getByRole('button', { name: 'Cancel' }).click(); await page.waitForTimeout(250);
log('Cancel closes:', await page.locator('[role=dialog]').count(), 'focus restored to:', await active());
await page.mouse.click(5, 5);
await submit.click(); await page.waitForSelector('[role=dialog]'); await page.waitForTimeout(200);
log('outside page inert while open? aria-hidden siblings:', await page.evaluate(() => [...document.body.children].map((c) => c.tagName + (c.getAttribute('aria-hidden') ? '[aria-hidden]' : '') + (c.hasAttribute('inert') ? '[inert]' : '')).join(',')));
await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
await page.waitForTimeout(150);
const sb = page.getByRole('dialog').getByRole('button').last();
log('during loading: text=', JSON.stringify(await sb.textContent()), 'aria-busy=', await sb.getAttribute('aria-busy'), 'aria-disabled=', await sb.getAttribute('aria-disabled'), 'data-pending=', await sb.getAttribute('data-pending'));
await page.screenshot({ path: 'shots/loading-1280-dark.png' });
await page.waitForTimeout(1400);
log('after 1.2s: dialog count', await page.locator('[role=dialog]').count(), '| banner:', await page.locator('[role=status]').innerText().catch(() => 'none'), '| focus:', await active());

log('## 9 Table keyboard');
const hdr = page.getByRole('columnheader');
log('columnheaders:', await hdr.count());
const sortState = () => hdr.evaluateAll((h) => h.map((x) => x.textContent.trim() + ':' + (x.getAttribute('aria-sort') || '-')).join(' | '));
const firstRows = () => page.locator('tbody tr').evaluateAll((r) => r.slice(0, 3).map((x) => x.cells[0].textContent).join(','));
await hdr.nth(2).click(); // mouse focus into the table
for (const k of ['Enter', 'Enter', 'Enter', 'Space', 'Space', 'Space']) {
  await page.keyboard.press(k); await page.waitForTimeout(80);
  log(`area header ${k}:`, await sortState(), '|', await firstRows());
}
log('focus on header after:', await active());
await page.keyboard.press('ArrowLeft'); log('ArrowLeft ->', await active());
await page.keyboard.press('ArrowDown'); log('ArrowDown ->', await active());
log('Tab from table ->', (await tabs(1)).join(), '; Shift+Tab ->', (await tabs(1, 'Shift+Tab')).join());
log('tab stops inside table:', await page.locator('table [tabindex="0"]').count());
await page.getByRole('columnheader', { name: 'Danger band' }).click(); await page.waitForTimeout(80);
log('band asc:', await firstRows());
await page.getByRole('columnheader', { name: 'Danger band' }).click(); await page.waitForTimeout(80);
log('band desc:', await firstRows());
await page.getByRole('columnheader', { name: 'Danger band' }).click(); await page.waitForTimeout(80);
log('band none:', await sortState());

log('## 10 table loading / empty');
await page.getByText('Show loading').click(); await page.waitForTimeout(100);
log('loading rows:', await page.locator('tbody tr').count(), 'text:', await page.locator('tbody').innerText().then((t) => t.replace(/\n/g, ' ').slice(0, 80)));
await page.screenshot({ path: 'shots/table-loading-1280-dark.png' });
await page.getByText('Show loading').click();
await page.getByText('Show empty').click(); await page.waitForTimeout(100);
log('empty body:', JSON.stringify(await page.locator('tbody').innerText()));
await page.getByText('Show empty').click();

log('## 11 Disabled demo');
await page.getByText('Disabled demo').click(); await page.waitForTimeout(150);
log('disabled controls:', await page.$$eval('form input, form textarea, form button', (e) => e.filter((x) => x.disabled || x.getAttribute('aria-disabled') === 'true').length + '/' + e.length));
log('segments disabled:', await page.$$eval('[role=spinbutton]', (e) => e.map((x) => x.getAttribute('aria-disabled'))).then((a) => a.join(',')));
log('select btn disabled:', await page.getByRole('button', { name: /Danger band/ }).isDisabled());
log('Tab through form while disabled:', (await tabs(8)).join(' > '));
await page.screenshot({ path: 'shots/disabled-1280-dark.png', fullPage: true });
await page.getByText('Disabled demo').click();

log('## 12 Screenshots');
await page.reload(); await page.waitForSelector('h1');
for (const [w, h] of [[1280, 900], [360, 800]]) {
  await page.setViewportSize({ width: w, height: h });
  for (const th of ['dark', 'light']) {
    if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== th) await page.getByText('Dark theme').click();
    await page.waitForTimeout(150);
    await page.screenshot({ path: `shots/page-${w}-${th}.png`, fullPage: true });
    const sw = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    log(`${w}px ${th}: scrollWidth/clientWidth`, sw.join('/'));
  }
}
// narrow: dialog + table scroll
await page.setViewportSize({ width: 360, height: 800 });
log('table container scrolls inside itself:', await page.$eval('table', (t) => t.parentElement.scrollWidth > t.parentElement.clientWidth));
log('console/page errors:', JSON.stringify(errs));
await browser.close();
