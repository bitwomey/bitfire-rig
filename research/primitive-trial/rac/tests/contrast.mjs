// Computes WCAG contrast from real computed styles, in both themes, switching theme with the page's own toggle.
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge' });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:4173/');
await p.click('form button[type=submit]'); // show error state
await p.waitForTimeout(200);
const measure = () => p.evaluate(() => {
  const toRgb = (s) => { const c = document.createElement('canvas').getContext('2d'); c.fillStyle = s; c.fillRect(0, 0, 1, 1); return [...c.getImageData(0, 0, 1, 1).data].slice(0, 3); };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const cr = (a, b) => { const [x, y] = [lum(toRgb(a)), lum(toRgb(b))].sort((m, n) => n - m); return ((x + 0.05) / (y + 0.05)).toFixed(2); };
  const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (!c.endsWith(', 0)')) return c; } return getComputedStyle(document.documentElement).backgroundColor; };
  const out = {};
  const pair = (name, el) => { if (!el) { out[name] = 'missing'; return; } const s = getComputedStyle(el); out[name] = `${cr(s.color, bgOf(el))} (${s.fontSize}/${s.fontWeight})`; };
  document.querySelectorAll('tbody span.label').forEach((el) => { out['chip ' + el.textContent] = `${cr(getComputedStyle(el).color, getComputedStyle(el).backgroundColor)} text/fill`; });
  pair('label', document.querySelector('label'));
  pair('helper text', document.querySelector('[slot=description]'));
  pair('error text', document.querySelector('[slot=errorMessage]'));
  pair('input text vs inset', document.querySelector('input[type=text]'));
  pair('date placeholder segment', document.querySelector('[role=spinbutton][data-placeholder]'));
  pair('select placeholder', document.querySelector('[data-placeholder]'));
  pair('primary button', document.querySelector('form button[type=submit]'));
  pair('table header', document.querySelector('th'));
  const inp = document.querySelector('input[type=text]');
  out['input border vs surface (3:1 needed)'] = cr(getComputedStyle(inp).borderTopColor, getComputedStyle(inp.closest('section')).backgroundColor);
  return out;
});
for (const theme of ['dark', 'light']) {
  if (theme === 'light') { await p.getByText('Dark theme').click(); await p.waitForTimeout(150); }
  console.log(theme, 'data-theme=', await p.evaluate(() => document.documentElement.dataset.theme));
  console.log(JSON.stringify(await measure(), null, 1));
  await p.screenshot({ path: `shots/errors-1280-${theme}.png`, fullPage: true });
}
await b.close();
