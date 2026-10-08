<#
    One command does the lot:

        C:\Projects\bitfire-rig\go-live.ps1

    Creates the public repo, pushes, seeds the backlog, protects main.
    Safe to re-run: every step checks whether it is already done.

    Deliberately plain. $ErrorActionPreference stays 'Continue' because
    native commands like gh write to stderr in normal operation -- gh repo
    view on a repo that does not exist yet is the expected case, not a
    failure -- and under 'Stop' PowerShell turns that into a thrown error.
    Exit codes are checked explicitly instead.
#>
param([string]$Repo = 'bitwomey/bitfire-rig')

$ErrorActionPreference = 'Continue'
Set-Location -LiteralPath $PSScriptRoot

function Step($n) { Write-Host ''; Write-Host "== $n" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "   $m" -ForegroundColor Green }
function Note($m) { Write-Host "   $m" -ForegroundColor DarkGray }
function Die($m)  { Write-Host ''; Write-Host "   STOPPED: $m" -ForegroundColor Red; exit 1 }

Step 'Checking tooling'
foreach ($c in 'git','gh','node','npm') {
    if (-not (Get-Command $c -ErrorAction SilentlyContinue)) { Die "$c is not on PATH." }
}
git rev-parse --is-inside-work-tree 1>$null 2>$null
if ($LASTEXITCODE -ne 0) { Die "$PSScriptRoot is not a git repository." }
gh auth status 1>$null 2>$null
if ($LASTEXITCODE -ne 0) { Die 'gh is not authenticated. Run: gh auth login' }
Ok 'git, gh, node, npm present; gh authenticated'

Step 'Running the gates locally'
node tools/check-stale.mjs packages/tokens/src/tokens.json packages/tokens/dist
if ($LASTEXITCODE -ne 0) { Die 'the stale check failed (see above)' }
node tools/check-rawcolour.mjs packages fixtures consumers
if ($LASTEXITCODE -ne 0) { Die 'the raw-colour check failed (see above)' }
Ok 'gates pass'

Step 'Creating the repo and pushing'
gh repo view $Repo 1>$null 2>$null
$repoExists = ($LASTEXITCODE -eq 0)
if ($repoExists) {
    Note "$Repo already exists"
    git remote get-url origin 1>$null 2>$null
    if ($LASTEXITCODE -ne 0) {
        git remote add origin "https://github.com/$Repo.git"
        Note 'added origin'
    }
    git push -u origin main
    if ($LASTEXITCODE -ne 0) { Die 'push failed (see above)' }
} else {
    Note "$Repo does not exist yet; creating it"
    gh repo create $Repo --public --source=. --remote=origin --push
    if ($LASTEXITCODE -ne 0) { Die 'repo create failed (see above)' }
}
Ok "pushed to $Repo"

Step 'Seeding the backlog'
$issueJson = gh issue list --repo $Repo --limit 1 --json number 2>$null
if ($LASTEXITCODE -eq 0 -and $issueJson -and $issueJson.Trim() -ne '[]') {
    Note 'issues already present; skipping the seeder'
} else {
    & (Join-Path $PSScriptRoot '.github\seed-issues.ps1') -Repo $Repo
    if ($LASTEXITCODE -ne 0) { Note 'the seeder reported a problem; issues may be incomplete' }
}

Step 'Protecting main'
gh api --method PUT "repos/$Repo/branches/main/protection" --input .github/branch-protection.json 1>$null 2>$null
if ($LASTEXITCODE -eq 0) {
    Ok "the 'gates' check is now required on main"
} else {
    Note "could not set branch protection automatically."
    Note "Settings > Branches > Add rule for main, require the check named 'gates'."
}

Step 'Done'
Write-Host "   https://github.com/$Repo" -ForegroundColor Cyan
Note 'Watch the first CI run with:  gh run watch'
