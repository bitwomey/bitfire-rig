import base64, html, pathlib, re, subprocess, sys

scratch = pathlib.Path(sys.argv[1]); out_pdf = pathlib.Path(sys.argv[2])
here = pathlib.Path(__file__).parent
fdir = scratch / "fonts/package/fonts/complete/woff2"

FONTS = [("PlexSerif","IBMPlexSerif-Regular.woff2",400,"normal"),
         ("PlexSerif","IBMPlexSerif-Italic.woff2",400,"italic"),
         ("PlexSerif","IBMPlexSerif-SemiBold.woff2",600,"normal"),
         ("PlexSans","IBMPlexSans-Light.woff2",300,"normal"),
         ("PlexSans","IBMPlexSans-Regular.woff2",400,"normal"),
         ("PlexSans","IBMPlexSans-SemiBold.woff2",600,"normal")]
faces, missing = [], []
for fam, fn, w, st in FONTS:
    p = fdir / fn
    if not p.exists(): missing.append(fn); continue
    b64 = base64.b64encode(p.read_bytes()).decode()
    faces.append("@font-face{font-family:'%s';font-weight:%d;font-style:%s;"
                 "font-display:block;src:url(data:font/woff2;base64,%s) format('woff2')}"
                 % (fam, w, st, b64))
if missing: sys.exit("MISSING FONTS: " + ", ".join(missing))

# 1. pandoc: markdown + bibliography -> html with citations resolved
r = subprocess.run(["pandoc","--citeproc","--bibliography=" + str(here/"refs.bib"),
                    str(here/"body.md"),"-t","html","--wrap=none"],
                   capture_output=True, text=True)
if r.returncode: sys.exit("pandoc failed: " + r.stderr)
body = r.stdout
# an <li> that contains a nested list is a group label, not content
body = re.sub(r'<li>(?=((?!</li>).)*?<ul)', '<li class="grp">', body, flags=re.S)

# 2. contents, built from the headings pandoc produced
toc = []
for m in re.finditer(r'<(h2|h3)[^>]*id="([^"]+)"[^>]*>(.*?)</\1>', body, re.S):
    tag, hid, txt = m.group(1), m.group(2), re.sub(r"<[^>]+>", "", m.group(3)).strip()
    toc.append('<li class="%s"><a href="#%s">%s</a></li>'
               % ("lvl1" if tag == "h2" else "lvl2", hid, html.escape(txt)))

# 3. table of figures, built from the figures themselves
tof = []
for i, m in enumerate(re.finditer(r'<figure id="([^"]+)".*?<figcaption>(.*?)</figcaption>',
                                  body, re.S), start=1):
    fid, cap = m.group(1), re.sub(r"<[^>]+>", "", m.group(2)).strip()
    cap = re.sub(r"\s+", " ", cap).split(".")[0]
    if len(cap) > 58: cap = cap[:57].rsplit(" ", 1)[0] + "\u2026"
    tof.append('<li class="lvl1"><a href="#%s">Figure %d  %s</a></li>'
               % (fid, i, html.escape(cap)))

# Documents are a real consumer of @bitfire/tokens, not a copy of it.
tokpath = here / "node_modules/@bitfire/tokens/dist/tokens.css"
if not tokpath.exists():
    sys.exit("REJECTED: @bitfire/tokens is not installed - run npm install")
tokens_css = tokpath.read_text()
# Print uses the light theme whatever the screen default, so promote the
# [data-theme="light"] block to :root rather than relying on an attribute.
m = re.search(r'\[data-theme="light"\]\s*\{(.*?)\n\}', tokens_css, re.S)
if not m:
    sys.exit("REJECTED: light theme block not found in the generated tokens")
own = (here / "style.css").read_text()
tpl = tokens_css + "\n:root {" + m.group(1) + "\n}\n" + own

# GATE: every token this stylesheet uses must actually be defined. Without
# this, a missing token renders as a browser default and the build still
# reports success - which is how a document ships with no colour in it.
used = set(re.findall(r'var\(\s*(--[A-Za-z0-9_\\.-]+)', own))
defined = set(re.findall(r'^\s*(--[A-Za-z0-9_\\.-]+)\s*:', tpl, re.M))
undefined = sorted(u for u in used if u not in defined)
if undefined:
    sys.exit("REJECTED: %d token(s) used but never defined: %s"
             % (len(undefined), ", ".join(undefined)))
print("tokens ok - %d used, all defined" % len(used), file=sys.stderr)
doc = """<!doctype html><html lang="en-AU"><head><meta charset="utf-8">
<style>__FACES__
__CSS__</style></head><body>
<div class="rule-head"></div><div class="rule-foot"></div>
<div class="eyebrow">Technical note</div><div class="rule"></div>
<h1>Document pipeline specimen</h1>
<p class="lead">Lists, quotes, contents, figures and referenced citations, all
produced from markdown and the BITFire design tokens.</p>
<p class="meta">BITFire &middot; 8 October 2026 &middot; Generated, not typeset by hand</p>
<nav class="contents">
<h2>Contents</h2><ul>__TOC__</ul>
<h2>Figures</h2><ul>__TOF__</ul>
</nav>
__BODY__
</body></html>"""
doc = (doc.replace("__FACES__", "".join(faces)).replace("__CSS__", tpl)
          .replace("__TOC__", "".join(toc)).replace("__TOF__", "".join(tof))
          .replace("__BODY__", body))
(here / "out.html").write_text(doc)

from weasyprint import HTML
HTML(string=doc, base_url=str(here)).write_pdf(str(out_pdf))
print("sections:%d figures:%d -> %s" % (len(toc), len(tof), out_pdf))
