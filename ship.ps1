<#
    Ship the current branch:

        C:\Projects\bitfire-rig\ship.ps1 -Issue 3

    Pushes the branch, opens a DRAFT pull request, waits for CI, and only
    once 'gates' is green marks it ready for review and assigns you as
    reviewer. If CI fails it leaves the PR as a draft and says so.

    Claude does the work and commits the branch; this does the GitHub half,
    because the sandbox Claude reaches has no credentials and should not
    have yours.

    -Issue   the issue number this closes (optional)
    -NoWait  skip the CI wait; leave it as a draft
#>
param(
    [int]$Issue = 0,
    [switch]$NoWait,
    [string]$Repo = 'bitwomey/bitfire-rig',
    [string]$Reviewer = 'bitwomey'
)

$ErrorActionPreference = 'Continue'
Set-Location -LiteralPath $PSScriptRoot

function Step($n) { Write-Host ''; Write-Host "== $n" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "   $m" -ForegroundColor Green }
function Note($m) { Write-Host "   $m" -ForegroundColor DarkGray }
function Warn($m) { Write-Host "   $m" -ForegroundColor Yellow }
function Die($m)  { Write-Host ''; Write-Host "   STOPPED: $m" -ForegroundColor Red; exit 1 }

Step 'Checking the branch'
$branch = (git rev-parse --abbrev-ref HEAD)
if ($LASTEXITCODE -ne 0) { Die 'not a git repository' }
if ($branch -eq 'main') { Die 'you are on main. Claude works on a branch; switch to it first.' }
$dirty = (git status --porcelain)
if ($dirty) { Die "the working tree has uncommitted changes:`n$dirty" }
Ok "on $branch, tree clean"

Step 'Running the gates before anything leaves this machine'
node tools/check-stale.mjs packages/tokens/src/tokens.json packages/tokens/dist
if ($LASTEXITCODE -ne 0) { Die 'the stale check failed (see above)' }
node tools/check-rawcolour.mjs packages fixtures consumers
if ($LASTEXITCODE -ne 0) { Die 'the raw-colour check failed (see above)' }
Ok 'gates pass locally'

Step 'Pushing'
git push -u origin $branch
if ($LASTEXITCODE -ne 0) { Die 'push failed (see above)' }
Ok "pushed $branch"

Step 'Opening a draft pull request'
$existing = gh pr list --repo $Repo --head $branch --json number --jq '.[0].number' 2>$null
if ($LASTEXITCODE -eq 0 -and $existing) {
    $pr = $existing
    Note "PR #$pr already open for this branch"
} else {
    $body = 'See the commit messages for what changed and why.'
    if ($Issue -gt 0) { $body = "Closes #$Issue`n`n" + $body }
    gh pr create --repo $Repo --draft --fill --body $body
    if ($LASTEXITCODE -ne 0) { Die 'could not open the PR (see above)' }
    $pr = gh pr list --repo $Repo --head $branch --json number --jq '.[0].number' 2>$null
}
Ok "draft PR #$pr"

if ($NoWait) { Step 'Done'; Note "left as a draft: https://github.com/$Repo/pull/$pr"; exit 0 }

Step 'Waiting for CI'
Note 'the gates job runs on a GitHub-hosted runner; usually under two minutes'
gh pr checks $pr --repo $Repo --watch --fail-fast
$ciOk = ($LASTEXITCODE -eq 0)

if (-not $ciOk) {
    Step 'CI failed'
    Warn "PR #$pr stays a draft and no reviewer was assigned."
    Note "https://github.com/$Repo/pull/$pr"
    Note 'Paste the failing step to Claude and it can fix the branch.'
    exit 1
}
Ok 'gates green'

Step 'Marking ready and assigning the reviewer'
gh pr ready $pr --repo $Repo
if ($LASTEXITCODE -ne 0) { Warn 'could not mark it ready; do it in the browser' }
gh pr edit $pr --repo $Repo --add-reviewer $Reviewer
if ($LASTEXITCODE -ne 0) {
    Note 'GitHub refuses self-review on your own repo; assigning instead'
    gh pr edit $pr --repo $Repo --add-assignee $Reviewer 1>$null 2>$null
}
Ok "PR #$pr is ready for review"

Step 'Done'
Write-Host "   https://github.com/$Repo/pull/$pr" -ForegroundColor Cyan
