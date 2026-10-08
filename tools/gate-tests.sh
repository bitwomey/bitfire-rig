#!/usr/bin/env bash
# Proves each gate REJECTS what it should. A gate never shown to fail is
# indistinguishable from no gate, and it fails in the direction that looks
# like success. Run from the repo root.
set -u
cd "$(dirname "$0")/.." || exit 2
# On Windows, npm-spawned bash may not inherit the system PATH where node lives.
export PATH="$PATH:/c/Program Files/nodejs"
SRC=packages/tokens/src/tokens.json
DIST=packages/tokens/dist
TMP=$(mktemp -d); KEEP_JSON=$TMP/tokens.json; KEEP_CSS=$TMP/tokens.css
cp "$SRC" "$KEEP_JSON"; cp "$DIST/tokens.css" "$KEEP_CSS"
pass=0; fail=0
git status --porcelain > "$TMP/before" 2>/dev/null || : > "$TMP/before"
restore() { cp "$KEEP_JSON" "$SRC"; cp "$KEEP_CSS" "$DIST/tokens.css"; }
trap 'restore; rm -rf "$TMP"' EXIT

run() { local name="$1" want="$2"; shift 2
  "$@" >"$TMP/out" 2>&1; local got=$?
  if [ "$got" -eq "$want" ]; then printf '  PASS  %-42s (exit %d)\n' "$name" "$got"; pass=$((pass+1))
  else printf '  FAIL  %-42s (exit %d, wanted %d)\n' "$name" "$got" "$want"; sed 's/^/        /' "$TMP/out" | head -3; fail=$((fail+1)); fi; }

mutate() {
  NODE_MUTATE_SRC="$SRC" node -e "const fs=require('fs');const p=process.env.NODE_MUTATE_SRC;const d=JSON.parse(fs.readFileSync(p,'utf8'));$1;fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');" \
    || { echo "mutate failed: $1"; exit 1; }
}

echo "GATE-FAILURE TESTS"
sed -i 's/--brand-ember: #[0-9a-f]*;/--brand-ember: #00ff00;/' "$DIST/tokens.css"
run "stale generated output rejected" 1 node tools/check-stale.mjs "$SRC" "$DIST"
restore
run "clean tree passes stale check" 0 node tools/check-stale.mjs "$SRC" "$DIST"

mutate "d.spacing.tokens.push({name:'space-bad',value:'10.5pt',usage:'deliberate'})"
run "pt unit rejected" 1 node tools/generate.mjs "$SRC" "$TMP/g"
restore

mutate "d.radius.tokens.push({name:'space-2',value:'8px',usage:'deliberate clash'})"
run "duplicate token name rejected" 1 node tools/generate.mjs "$SRC" "$TMP/g"
restore

mutate "d.type.groups.find(g=>g.name==='Document').family='garamond'"
run "unknown type family rejected" 1 node tools/generate.mjs "$SRC" "$TMP/g"
restore

# Deliberate failures are written OUTSIDE the repo. They used to go into
# fixtures/ and be removed with `rm -f`, which reports success even when the
# delete fails -- and it does fail in a sandboxed folder. The debris then
# tripped the final clean check, so the suite failed for its own leftovers.
BAD="$TMP/badfixtures"; mkdir -p "$BAD"
echo 'export const Bad = () => <div style={{ color: "#c93d06" }} />;' > "$BAD/_bad.tsx"
run "raw hex in TSX rejected" 1 node tools/check-rawcolour.mjs "$BAD"
echo 'export const Bad2 = () => <div className="text-[#ff6a2b]" />;' > "$BAD/_bad2.tsx"
run "Tailwind arbitrary colour rejected" 1 node tools/check-rawcolour.mjs "$BAD"

run "clean fixtures pass" 0 node tools/check-rawcolour.mjs fixtures

# themes.length < 2 guard
mutate "d.color.themes.splice(1)"
run "single theme rejected" 1 node tools/generate.mjs "$SRC" "$TMP/g"
restore

# partial-theme shadow token rejected
mutate "d.shadow.tokens.push({name:'shadow-partial',value:{dark:'0 1px 2px #000'},usage:'deliberate partial'})"
run "partial-theme shadow token rejected" 1 node tools/generate.mjs "$SRC" "$TMP/g"
restore

# shadow alias resolves to var() not literal {token}
mutate "d.shadow.tokens.push({name:'shadow-alias-test',value:{dark:'{canvas}',light:'{canvas}'},usage:'alias test'})"
node tools/generate.mjs "$SRC" "$TMP/g" 2>/dev/null
run "shadow alias emits var() not literal" 0 grep -q 'var(--canvas)' "$TMP/g/tokens.css"
restore

# Values that merely start like a valid one must not pass through verbatim.
mutate "d.color.tokens.push({name:'bad-suffix',value:'{signal}garbage',usage:'deliberate'})"
run "colour with trailing garbage rejected" 1 node tools/generate.mjs "$SRC" "$TMP/g"
restore

mutate "d.shadow.tokens.push({name:'shadow-bad',value:{dark:'{canvas}garbage',light:'0 1px 2px #000'},usage:'deliberate'})"
run "per-theme shadow garbage rejected" 1 node tools/generate.mjs "$SRC" "$TMP/g"
restore

mutate "d.spacing.tokens.push({name:'space-pt-theme',value:{dark:'10pt',light:'4px'},usage:'deliberate'})"
run "per-theme pt length rejected" 1 node tools/generate.mjs "$SRC" "$TMP/g"
restore

mutate "d.opacity.tokens.push({name:'opacity-bad',value:'{canvas}',usage:'deliberate'})"
run "opacity alias rejected" 1 node tools/generate.mjs "$SRC" "$TMP/g"
restore

mutate "d.zIndex.tokens.push({name:'z-bad',value:'10; color:red',usage:'deliberate'})"
run "zIndex injection rejected" 1 node tools/generate.mjs "$SRC" "$TMP/g"
restore

mutate "d.type.families.sans={x:1}"
run "non-string type family rejected" 1 node tools/generate.mjs "$SRC" "$TMP/g"
restore

mutate "d.color.themes[1].id='light\"] { x:y } [a=\"'"
run "theme id with CSS injection rejected" 1 node tools/generate.mjs "$SRC" "$TMP/g"
restore

# The suite must leave the repo exactly as it found it. Compared against the
# state at START, not against the last commit: uncommitted work in progress is
# normal and is not this suite's debris.
git status --porcelain > "$TMP/after" 2>/dev/null || : > "$TMP/after"
if diff -q "$TMP/before" "$TMP/after" >/dev/null 2>&1; then
  echo "  PASS  the suite left the tree as it found it"
  pass=$((pass+1))
else
  echo "  FAIL  the suite changed the working tree"
  diff "$TMP/before" "$TMP/after" | sed 's/^/        /'
  fail=$((fail+1))
fi

echo
echo "  $pass passed, $fail failed"
[ "$fail" -eq 0 ] || exit 1
