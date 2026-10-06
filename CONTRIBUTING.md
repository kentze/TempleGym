# Contributing

## Workflow

Every change goes through a pull request. No direct commits to `main`. Branch protection enforces this for everyone, including repo admins.

1. Branch off `staging`.
2. Open a PR targeting `staging`. Get it tested/verified there.
3. Once verified, Ken promotes it to production (see "Staging and production branches" below).

## Branch & PR naming

Format: `<env>-<type>/<short-slug>` for branch names, `<env>-<type>: <description>` for PR titles.

**env**
- `staging`: regular day-to-day work, PR targets the `staging` branch
- `production`: promoting already-verified staging work to `main`

**type**
- `feature`: new functionality
- `fix`: bug fix
- `chore`: maintenance, dependency bumps, config, cleanup
- `docs`: documentation only

No ticket numbers. We're not using a ticketing system, so the description is the reference.

### Examples

- Branch: `staging-fix/otp-email-bug`
  PR title: `staging-fix: fix OTP email not sending on new accounts`
- Branch: `staging-feature/workout-history-filters`
  PR title: `staging-feature: add filters to workout history screen`
- PR title: `production-release: promote staging to production`

## Staging and production branches

There are two long-lived branches. Each one auto-deploys to its own Railway environment with its own database.

| Branch | Railway environment | What it's for |
|---|---|---|
| `staging` | staging | Where all new work lands first. Safe place to test. |
| `main` | production | What real users are running. Only verified work goes here. |

### Day-to-day work (anyone)

1. Branch off `staging`.
2. Open a PR into `staging`. CI has to pass before it can merge.
3. Once it merges, it deploys to the staging server. Test it there.

### Promoting to production (Ken only)

Only Ken can merge into `main`. Everyone else can still open a PR into `main`, but GitHub will block the merge.

There are two ways a promotion happens:

* **Everything on staging is ready:** open a PR from `staging` into `main`. Title: `production-release: promote staging to production`.
* **Only some of it is ready:** branch off `main`, cherry-pick just the commits that are ready, and open a PR from that branch into `main`.

```bash
git checkout main && git pull
git checkout -b production-fix/otp-email-bug
git cherry-pick <commit-sha>
git push -u origin production-fix/otp-email-bug
```

If you think something on staging is ready for production, let Ken know rather than opening the promotion yourself.
