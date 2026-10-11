# BITFire brand assets

The finalised logo set, copied byte for byte from the BITFire design system (the Claude Design artifact, "BITFire Logo" asset group; locked direction 10d). These are brand files, not tokens: colour values for the interface still come from `packages/tokens`.

| File | What | Use |
| --- | --- | --- |
| `bitfire-mark-dark.svg` | five isochrones, 0.75 edge | dark surfaces |
| `bitfire-mark-light.svg` | the same mark, 0.5 edge | light surfaces |
| `bitfire-mark-mono-ink.svg` | single-colour outline | one-colour print, light grounds |
| `bitfire-mark-mono-white.svg` | single-colour outline | one-colour print, dark grounds |
| `bitfire-app-icon.svg` | 1024 px tile | 48 px and up |
| `bitfire-app-icon-small.svg` | two-ellipse cut | 32 px and below |
| `bitfire-lockup-dark@4x.png` | mark and wordmark, raster | dark surfaces |
| `bitfire-lockup-light@4x.png` | mark and wordmark, raster | light surfaces |

## Usage rules (from the design system)

- Mark colours, centre to front: `#5a1008`, `#881e0f`, `#c03e19`, `#e2783f`, `#f6d36b` (also the heat scale `heat-4` to `heat-0`).
- Wordmark: IBM Plex Sans. "BIT" at weight 200 on dark, 300 on light; "F/re" at 400 on dark, 500 on light. The "i" is a 64 degree slash at x-height in `#e2783f` on dark and `#c03e19` on light. At 20 px and under "BIT" goes to weight 400. Below 16 px, use the mark alone.
- In running text, always write "BITFire".
- Clear space: one innermost-ellipse height on every side.
- `brand-ember` and the mark belong on the frame (wordmark, masthead, active navigation), never inside a data region.

## Provenance

- Source: the design system artifact's "BITFire Logo" group, read on 2026-10-10. Each file here was checked against the SHA-256 the artifact's index records for it; all eight match.
- The SVGs carry an embedded C2PA content-credentials block (about 5.7 KB of each file) recording that Claude provided the file at a user's request. It is left in place: stripping it would change the files and lose that record. It holds no personal data that I found; I read the readable strings, not every byte.

## Not done

- The lockups are raster (PNG at 4x). The design system lists vector lockups, with the wordmark outlined from the font, as still to be generated.
- The two PNGs are binaries in git (166 KB together). STD-0013 (a candidate standard) discourages that; they are kept because they are the brand source files.
- Nothing in the repo consumes these files yet, including `consumers/tw-fixture`.
