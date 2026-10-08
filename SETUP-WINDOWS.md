# Getting this onto GitHub, from PowerShell

Every command below is PowerShell. Run them one block at a time and read the
output before moving on.

## 0. Check what you have

    git --version
    gh --version
    node --version
    npm --version

`node` must be 20 or higher. If `gh` is missing, install the GitHub CLI from
<https://cli.github.com>. Then:

    gh auth status

If that reports you are not logged in:

    gh auth login

Choose GitHub.com, HTTPS, and authenticate in the browser.

## 1. Unpack

    Expand-Archive -Path "$HOME\Downloads\bitfire-rig.zip" -DestinationPath C:\Projects -Force
    cd C:\Projects\bitfire-rig

That lands the repo at `C:\Projects\bitfire-rig`. If the browser saved the
zip somewhere other than Downloads, change the `-Path`.

Check the history came across — you should see 8 commits:

    git log --oneline

## 2. Prove it works before you push

    npm install
    npm run check

That runs all three gates. The last line should read `8 passed, 0 failed`.
Then confirm the app consumer resolves the packages:

    node .\consumers\app\src\app.mjs

If `npm run check` fails here, stop and fix it before pushing. CI runs the
same three commands, so a local failure is a guaranteed red PR.

## 3. Create the repo and push

    gh repo create bitwomey/bitfire-rig --public --source=. --remote=origin --push

One command: it creates the repo, adds the remote, and pushes `main`.

    gh repo view --web

## 4. Watch CI run

    gh run list
    gh run watch

The job is called `gates`. First run takes a couple of minutes while the
runner warms up. It is free — public repositories get unmetered
GitHub-hosted runners.

## 5. Load the backlog

    .\.github\seed-issues.ps1 -Repo bitwomey/bitfire-rig

Creates 5 labels and 13 issues. If PowerShell refuses to run the script:

    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

That lasts for the current window only. Then:

    gh issue list

## 6. Protect main

    gh api --method PUT repos/bitwomey/bitfire-rig/branches/main/protection `
      --input .github/branch-protection.json

Or in the browser: Settings, Branches, Add rule for `main`, tick **Require a
pull request before merging** and **Require status checks to pass**, then
search for and select `gates`.

This is the step that turns the gates from advisory into binding.

## 7. Prove the whole loop

    git switch -c chore/first-pr
    "`n" | Add-Content README.md
    git commit -am "Check CI runs on a pull request"
    git push -u origin chore/first-pr
    gh pr create --fill
    gh pr checks --watch

You should see `gates` run and pass, and the merge button blocked until it
does. Merge it, then:

    git switch main
    git pull

## Later: moving it to the BITFire organisation

Settings, General, scroll to Danger Zone, Transfer ownership. Or:

    gh api --method POST repos/bitwomey/bitfire-rig/transfer -f new_owner=BITFire

Issues, pull requests, stars and commit history all come across, and the old
URL redirects. Afterwards, update the remote:

    git remote set-url origin https://github.com/BITFire/bitfire-rig.git

Then the `@bitfire` package scope finally matches the owner, and publishing
through `tools/release.mjs` becomes possible.

## Things that will trip you up

**`npm run check` fails on `bash`.** `tools/gate-tests.sh` is a bash script.
Git for Windows ships Git Bash, which npm uses for script `bash` invocations,
so this normally just works. If it does not, run the two Node checks on their
own and let CI run the gate suite:

    npm run check:stale
    npm run check:colour

**Backtick line continuation.** In PowerShell the continuation character is a
backtick at end of line, not a backslash. Any multi-line command copied from
a Linux guide needs that changed.

**`&&` between commands** works in PowerShell 7 but not Windows PowerShell
5.1. Run `$PSVersionTable.PSVersion` to check. On 5.1, run commands on
separate lines.
