// Drives the production build in real Chromium. Usage: npx vite build; node tests/run.mjs
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vite = path.join(root, "node_modules/vite/bin/vite.js");
const PORT = 4179;
const srv = spawn(process.execPath, [vite, "preview", "--port", String(PORT), "--strictPort"], { cwd: root, stdio: "ignore" });
console.log("PREVIEW_PID", srv.pid);
await new Promise((r) => setTimeout(r, 2500));
const URL = `http://localhost:${PORT}/`;
const log = (k, v) => console.log(`${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
const shot = (page, name, opts = {}) => page.screenshot({ path: path.join(root, "shots", name), ...opts });

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) errs.push(m.type() + ": " + m.text()); });
  page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
  await page.goto(URL);
  await page.waitForTimeout(1000);
  log("fonts", await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family + f.weight)));

  const active = () => page.evaluate(() => {
    const a = document.activeElement; if (!a) return "none";
    const l = a.id ? `#${a.id}` : "";
    return `${a.tagName.toLowerCase()}${l}[${(a.getAttribute("aria-label") || a.textContent || a.getAttribute("placeholder") || "").trim().slice(0, 24)}]`;
  });

  // Tab order
  const fwd = []; for (let i = 0; i < 24; i++) { await page.keyboard.press("Tab"); fwd.push(await active()); }
  log("tab-forward", fwd);
  const back = []; for (let i = 0; i < 6; i++) { await page.keyboard.press("Shift+Tab"); back.push(await active()); }
  log("tab-backward-6", back);

  await shot(page, "dark-1280-empty.png", { fullPage: true });
  await page.click("form button[type=submit]");
  log("after-invalid-submit focus", await active());
  log("error-alerts", await page.$$eval("[role=alert]", (e) => e.map((x) => x.id + ":" + x.textContent)));
  for (const id of ["name", "band", "region"])
    log(id + " aria", await page.$eval("#f-" + id, (e) => ({ invalid: e.getAttribute("aria-invalid"), desc: e.getAttribute("aria-describedby") })));
  await shot(page, "dark-1280-errors.png", { fullPage: true });
  await page.fill("#f-name", "ab"); log("revalidate on change (2 chars)", await page.textContent("#e-name"));
  await page.fill("#f-name", "Test Fire"); log("revalidate on change (valid)", (await page.$("#e-name")) ? "error still present" : "error cleared");
  await page.fill("#f-date", "2026-10-10"); log("future date", await page.textContent("#e-date"));
  await page.fill("#f-email", "nope"); log("bad email", await page.textContent("#e-email"));
  await page.fill("#f-notes", "short"); log("short notes", await page.textContent("#e-notes"));

  // Select keyboard
  await page.focus("#f-band");
  await page.keyboard.press("Enter"); await page.waitForTimeout(250);
  log("select open after Enter", await page.$$eval("[role=option]", (o) => o.map((x) => x.textContent)));
  log("select focus in open list", await page.evaluate(() => document.activeElement?.getAttribute("role") + ":" + document.activeElement?.textContent));
  await shot(page, "dark-1280-select-open.png");
  await page.keyboard.press("ArrowDown"); await page.keyboard.press("ArrowDown");
  log("select focus after 2x ArrowDown", await page.evaluate(() => document.activeElement?.textContent));
  await page.keyboard.press("Enter"); await page.waitForTimeout(200);
  log("select value after Enter", await page.textContent("#f-band"));
  log("select focus after choose", await active());
  await page.keyboard.press("Space"); await page.waitForTimeout(200);
  log("select open after Space", (await page.$$("[role=option]")).length);
  await page.keyboard.press("Escape"); await page.waitForTimeout(200);
  log("select after Escape", (await page.$$("[role=option]")).length + " options, focus " + (await active()));
  await page.keyboard.press("ArrowDown"); await page.waitForTimeout(200);
  log("select ArrowDown on closed trigger -> options", (await page.$$("[role=option]")).length);
  await page.keyboard.press("Escape"); await page.waitForTimeout(200);
  await page.keyboard.type("Ext"); await page.waitForTimeout(200);
  log("select typeahead Ext on closed trigger", await page.textContent("#f-band"));

  // Combobox
  await page.focus("#f-region");
  await page.keyboard.type("hu"); await page.waitForTimeout(250);
  log("combobox hu", await page.$$eval("[role=option]", (o) => o.map((x) => x.textContent)));
  await shot(page, "dark-1280-combobox-open.png");
  await page.keyboard.press("ArrowDown"); await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter"); await page.waitForTimeout(200);
  log("combobox value after 2x ArrowDown+Enter", await page.inputValue("#f-region"));
  await page.fill("#f-region", ""); await page.keyboard.type("ZZZ"); await page.waitForTimeout(250);
  log("combobox ZZZ", { options: (await page.$$("[role=option]")).length, empty: await page.evaluate(() => document.body.innerText.includes("No regions match")) });
  await shot(page, "dark-1280-combobox-empty.png");
  await page.keyboard.press("Escape"); await page.waitForTimeout(200);
  log("combobox after Escape", { listbox: (await page.$$("[role=listbox]")).length, input: await page.inputValue("#f-region") });
  await page.fill("#f-region", ""); await page.keyboard.type("hunter"); await page.waitForTimeout(200);
  log("combobox hunter case-insensitive", await page.$$eval("[role=option]", (o) => o.map((x) => x.textContent)));
  await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter"); await page.waitForTimeout(200);
  log("combobox value", await page.inputValue("#f-region"));
  log("combobox aria", await page.$eval("#f-region", (e) => ({ role: e.getAttribute("role"), expanded: e.getAttribute("aria-expanded"), desc: e.getAttribute("aria-describedby"), label: e.labels?.[0]?.textContent })));

  // Valid fill -> dialog
  await page.fill("#f-date", "2026-10-01"); await page.fill("#f-email", "ops@example.org"); await page.fill("#f-notes", "");
  const submit = page.locator("form button[type=submit]");
  await submit.focus(); await page.keyboard.press("Enter"); await page.waitForTimeout(500);
  log("dialog open", (await page.$("[role=dialog]")) ? "yes" : "no");
  log("dialog focus on open", await active());
  const inDlg = () => page.evaluate(() => !!document.activeElement?.closest("[role=dialog]"));
  const trap = []; for (let i = 0; i < 6; i++) { await page.keyboard.press("Tab"); trap.push((await active()) + ((await inDlg()) ? " IN" : " OUT")); }
  log("dialog Tab x6", trap);
  const trapB = []; for (let i = 0; i < 3; i++) { await page.keyboard.press("Shift+Tab"); trapB.push((await active()) + ((await inDlg()) ? " IN" : " OUT")); }
  log("dialog Shift+Tab x3", trapB);
  log("dialog a11y", await page.$eval("[role=dialog]", (d) => ({ labelledby: d.getAttribute("aria-labelledby"), describedby: d.getAttribute("aria-describedby"), title: d.querySelector("h2")?.textContent })));
  log("background hidden", await page.evaluate(() => { const m = document.querySelector("main"); return m ? (m.getAttribute("aria-hidden") ?? m.parentElement.getAttribute("aria-hidden") ?? "not hidden") : "?"; }));
  await shot(page, "dark-1280-dialog.png");
  await page.keyboard.press("Escape"); await page.waitForTimeout(400);
  log("after Escape", { dialog: !!(await page.$("[role=dialog]")), focus: await active() });
  await submit.click(); await page.waitForTimeout(400);
  await page.getByRole("button", { name: "Cancel" }).click(); await page.waitForTimeout(400);
  log("after Cancel", { dialog: !!(await page.$("[role=dialog]")), focus: await active() });
  await submit.click(); await page.waitForTimeout(400);
  await page.locator("[role=dialog]").getByRole("button", { name: "Submit", exact: true }).click(); await page.waitForTimeout(250);
  log("loading state", await page.evaluate(() => { const b = [...document.querySelectorAll("[role=dialog] button")].find((x) => /Submitting/.test(x.textContent)); return b ? { text: b.textContent, disabled: b.disabled, busy: b.getAttribute("aria-busy"), spinner: !!b.querySelector("svg.animate-spin") } : "none"; }));
  await shot(page, "dark-1280-loading.png");
  await page.keyboard.press("Escape"); await page.waitForTimeout(100);
  log("Escape during loading", (await page.$("[role=dialog]")) ? "still open" : "closed");
  await page.waitForTimeout(1400);
  log("after success", { dialog: !!(await page.$("[role=dialog]")), banner: await page.textContent("[role=status]").catch(() => null), focus: await active(), nameValue: await page.inputValue("#f-name") });
  await shot(page, "dark-1280-success.png");

  // Table
  const names = () => page.$$eval("tbody tr td:first-child", (c) => c.map((x) => x.textContent));
  const sorts = () => page.$$eval("th", (c) => c.map((x) => x.getAttribute("aria-sort")));
  const th = (n) => page.locator("th button", { hasText: n });
  log("table initial", await names());
  for (let i = 0; i < 3; i++) { await th("Area").click(); log(`Area click ${i + 1}`, { aria: await sorts(), first3: (await names()).slice(0, 3) }); }
  await th("Danger band").focus(); await page.keyboard.press("Enter"); log("Band Enter", { aria: await sorts(), first3: (await names()).slice(0, 3) });
  await page.keyboard.press("Space"); log("Band Space", { aria: await sorts(), first3: (await names()).slice(0, 3) });
  await page.keyboard.press("Space"); log("Band Space (3rd)", { aria: await sorts() });
  await th("Updated").click(); log("Updated asc first/last", (await names()).filter((_, i, a) => i === 0 || i === a.length - 1));
  await th("Updated").click(); await th("Updated").click();
  await th("Name").click(); await th("Name").click(); log("Name desc first", (await names())[0]);
  await th("Name").click();
  log("area cell style", await page.$eval("tbody tr td:nth-child(3)", (e) => { const s = getComputedStyle(e); return { align: s.textAlign, font: s.fontFamily.slice(0, 30), tnum: s.fontVariantNumeric, text: e.textContent }; }));
  await page.check("#t-loading"); await page.waitForTimeout(100);
  log("loading table", await page.evaluate(() => ({ busy: document.querySelector("table")?.getAttribute("aria-busy"), skeletons: document.querySelectorAll("[data-slot=skeleton]").length })));
  await shot(page, "dark-1280-table-loading.png", { fullPage: true });
  await page.uncheck("#t-loading"); await page.check("#t-empty");
  log("empty table", await page.textContent("tbody"));
  await page.uncheck("#t-empty");

  // Disabled demo
  await page.check("#t-disabled"); await page.waitForTimeout(150);
  log("disabled demo", await page.evaluate(() => {
    const f = document.querySelector("form"); const els = [...f.querySelectorAll("input,textarea,button,[role=checkbox],[role=combobox]")];
    return els.map((e) => `${e.id || e.tagName}:${e.disabled || e.getAttribute("data-disabled") !== null || e.getAttribute("aria-disabled")}`);
  }));
  await shot(page, "dark-1280-disabled.png", { fullPage: true });
  await page.uncheck("#t-disabled");

  // Audits
  const audit = () => page.evaluate(() => {
    const bad = []; const seen = new Set();
    for (const el of document.querySelectorAll("body *")) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const s = getComputedStyle(el); const fs = parseFloat(s.fontSize), fw = parseInt(s.fontWeight);
      const k = `${fs}/${fw}/${el.tagName}`;
      if (fs < 14 || (fs < 14 && fw < 400)) { if (!seen.has(k)) { seen.add(k); bad.push(`${el.tagName.toLowerCase()} ${fs}px w${fw}: ${el.textContent.trim().slice(0, 30)}`); } }
    }
    return bad;
  });
  const weightAudit = () => page.evaluate(() => {
    const bad = []; const seen = new Set();
    for (const el of document.querySelectorAll("body *")) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const s = getComputedStyle(el); const fs = parseFloat(s.fontSize), fw = parseInt(s.fontWeight);
      if (fs < 14 && fw < 400) bad.push(el.tagName);
      if (fs >= 14 && fs < 18 && fw < 400 && !seen.has(el.tagName + fw)) { seen.add(el.tagName + fw); bad.push(`${el.tagName.toLowerCase()} ${fs}px w${fw} (>=14px, light weight; allowed by rule): ${el.textContent.trim().slice(0, 30)}`); }
    }
    return bad;
  });
  log("font audit dark (<14px)", await audit());
  log("weight audit dark", await weightAudit());
  const contrast = () => page.evaluate(() => {
    const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const toChannels = (v) => { c.clearRect(0, 0, 1, 1); c.fillStyle = "black"; c.fillStyle = v; c.fillRect(0, 0, 1, 1); const d = c.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]]; };
    const L = ([r, g, b]) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const cr = (a, b) => { const [x, y] = [L(toChannels(a)), L(toChannels(b))].sort((p, q) => q - p); return +(((x + 0.05) / (y + 0.05)).toFixed(2)); };
    const css = (el, p) => getComputedStyle(el)[p];
    const q = (s) => document.querySelector(s);
    const surface = css(q("section"), "backgroundColor");
    const res = {};
    res.heading_vs_canvas = cr(css(q("h1"), "color"), css(document.body, "backgroundColor"));
    res.helper_vs_surface = cr(css(q("#h-name"), "color"), surface);
    res.input_border_vs_surface = cr(css(q("#f-name"), "borderTopColor"), surface);
    res.label_vs_surface = cr(css(q("label"), "color"), surface);
    res.primary_button = cr(css(q("form button[type=submit]"), "color"), css(q("form button[type=submit]"), "backgroundColor"));
    res.placeholder = cr(getComputedStyle(q("#f-region"), "::placeholder").color, surface);
    res.error_text_vs_surface = null;
    for (const el of document.querySelectorAll("tbody td:nth-child(2) span")) res["chip " + el.textContent] = cr(css(el, "color"), css(el, "backgroundColor"));
    return res;
  });
  await page.click("form button[type=submit]");
  const errC = () => page.evaluate(() => { const e = document.querySelector("[role=alert]"); if (!e) return null; const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true }); const toChannels = (v) => { c.clearRect(0,0,1,1); c.fillStyle = "black"; c.fillStyle = v; c.fillRect(0,0,1,1); const d = c.getImageData(0,0,1,1).data; return [d[0],d[1],d[2]]; }; const L = ([r,g,b]) => { const f = (x) => { x/=255; return x<=0.03928?x/12.92:((x+0.055)/1.055)**2.4; }; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); }; const [x,y] = [L(toChannels(getComputedStyle(e).color)), L(toChannels(getComputedStyle(document.querySelector("section")).backgroundColor))].sort((p,q)=>q-p); return +(((x+0.05)/(y+0.05)).toFixed(2)); });
  log("contrast dark", await contrast());
  log("error text contrast dark", await errC());
  await page.click("#t-theme"); await page.waitForTimeout(300);
  log("theme attr", await page.evaluate(() => document.documentElement.getAttribute("data-theme")));
  log("contrast light", await contrast());
  log("error text contrast light", await errC());
  log("font audit light", await audit());
  await shot(page, "light-1280-errors.png", { fullPage: true });
  await page.click("#f-band"); await page.waitForTimeout(250);
  await shot(page, "light-1280-select-open.png");
  await page.keyboard.press("Escape");
  await page.fill("#f-region", ""); await page.focus("#f-region"); await page.keyboard.type("a"); await page.waitForTimeout(250);
  await shot(page, "light-1280-combobox-open.png");
  await page.keyboard.press("Escape");

  // screenshot set required: both themes at 1280 and 360 (clean state)
  await page.reload(); await page.waitForTimeout(800);
  await page.click("#t-theme"); await page.waitForTimeout(200);
  await shot(page, "light-1280.png", { fullPage: true });
  await page.click("#t-theme"); await page.waitForTimeout(200);
  await shot(page, "dark-1280.png", { fullPage: true });
  await page.setViewportSize({ width: 360, height: 800 }); await page.waitForTimeout(300);
  log("360 dark overflow", await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, tableContainer: (() => { const w = document.querySelector("[data-slot=table-container]"); return w ? { sw: w.scrollWidth, cw: w.clientWidth } : "no container"; })() })));
  await shot(page, "dark-360.png", { fullPage: true });
  await page.click("#t-theme"); await page.waitForTimeout(300);
  log("360 light overflow", await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })));
  await shot(page, "light-360.png", { fullPage: true });
  await page.fill("#f-name", "Test Fire"); await page.click("#f-band"); await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter");
  await page.fill("#f-date", "2026-10-01"); await page.fill("#f-email", "ops@example.org"); await page.fill("#f-region", "Wim"); await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter");
  await page.click("form button[type=submit]"); await page.waitForTimeout(500);
  await shot(page, "light-360-dialog.png");
  log("360 dialog box", await page.$eval("[role=dialog]", (d) => { const r = d.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, vw: innerWidth, vh: innerHeight }; }));
  log("console", errs);
} finally {
  await browser.close();
  try { process.kill(srv.pid); console.log("killed", srv.pid); } catch (e) { console.log("kill failed", e.message); }
}
