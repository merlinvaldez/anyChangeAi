#!/usr/bin/env bash
set -euo pipefail

# Bulk create EPIC B tickets with labels and a milestone using GitHub CLI (gh).
# Prereqs: gh installed and authenticated (gh auth login), remote set to GitHub.
# Usage: bash scripts/create_epic_b_tickets.sh

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
ensure_label "epic:B" "0e8a16" "EPIC B — Upload & Storage (S3)"
ensure_label "upload" "fbca04" "File upload functionality"
ensure_label "validation" "d93f0b" "Input validation and error handling"
ensure_label "s3" "1f6feb" "AWS S3 storage integration"
ensure_label "preview" "a33ea1" "File preview functionality"

# Ensure milestone
MILESTONE_TITLE="EPIC B — Upload & Storage (S3)"
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
read -r -d '' B1_1 <<'EOF'
User Story: As a user, I want to drag and drop files or click to select them so I can easily upload documents.
Acceptance Criteria:
- Drag-and-drop zone with visual feedback (hover states)
- File picker button as alternative option
- Selected file name and size display
- No network calls (UI shell only)
Tasks:
- [ ] Create upload component with drag-and-drop zone
- [ ] Add file picker input as fallback
- [ ] Display selected file information
- [ ] Style with Tailwind for good UX
Dependencies: Epic A completion
Estimate: 2h
EOF

read -r -d '' B2_1 <<'EOF'
User Story: As a user, I want clear error messages when I upload invalid files so I know what went wrong.
Acceptance Criteria:
- Only PDF, JPG, JPEG, PNG files accepted
- File size limit ≤10 MB enforced
- Page count limit for PDFs (e.g., ≤20 pages)
- Friendly error messages displayed
Tasks:
- [ ] Add file type validation with MIME checking
- [ ] Implement file size validation
- [ ] Add PDF page count validation (pdf-lib or similar)
- [ ] Create error UI component
- [ ] Unit tests for validation functions
Dependencies: B1-1
Estimate: 2.5h
EOF

read -r -d '' B3_1 <<'EOF'
User Story: As a developer, I want secure S3 storage so files are safely stored and accessible.
Acceptance Criteria:
- Private S3 bucket created with proper CORS
- IAM user with minimal permissions (PutObject, GetObject on specific bucket)
- Environment variables configured for AWS credentials
- Bucket accessible from local dev and production
Tasks:
- [ ] Create S3 bucket with private access
- [ ] Configure CORS policy for web uploads
- [ ] Create IAM user with restricted permissions
- [ ] Add AWS credentials to .env.example
- [ ] Test bucket access from console
Dependencies: Epic A completion (env management)
Estimate: 1.5h
EOF

read -r -d '' B4_1 <<'EOF'
User Story: As a user, I want secure direct uploads to S3 so files transfer quickly without going through our server.
Acceptance Criteria:
- POST /api/storage/presign returns signed URL with expiration
- Content-type and size constraints enforced in presigned URL
- Unique file naming to avoid conflicts
- Error handling for invalid requests
Tasks:
- [ ] Install AWS SDK for Node.js
- [ ] Create presign API endpoint
- [ ] Add content-type and size validation
- [ ] Generate unique file keys (UUID + timestamp)
- [ ] Add comprehensive error handling
Dependencies: B3-1
Estimate: 2h
EOF

read -r -d '' B5_1 <<'EOF'
User Story: As a user, I want to see upload progress so I know my file is being processed.
Acceptance Criteria:
- Upload progress bar shows percentage complete
- Direct upload to S3 using presigned URL
- Success/error states clearly indicated
- File key saved in app state for later use
Tasks:
- [ ] Integrate presign endpoint with upload UI
- [ ] Implement direct S3 upload with progress tracking
- [ ] Add upload state management (uploading/success/error)
- [ ] Store successful upload key in React state
- [ ] Handle upload errors gracefully
Dependencies: B4-1, B2-1
Estimate: 3h
EOF

read -r -d '' B6_1 <<'EOF'
User Story: As a user, I want to see a preview of my uploaded file so I can confirm it's the right document.
Acceptance Criteria:
- Images (JPG/PNG) show actual preview thumbnail
- PDFs show rendered first page thumbnail
- Fallback icon for unsupported preview types
- Preview loads within 2 seconds for typical files
Tasks:
- [ ] Add image preview for JPG/PNG files
- [ ] Implement PDF first-page rendering (pdf-lib or PDF.js)
- [ ] Create fallback UI for preview failures
- [ ] Optimize preview size and loading performance
- [ ] Add loading states for preview generation
Dependencies: B5-1
Estimate: 2.5h
EOF

create_issue "B1-1: Upload UI Shell - Drag & Drop + File Picker" "ticket,epic:B,upload" "$B1_1"
create_issue "B2-1: Client Validation - File Type, Size & Page Limits" "ticket,epic:B,validation" "$B2_1"
create_issue "B3-1: S3 Bucket & IAM - Secure Storage Setup" "ticket,epic:B,s3" "$B3_1"
create_issue "B4-1: Presign Endpoint - Secure Direct Upload URLs" "ticket,epic:B,s3" "$B4_1"
create_issue "B5-1: Client Direct Upload - Progress & Error Handling" "ticket,epic:B,upload" "$B5_1"
create_issue "B6-1: First-Page Preview - Images & PDF Thumbnails" "ticket,epic:B,preview" "$B6_1"

echo "All EPIC B tickets created. View them here: https://github.com/${REPO}/issues?q=is%3Aissue+milestone:%5C"${MILESTONE_TITLE}%5C""
