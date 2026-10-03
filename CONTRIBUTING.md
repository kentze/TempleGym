# Contributing

## Workflow

Every change goes through a pull request — no direct commits to `main`. Branch protection enforces this for everyone, including repo admins.

1. Branch off `main` (or off `staging` if continuing other staging work).
2. Open a PR targeting `staging`. Get it tested/verified there.
3. Once verified, open a second PR from `staging` → `main` to promote to production.

## Branch & PR naming

Format: `<env>-<type>/<short-slug>` for branch names, `<env>-<type>: <description>` for PR titles.

**env**
- `staging` — regular day-to-day work, PR targets the `staging` branch
- `production` — promoting already-verified staging work to `main`

**type**
- `feature` — new functionality
- `fix` — bug fix
- `chore` — maintenance, dependency bumps, config, cleanup
- `docs` — documentation only

No ticket numbers — we're not using a ticketing system, so the description is the reference.

### Examples

- Branch: `staging-fix/otp-email-bug`
  PR title: `staging-fix: fix OTP email not sending on new accounts`
- Branch: `staging-feature/workout-history-filters`
  PR title: `staging-feature: add filters to workout history screen`
- PR title: `production-release: promote staging to production`
