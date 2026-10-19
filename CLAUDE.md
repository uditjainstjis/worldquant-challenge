@.claude/STATE.md

## Hard rule: never `git add` .claude/LEDGER.md while the GitHub repo is PUBLIC
The ledger-capture hook appends every prompt from ANY Claude session whose cwd is ~/worldquant, including Udit's non-WQ personal chat (income, purchases). Commits through 3525da8 already pushed some (shopping list, monitor chat). Check `gh repo view --json visibility` first; stage files by name, never `git add -A`.
