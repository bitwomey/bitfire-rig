<#
    One command does the lot:

        C:\Projects\bitfire-rig\go-live.ps1

    Creates the public repo, pushes, seeds the backlog, protects main.
    Safe to re-run: each step checks whether it has already been done.
#>
param([string]$Repo = 'bitwomey/bitfire-rig')

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot      # always runs from the repo, whatever your cwd

function Step($n) { Write-Host ''; Write-Host "== $n" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "   $m" -ForegroundColor Green }
function Note($m) { Write-Host "   $m" -ForegroundColor DarkGray }

Step 'Checking tooling'
foreach ($c in 'git','gh','node','npm') {
    if (-not (Get-Command $c -ErrorAction SilentlyContinue)) { throw "$c is not on PATH." }
}
$gitOk = (git rev-parse --is-inside-work-tree 2>$null)
if ($gitOk -ne 'true') { throw "$PSScriptRoot is not a git repository." }
gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { throw "gh is not authenticated. Run: gh auth login" }
Ok "git, gh, node, npm present; gh authenticated"

Step 'Running the gates locally'
node tools/check-stale.mjs packages/tokens/src/tokens.json packages/tokens/dist
if ($LASTEXITCODE -ne 0) { throw 'stale check failed' }
node tools/check-rawcolour.mjs packages fixtures consumers
if ($LASTEXITCODE -ne 0) { throw 'raw-colour check failed' }
Ok 'gates pass'

Step 'Creating the repo and pushing'
$exists = $false
gh repo view $Repo 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) { $exists = $true }
if ($exists) {
    Note "$Repo already exists; pushing to it"
    if (-not (git remote 2>$null | Select-String -Quiet '^origin$')) {
        git remote add origin "https://github.com/$Repo.git"
    }
    git push -u origin main
} else {
    gh repo create $Repo --public --source=. --remote=origin --push
}
if ($LASTEXITCODE -ne 0) { throw 'repo create/push failed' }
Ok "pushed to $Repo"

Step 'Seeding the backlog'
$existingIssues = (gh issue list --repo $Repo --limit 1 --json number 2>$null)
if ($existingIssues -and $existingIssues -ne '[]') {
    Note 'issues already present; skipping the seeder'
} else {
    & "$PSScriptRoot\.github\seed-issues.ps1" -Repo $Repo
}

Step 'Protecting main'
gh api --method PUT "repos/$Repo/branches/main/protection" --input .github/branch-protection.json | Out-Null
if ($LASTEXITCODE -eq 0) { Ok "the 'gates' check is now required on main" }
else { Note "branch protection failed - set it in Settings > Branches, require the check named 'gates'" }

Step 'Done'
Write-Host "   https://github.com/$Repo" -ForegroundColor Cyan
Note 'Watch the first CI run with:  gh run watch'
