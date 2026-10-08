# Document pipeline

    markdown + refs.bib  ->  pandoc --citeproc  ->  HTML + @bitfire/tokens  ->  WeasyPrint  ->  PDF

    npm install                      # pulls @bitfire/tokens
    pip install weasyprint --break-system-packages
    python3 build.py <fonts-dir-parent> out.pdf

WeasyPrint, not Chromium: Chromium's print-to-PDF silently ignores
`target-counter()`, so a contents page renders with no page numbers and
nothing errors.

Token values are NOT written in `style.css`. They are read from
`@bitfire/tokens` at build time, and the build is rejected if a token is used
but never defined, or if the package is missing.
