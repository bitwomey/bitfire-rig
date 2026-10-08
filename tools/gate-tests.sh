#!/usr/bin/env bash
# Proves each gate REJECTS what it should. A gate never shown to fail is
# indistinguishable from no gate, and it fails in the direction that looks
# like success. Run from the repo root.
set -u
cd "$(dirname "$0")/.." || exit 2
SRC=packages/tokens/src/tokens.json
DIST=packages/tokens/dist
TMP=$(mktemp -d); KEEP_JSON=$TMP/tokens.json; KEEP_CSS=$TMP/tokens.css
cp "$SRC" "$KEEP_JSON"; cp "$DIST/tokens.css" "$KEEP_CSS"
pass=0; fail=0
restore() { cp "$KEEP_JSON" "$SRC"; cp "$KEEP_CSS" "$DIST/tokens.css"; }
trap 'restore; rm -rf "$TMP"' EXIT

run() { local name="$1" want="$2"; shift 2
  "$@" >"$TMP/out" 2>&1; local got=$?
  if [ "$got" -eq "$want" ]; then printf '  PASS  %-42s (exit %d)\n' "$name" "$got"; pass=$((pass+1))
  else printf '  FAIL  %-42s (exit %d, wanted %d)\n' "$name" "$got" "$want"; sed 's/^/        /' "$TMP/out" | head -3; fail=$((fail+1)); fi; }

mutate() { python3 -I -c "$1" ; }

echo "GATE-FAILURE TESTS"
sed -i 's/--brand-ember: #[0-9a-f]*;/--brand-ember: #00ff00;/' "$DIST/tokens.css"
run "stale generated output rejected" 1 node tools/check-stale.mjs "$SRC" "$DIST"
restore
run "clean tree passes stale check" 0 node tools/check-stale.mjs "$SRC" "$DIST"

mutate "
import json,pathlib
p=pathlib.Path('$SRC'); d=json.loads(p.read_text())
d['spacing']['tokens'].append({'name':'space-bad','value':'10.5pt','usage':'deliberate'})
p.write_text(json.dumps(d,indent=2)+'\n')"
run "pt unit rejected" 1 node tools/generate.mjs "$SRC" "$TMP/g"
restore

mutate "
import json,pathlib
p=pathlib.Path('$SRC'); d=json.loads(p.read_text())
d['radius']['tokens'].append({'name':'space-2','value':'8px','usage':'deliberate clash'})
p.write_text(json.dumps(d,indent=2)+'\n')"
run "duplicate token name rejected" 1 node tools/generate.mjs "$SRC" "$TMP/g"
restore

mutate "
import json,pathlib
p=pathlib.Path('$SRC'); d=json.loads(p.read_text())
d['type']['groups'][5]['family']='garamond'
p.write_text(json.dumps(d,indent=2)+'\n')"
run "unknown type family rejected" 1 node tools/generate.mjs "$SRC" "$TMP/g"
restore

echo 'export const Bad = () => <div style={{ color: "#c93d06" }} />;' > fixtures/app/_bad.tsx
run "raw hex in TSX rejected" 1 node tools/check-rawcolour.mjs fixtures
rm -f fixtures/app/_bad.tsx

echo 'export const Bad2 = () => <div className="text-[#ff6a2b]" />;' > fixtures/app/_bad2.tsx
run "Tailwind arbitrary colour rejected" 1 node tools/check-rawcolour.mjs fixtures
rm -f fixtures/app/_bad2.tsx

run "clean fixtures pass" 0 node tools/check-rawcolour.mjs fixtures

echo
echo "  $pass passed, $fail failed"
[ "$fail" -eq 0 ] || exit 1
