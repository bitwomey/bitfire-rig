<#
    Seeds the opening backlog. Run once, after the repo exists:

        gh auth status
        .\.github\seed-issues.ps1 -Repo bitwomey/bitfire-rig

    Requires the GitHub CLI (gh) on PATH and an authenticated session.
#>
param(
    [Parameter(Mandatory = $true)][string]$Repo
)

# 'Continue', not 'Stop': gh writes to stderr in normal operation, and under
# 'Stop' PowerShell turns that into a thrown error. Exit codes are checked.
$ErrorActionPreference = 'Continue'

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "The GitHub CLI (gh) is not on PATH. Install from https://cli.github.com" -ForegroundColor Red
    exit 1
}

Write-Host "Seeding $Repo" -ForegroundColor Cyan
$script:failed = 0

$labels = @(
    @{ name = 'blocked-on-ben';     colour = 'B60205'; desc = 'needs a decision or an input only Ben can supply' },
    @{ name = 'verification-debt';  colour = '0E7C86'; desc = 'a claim that is not yet backed by evidence' },
    @{ name = 'foundation';         colour = '1D76DB'; desc = 'tokens, generation, packaging, CI' },
    @{ name = 'consumer';           colour = '5319E7'; desc = 'an application, document or deck that uses the system' },
    @{ name = 'research';           colour = 'FBCA04'; desc = 'a trial whose output is a decision, not a feature' }
)
foreach ($l in $labels) {
    gh label create $l.name --repo $Repo --color $l.colour --description $l.desc --force 1>$null 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "  label  $($l.name)" }
    else { Write-Host "  label  $($l.name)  (not created)" -ForegroundColor DarkYellow }
}

function New-RigIssue {
    param([string]$Title, [string]$Labels, [string]$Body)
    gh issue create --repo $Repo --title $Title --label $Labels --body $Body 1>$null 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "  issue  $Title" }
    else { Write-Host "  issue  $Title  (FAILED)" -ForegroundColor Red; $script:failed++ }
}

# Bodies use single-quoted here-strings so backticks and $ stay literal.

New-RigIssue 'Settle the Tailwind 4 token mapping against a running fixture' 'foundation,verification-debt' @'
**What**
The shadcn/Tailwind variable mapping in `20-product-ui.md` was written against variable names. It has never been run against Tailwind 4.3.3, which changed its configuration model.

**Why it matters**
It sits underneath every UI consumer. Finding a problem here during the first scaffold means redoing the packaging work above it.

**Done when**
A fixture app renders BITFire tokens through Tailwind 4 and the emitted CSS is inspected, not assumed.
'@

New-RigIssue 'Run the UI primitive trial' 'research' @'
**What**
Build the same small surface twice and compare: a labelled form with validation, a searchable selector, a modal, and a sortable table, in both themes.

Candidates, versions read from the npm registry on 8 Oct 2026:
- shadcn/ui over a primitive foundation (CLI 4.21.4, MIT)
- Base UI 1.0.0-rc.0 (MIT) - a release candidate, which is a stated risk for a foundation layer
- React Aria Components 1.22.0 (Apache-2.0)
- Mantine 9.7.1 (MIT)

**Why it matters**
v1 of the plan treated shadcn as settled. It is a reasonable starting point, not a conclusion.

**Done when**
Implementation effort, styling exceptions, dependency count and interaction defects are recorded for two of them, and a choice is written down with its reasoning. Exercise keyboard operation, focus restoration, disabled/error/loading states and narrow layouts.
'@

New-RigIssue 'Publish the packages once the repo is in the BITFire org' 'foundation' @'
**What**
Consumers currently resolve `@bitfire/tokens` and `@bitfire/ui` through npm workspaces. Nothing is published.

**Why it matters**
GitHub Packages scopes a package to the account hosting it, so `@bitfire` wants the BITFire organisation. Publishing from a personal repo would mean the wrong scope now or a rename later, and a rename breaks every consumer.

**Done when**
The repo has been transferred, `tools/release.mjs` publishes both packages to GitHub Packages, and a clean machine installs them.
'@

New-RigIssue 'Prove the rollback path on the real registry' 'foundation,verification-debt' @'
**What**
Rollback has been demonstrated on a local Verdaccio instance only.

**Why it matters**
Rollback is the safety net under the whole distribution model. A safety net proven only in a sandbox is a claim, not a net.

**Done when**
A consumer is upgraded and then rolled back on the production registry, and the old value is confirmed to return.
'@

New-RigIssue 'Complete the components pass' 'foundation' @'
**What**
Deferred during the foundations work: form controls, navigation, tabs, modal, pagination, empty and loading states.

**Why it matters**
Any real application needs these on day one. The package ships incomplete without them.

**Done when**
Each component exists in `@bitfire/ui` with a Storybook story covering its states in both themes, and the accessibility gate passes.
'@

New-RigIssue 'Stand up the Storybook workbench' 'foundation' @'
**What**
A permanent place that renders every component in every state, in both themes, with `@storybook/addon-a11y` configured so violations fail rather than warn.

**Why it matters**
Nobody reviews a design system by reading prose. It is also how Ben reviews what an agent built, and how visual regression gets its baseline.

**Done when**
The workbench runs, CI fails on an accessibility violation, and that failure has been demonstrated deliberately.
'@

New-RigIssue 'Establish the visual regression baseline' 'foundation,verification-debt' @'
**What**
Playwright screenshots of every story, with a pinned renderer, fixed viewport, deterministic data, loaded fonts and animation disabled.

**Why it matters**
It catches regressions. It does not prove the baseline was ever right, and auto-accepting every changed screenshot disables the gate while leaving it green.

**Done when**
Baselines exist, a deliberate visual change is caught, and the policy for accepting a new baseline is written down.
'@

New-RigIssue 'Define the Cesium adapter and forbid an ion fallback' 'consumer' @'
**What**
CesiumJS (`cesium` 1.146.0, Apache-2.0) with Resium (1.27.0, MIT). Map-independent rules for symbology, legends, selection, provenance and stale-data states, implemented through one adapter.

**Why it matters**
CesiumJS reaches for Cesium ion by default for terrain, imagery and geocoding, and ion free is personal/non-commercial only, with commercial plans from USD 149/month. An ion dependency could be adopted by accident rather than by decision.

**Done when**
The adapter configures its own providers explicitly, and a startup assertion fails loudly if an ion token is ever required. That assertion is proven to fire.
'@

New-RigIssue 'Choose map asset sources' 'blocked-on-ben,consumer' @'
**What**
Terrain, imagery and geocoding for CesiumJS. Australian candidates: Geoscience Australia elevation, state imagery services, OpenStreetMap.

**Why it matters**
The renderer licence settles nothing about assets. Cost, attribution obligations and any agency-mandated basemap are separate questions, and unverified against any specific project.

**Done when**
Sources are chosen, their terms recorded, and a map renders from them with no ion token present.
'@

New-RigIssue 'Build the hatching channel for hazard fills' 'consumer' @'
**What**
`40-fire-pack.md` specifies hatching as the non-colour channel for hazard fills. It was never implemented.

**Why it matters**
On a map, colour alone cannot carry severity for a colour-blind user across a variegated basemap. This stops being optional there.

**Done when**
Hatching renders in both themes, over a basemap, and is legible under deuteranopia simulation.
'@

New-RigIssue 'Re-examine the per-type colour-vision palettes' 'verification-debt' @'
**What**
Generated protan and tritan palettes failed the official validator at 4.8 and 7.4. Only deutan verified better than baseline, at 11.2 against 9.4.

**Why it matters**
Protan and tritan modes stay unavailable, and saying otherwise would be worse than not offering them. The deutan result is one measurement, not a category proof.

**Done when**
The deutan method and scope are inspected and recorded, or the mode is withdrawn. Krzywinski published per-type palettes remain untested - that source was blocked by egress policy.
'@

New-RigIssue 'Decide the default skin' 'blocked-on-ben' @'
**What**
Ember is used provisionally. Variants A, B, D, E and F were explored and none was locked in.

**Why it matters**
The scaffolds need a default. Cheap to change later, so this should not block anything.

**Done when**
One is chosen, or Ember is confirmed.
'@

Write-Host ''
if ($script:failed -gt 0) {
    Write-Host "$script:failed issue(s) failed to create." -ForegroundColor Red
    exit 1
}
Write-Host 'Seeded. Suggested next: pick one labelled foundation.' -ForegroundColor Green
