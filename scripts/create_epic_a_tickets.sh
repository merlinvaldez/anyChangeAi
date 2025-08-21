#!/usr/bin/env bash
set -euo pipefail

# Bulk create EPIC A tickets with labels and a milestone using GitHub CLI (gh).
# Prereqs: gh installed and authenticated (gh auth login), remote set to GitHub.
# Usage: bash scripts/create_epic_a_tickets.sh

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) not found. Install from https://cli.github.com/ and run 'gh auth login'."
  exit 1
fi

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)
if [[ -z "${REPO}" ]]; then
  echo "Not in a GitHub repo folder or not authenticated. Run: gh auth login && gh repo view"
  exit 1
fi

echo "Using repo: ${REPO}"

# Ensure labels
ensure_label() {
  local name="$1"; shift
  local color="$1"; shift
  local desc="$1"; shift
  if gh label list --limit 1000 | grep -E "^${name}[[:space:]]" >/dev/null 2>&1; then
    gh label edit "${name}" --color "${color}" --description "${desc}" >/dev/null || true
  else
    gh label create "${name}" --color "${color}" --description "${desc}" >/dev/null || true
  fi
}

ensure_label "ticket" "6e7781" "General engineering ticket"
ensure_label "epic:A" "1f6feb" "EPIC A — Project Setup & CI"
ensure_label "setup" "0e8a16" "Project scaffolding and configuration"
ensure_label "ci" "5319e7" "Continuous Integration"
ensure_label "lint" "fbca04" "Linting/Formatting"
ensure_label "env" "d93f0b" "Environment variables and config"
ensure_label "deploy" "a33ea1" "Deployment"

# Ensure milestone
MILESTONE_TITLE="EPIC A — Project Setup & CI"
MILESTONE_NUMBER=$(gh api -X GET repos/${REPO}/milestones --jq ".[] | select(.title==\"${MILESTONE_TITLE}\") | .number" | head -n1 || true)
if [[ -z "${MILESTONE_NUMBER}" ]]; then
  MILESTONE_NUMBER=$(gh api -X POST repos/${REPO}/milestones -f title="${MILESTONE_TITLE}" --jq .number)
  echo "Created milestone #${MILESTONE_NUMBER}"
else
  echo "Using existing milestone #${MILESTONE_NUMBER}"
fi

create_issue() {
  local title="$1"; shift
  local labels="$1"; shift
  local body="$1"; shift
  gh issue create \
    --title "${title}" \
    --label ${labels} \
    --milestone "${MILESTONE_TITLE}" \
    --body "${body}" >/dev/null
  echo "Created: ${title}"
}

# Define issues (title | labels | body)
A1_1="User Story: As a developer, I want a clean repo so I can collaborate and track changes.
Acceptance Criteria:
- Repo initialized with README, LICENSE (MIT), and .gitignore (Node/Next)
- First commit pushed
Tasks:
- [ ] git init, add README, LICENSE, .gitignore
- [ ] Initial commit and push to GitHub
Dependencies: None
Estimate: 0.5h"

read -r -d '' A1_2 <<'EOF'
User Story: As a developer, I want a Next.js app scaffold so I can build the UI.
Acceptance Criteria:
- Next.js App Router with TypeScript boots locally
- Sample home page renders
Tasks:
- [ ] Create Next.js project with App Router and TS
- [ ] Verify dev server runs locally
Dependencies: A1-1
Estimate: 1h
EOF

read -r -d '' A1_3 <<'EOF'
User Story: As a developer, I want Tailwind to style quickly with utility classes.
Acceptance Criteria:
- Tailwind configured and styles visible on home page
Tasks:
- [ ] Install and configure Tailwind content paths
- [ ] Add demo utility to home page
Dependencies: A1-2
Estimate: 0.75h
EOF

read -r -d '' A1_4 <<'EOF'
User Story: As a developer, I want a placeholder layout and health endpoint to verify deployments.
Acceptance Criteria:
- Shared layout with header/footer exists
- /api/health returns { ok: true }
Tasks:
- [ ] Create layout.tsx and header/footer
- [ ] Add Next route handler for /api/health
Dependencies: A1-2
Estimate: 0.75h
EOF

read -r -d '' A1_5 <<'EOF'
User Story: As a developer, I want editor config so the team is consistent.
Acceptance Criteria:
- .editorconfig and recommended extensions committed
Tasks:
- [ ] Add .editorconfig
- [ ] Add .vscode/extensions.json (ESLint, Prettier, Tailwind)
Dependencies: A1-1
Estimate: 0.25h
EOF

read -r -d '' A2_1 <<'EOF'
User Story: As a developer, I want linting to catch issues early.
Acceptance Criteria:
- ESLint runs and reports no errors on scaffold
Tasks:
- [ ] Install ESLint + @typescript-eslint + @next/eslint-plugin-next
- [ ] Add .eslintrc and run npm run lint
Dependencies: A1-2
Estimate: 0.75h
EOF

read -r -d '' A2_2 <<'EOF'
User Story: As a developer, I want auto-formatting for consistent code style.
Acceptance Criteria:
- Prettier formats files without conflicts with ESLint
Tasks:
- [ ] Install Prettier + eslint-config-prettier
- [ ] Add .prettierrc and .prettierignore
Dependencies: A2-1
Estimate: 0.5h
EOF

read -r -d '' A2_3 <<'EOF'
User Story: As a developer, I want simple commands for linting and formatting.
Acceptance Criteria:
- npm run lint, npm run format, npm run lint:fix work
Tasks:
- [ ] Add scripts to package.json
- [ ] Run and verify
Dependencies: A2-1, A2-2
Estimate: 0.25h
EOF

read -r -d '' A2_4 <<'EOF'
User Story: As a developer, I want pre-commit checks to keep main clean.
Acceptance Criteria:
- Pre-commit runs ESLint/Prettier on staged files
Tasks:
- [ ] Install husky and lint-staged
- [ ] Configure pre-commit hook
Dependencies: A2-3
Estimate: 0.75h
EOF

read -r -d '' A3_1 <<'EOF'
User Story: As a developer, I want type-checking to catch errors in CI.
Acceptance Criteria:
- npm run typecheck (tsc --noEmit) passes
Tasks:
- [ ] Add tsconfig and typecheck script
- [ ] Fix any type errors
Dependencies: A1-2
Estimate: 0.5h
EOF

read -r -d '' A3_2 <<'EOF'
User Story: As a developer, I want a test runner to validate utilities.
Acceptance Criteria:
- npm test passes with one trivial test
Tasks:
- [ ] Install Vitest/Jest and configure
- [ ] Add example test and coverage script
Dependencies: A1-2
Estimate: 1h
EOF

read -r -d '' A3_3 <<'EOF'
User Story: As a developer, I want CI to run on PRs to keep quality high.
Acceptance Criteria:
- GitHub Actions runs install, lint, typecheck, and tests with caching
Tasks:
- [ ] Add .github/workflows/ci.yml
- [ ] Add README badge and verify CI passes
Dependencies: A2-3, A3-1, A3-2
Estimate: 1h
EOF

read -r -d '' A4_1 <<'EOF'
User Story: As a developer, I want to know required environment variables.
Acceptance Criteria:
- .env.example lists vars with comments; README explains them
Tasks:
- [ ] Create .env.example and update README
- [ ] Ensure .env is gitignored
Dependencies: A1-1
Estimate: 0.5h
EOF

read -r -d '' A4_2 <<'EOF'
User Story: As a developer, I want clear failures when env vars are missing.
Acceptance Criteria:
- App throws friendly error on missing/invalid vars
Tasks:
- [ ] Add config module (zod + process.env)
- [ ] Wire at app startup
Dependencies: A4-1
Estimate: 0.75h
EOF

read -r -d '' A4_3 <<'EOF'
User Story: As a developer, I want to avoid leaking secrets to the client.
Acceptance Criteria:
- Public vars prefixed NEXT_PUBLIC_ and server-only vars protected
Tasks:
- [ ] Audit env usage and rename as needed
- [ ] Update .env.example
Dependencies: A4-2
Estimate: 0.5h
EOF

read -r -d '' A5_1 <<'EOF'
User Story: As a developer, I want a separate API service skeleton.
Acceptance Criteria:
- Minimal Express/Nest app with GET /api/health -> { ok: true } runs locally
Tasks:
- [ ] Create server folder and start script
- [ ] Add health route and README
Dependencies: A1-1
Estimate: 1h
EOF

read -r -d '' A5_2 <<'EOF'
User Story: As a user, I want a public health endpoint to verify uptime.
Acceptance Criteria:
- Public URL responds 200 OK with { ok: true }
Tasks:
- [ ] Deploy API to Render/Fly, set PORT, test URL
Dependencies: A5-1
Estimate: 1h
EOF

read -r -d '' A5_3 <<'EOF'
User Story: As a user, I want a public preview URL of the frontend.
Acceptance Criteria:
- Vercel project connected; main branch auto-deploys; homepage loads
Tasks:
- [ ] Connect repo to Vercel and deploy
Dependencies: A1-2, A1-3
Estimate: 0.75h
EOF

read -r -d '' A5_4 <<'EOF'
User Story: As a user, I want the frontend to verify backend connectivity.
Acceptance Criteria:
- Frontend shows API health OK/Fail based on API_BASE_URL/api/health
Tasks:
- [ ] Add NEXT_PUBLIC_API_BASE_URL
- [ ] Fetch and display health result with error handling
Dependencies: A5-2, A5-3, A4-3
Estimate: 0.75h
EOF

read -r -d '' A5_5 <<'EOF'
User Story: As a developer, I want a checklist to debug deploy issues quickly.
Acceptance Criteria:
- README section with smoke steps; both URLs listed
Tasks:
- [ ] Add verification steps and record URLs
Dependencies: A5-3, A5-4
Estimate: 0.5h
EOF

create_issue "A1-1: Initialize repo and baseline docs" "ticket,epic:A,setup" "$A1_1"
create_issue "A1-2: Create Next.js app with TypeScript" "ticket,epic:A,setup" "$A1_2"
create_issue "A1-3: Add Tailwind CSS" "ticket,epic:A,setup" "$A1_3"
create_issue "A1-4: Basic app shell and health route" "ticket,epic:A,setup" "$A1_4"
create_issue "A1-5: VS Code workspace hygiene" "ticket,epic:A,setup" "$A1_5"

create_issue "A2-1: ESLint config for Next + TS" "ticket,epic:A,lint" "$A2_1"
create_issue "A2-2: Prettier config and integration" "ticket,epic:A,lint" "$A2_2"
create_issue "A2-3: NPM scripts for lint/format/fix" "ticket,epic:A,lint" "$A2_3"
create_issue "A2-4: Pre-commit hook (Husky + lint-staged)" "ticket,epic:A,lint" "$A2_4"

create_issue "A3-1: Type-check script (tsc —noEmit)" "ticket,epic:A,ci" "$A3_1"
create_issue "A3-2: Unit test harness with first test" "ticket,epic:A,ci" "$A3_2"
create_issue "A3-3: GitHub Actions workflow (CI)" "ticket,epic:A,ci" "$A3_3"

create_issue "A4-1: .env.example and documentation" "ticket,epic:A,env" "$A4_1"
create_issue "A4-2: Safe env loader with validation" "ticket,epic:A,env" "$A4_2"
create_issue "A4-3: Split client/server env naming" "ticket,epic:A,env" "$A4_3"

create_issue "A5-1: Backend API skeleton with /api/health" "ticket,epic:A,deploy" "$A5_1"
create_issue "A5-2: Deploy API to Render/Fly" "ticket,epic:A,deploy" "$A5_2"
create_issue "A5-3: Deploy Next.js to Vercel" "ticket,epic:A,deploy" "$A5_3"
create_issue "A5-4: Wire frontend to backend health" "ticket,epic:A,deploy" "$A5_4"
create_issue "A5-5: Deployment smoke checks and docs" "ticket,epic:A,deploy" "$A5_5"

echo "All EPIC A tickets created. View them here: https://github.com/${REPO}/issues?q=is%3Aissue+milestone:%5C"${MILESTONE_TITLE}%5C""
