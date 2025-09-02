# 📌 Capstone Project Plan: Document OCR + Editor Web App

> Working canvas for the capstone. Important context: This project is being built as a capstone project for a Fullstack Academy Full Stack Web Development Bootcamp. The developer will be learning each technology and concept step by step while building. The plan emphasizes incremental learning, documentation, and clarity.

---

## 🎯 Goal

A web app where users can upload a document (PDF, image, or scan), convert it to editable text using OCR, clean it up in a rich text editor, and export it.

**Success Criteria (MVP):**

- Upload a multi‑page PDF or JPG/PNG up to 10 MB
- OCR completes within 30 seconds for a 3‑page document
- User can edit extracted text and export `.txt` and `.docx`
- 90%+ character accuracy on clean English print (benchmarked on 3 sample docs)
- Developer demonstrates full‑stack learning: frontend, backend, API integration, and deployment

---

## 🔑 Core Features (MVP)

1. **Guest Flow (no authentication)**
   - Landing → upload → OCR → edit → export
   - Anonymous session stored in localStorage for continuity
   - Simple to demo during bootcamp presentation
2. **File Upload**
   - Drag‑and‑drop and file picker options
   - Validate types: PDF, JPG, JPEG, PNG; enforce size and page count limits
   - Client‑side preview (first page thumbnail)
3. **OCR Processing**
   - Provider abstraction with adapters: `mistral-ocr` | `tesseract`
   - Progress states (queued → processing → done / failed)
   - Extract paragraphs and simple blocks; capture per‑page text with confidence levels
4. **Text Editor**
   - Rich text editor (TipTap or Quill): bold, italic, underline, lists, headings
   - Inline spellcheck and find/replace
   - Quick actions to fix common OCR issues (e.g., lowercase “l” ↔ uppercase “I”)
5. **Download/Export**
   - Export to `.txt` and `.docx` (preserve basic formatting)
   - Optional PDF export (text‑only)

---

## 🌟 Stretch Features

- **Layout preservation** (columns, headers, footers, tables)
- **Image retention** (inline images with alt text)
- **Multi‑language OCR** (English, Spanish, French)
- **Cloud sync** (Google Drive, Dropbox, OneDrive)
- **Collaboration** (real‑time with CRDT/Yjs, presence, and comments)
- **Version history** (named snapshots)
- **AI Assist** (grammar fixes, summarization, translation)

---

## 👤 User Stories & Acceptance Criteria → Tickets

**MVP Feature Tickets (with User Story & AC)**

1. **Upload PDF to Extract Text**
   - _User Story:_ As a user, I want to upload a PDF so I can extract its text.
   - _Acceptance Criteria:_ Given a valid PDF/JPG/PNG ≤10 MB, when I upload, then I see a progress state and extracted text per page within 30 seconds.
   - _Build:_ Upload component (drag‑and‑drop + picker), validation, API to start OCR job.
2. **Display OCR Progress**
   - _User Story:_ As a user, I want to see a loading indicator so I know OCR is processing.
   - _Acceptance Criteria:_ Progress states (queued/processing/done/failed); retry and error messages.
   - _Build:_ Frontend status UI that polls job status.
3. **Edit Extracted OCR Text**
   - _User Story:_ As a user, I want to edit OCR text in a rich editor so I can fix errors.
   - _Acceptance Criteria:_ Editor supports bold, italic, underline, lists, headings; undo/redo; find/replace.
   - _Build:_ TipTap/Quill editor with per‑page sections.
4. **Download Edited Document**
   - _User Story:_ As a user, I want to download my edited document in `.docx` or `.txt` format.
   - _Acceptance Criteria:_ Exports `.txt` and `.docx` with original filename + `edited`.
   - _Build:_ Backend export endpoints; client download triggers.
5. **Guest Mode Without Login**
   - _User Story:_ As a user, I want to work without logging in so I can try the app quickly.
   - _Acceptance Criteria:_ Entire flow works anonymously; session persists until tab close.
   - _Build:_ Anonymous session using localStorage.

**Stretch Feature Tickets**

1. **Sign In and Save Documents**
   - _User Story:_ As a user, I want to log in so I can save my work and come back later.
   - _Acceptance Criteria:_ Authenticated users see a document list and can rename/delete items.
   - _Build:_ Clerk auth + Supabase persistence.
2. **Preserve Layout**
   - _User Story:_ As a user, I want the document layout preserved so it looks like the original.
   - _Acceptance Criteria:_ Headings, paragraphs, and simple tables retained in `.docx` and PDF exports.
   - _Build:_ Capture and map structure to exports.
3. **Spanish OCR Support**
   - _User Story:_ As a user, I want support for Spanish so I can edit documents in my language.
   - _Acceptance Criteria:_ Language parameter; UI language toggle; diacritics preserved.
   - _Build:_ Extend OCR calls and UI.
4. **Export Back to PDF**
   - _User Story:_ As a user, I want to export back to PDF with formatting.
   - _Acceptance Criteria:_ Styled PDF reflects editor content.
   - _Build:_ PDF export endpoint.
5. **Share Document for Collaboration**

- _User Story:_ As a user, I want to share a link so collaborators can edit with me.
- _Acceptance Criteria:_ Share link; edit/comment roles; live cursors; conflict‑free merges.
- _Build:_ Links + Yjs CRDT.

---

### 🗂 Noob‑Friendly Breakdown (Additional Build Tickets)

> These are smaller, implementation‑focused tickets that map to the feature tickets above. Each has a clear “Done when” so you can ship incrementally. Total MVP tickets here: 24 (plus the 10 feature tickets for tracking = 34).

**EPIC A — Project Setup & CI**

A1. **Repo & Scaffold** — Initialize Next.js (App Router), TypeScript, Tailwind.

_Done when:_ App boots locally; placeholder home page renders.

A2. **Linting/Formatting** — ESLint + Prettier + scripts.

_Done when:_ `npm run lint` and `npm run format` succeed; pre‑commit hook runs.

A3. **CI Pipeline** — GitHub Actions for lint, type‑check, tests.

_Done when:_ CI passes on PR.

A4. **Env Management** — `.env.example` with documented vars; `dotenv` wired.

_Done when:_ Local env loads; missing vars fail clearly.

A5. **Deploy Basics** — Vercel (frontend) + Render/Fly (API) with health check.

_Done when:_ Public preview URL exists; `/api/health` returns OK.

**EPIC B — Upload & Storage (S3)**

B1. **Upload UI Shell** — Drag‑and‑drop + file picker (no network).

_Done when:_ Selected file name and size render.

B2. **Client Validation** — Type (PDF/JPG/PNG), size ≤10 MB, page limit guard.

_Done when:_ Invalid files show friendly errors.

B3. **S3 Bucket & IAM** — Create private bucket; least‑privileged IAM user.

_Done when:_ You can upload an object via console with that user.

B4. **Presign Endpoint** — `/api/storage/presign` returns PUT URL w/ content‑type & size constraints.

_Done when:_ Curl upload with presigned URL works.

B5. **Client Direct Upload** — Use presigned URL; show upload progress.

_Done when:_ File lands in S3; key is saved in app state.

B6. **First‑Page Preview** — For images, show preview; for PDFs, render page 1 thumbnail.

_Done when:_ Thumbnail or fallback icon appears.

**EPIC C — OCR Pipeline**

C1. **Job Model (In‑Memory)** — Create job store; statuses; timeouts.

_Done when:_ New job IDs exist and change status over time.

C2. **/api/ocr/start** — Accept S3 key; create job; choose provider (tesseract default).

_Done when:_ Returns `{ jobId }`.

C3. **Tesseract Adapter** — WebWorker that returns `{page, text, confidence}` per page.

_Done when:_ Sample image returns text.

C4. **Provider Interface** — Unify interface for Mistral/Tesseract; normalizer utility.

_Done when:_ Both adapters compile against interface.

C5. **/api/jobs/:id** — Returns status, progress, and result when done.

_Done when:_ Polling returns increasing progress and final text.

C6. **Error/Retry** — Handle failures and one retry; cap runtime.

_Done when:_ Failed jobs surface an error message and retry works.

C7. **Accuracy Benchmarks** — Add three sample docs and script to measure accuracy/time.

_Done when:_ Results recorded in README.

**EPIC D — Status UI**

D1. **Polling Hook** — React hook to poll job endpoint.

_Done when:_ Hook exposes `{status, progress, result}`.

D2. **Progress & Errors** — UI component with spinner, bar, retry, and failure state.

_Done when:_ States render correctly in mocked scenarios.

**EPIC E — Editor**

E1. **Editor Integration** — TipTap with StarterKit + Underline + History; load per‑page content.

_Done when:_ OCR text appears and is editable.

E2. **Find/Replace + Spellcheck** — Simple find UI; rely on browser spellcheck.

_Done when:_ Can find and replace across current page.

E3. **Quick Fixes** — Button for hyphen join, smart quotes, and I/l swap.

_Done when:_ Running tools mutates content as expected.

E4. **Page Navigator** — Sidebar list of pages; clicking scrolls to section.

_Done when:_ Navigation jumps to the correct editor block.

**EPIC F — Export**

F1. **Export .txt** — `/api/export/txt` that maps editor JSON → text.

_Done when:_ Downloaded `.txt` matches editor content.

F2. **Export .docx** — `/api/export/docx` mapping with headings/lists.

_Done when:_ Downloaded `.docx` opens in Word/Google Docs as expected.

F3. **Filename Builder** — Safe filenames; `-edited` suffix.

_Done when:_ Names are sanitized and predictable.

F4. **(Optional) Text‑Only PDF** — Minimal PDF export.

_Done when:_ Downloaded PDF includes edited text.

**EPIC G — Guest Flow & Privacy**

G1. **Local Session** — Persist current doc state in localStorage.

_Done when:_ Refresh keeps current edits.

G2. **Retention/Cleanup** — Script or cron to delete S3 objects >24h.

_Done when:_ Old test uploads are removed automatically.

**EPIC H — Tests & Docs**

H1. **Unit Tests** — Utilities and provider adapters.

_Done when:_ `npm test` passes with coverage on utils.

H2. **Integration Test** — Upload→OCR→export (mock provider).

_Done when:_ Single script runs the flow and asserts outputs.

H3. **E2E (Playwright)** — Guest happy path smoke test.

_Done when:_ CI runs Playwright headless successfully.

H4. **README & Demo Script** — Learning log, setup, env, sample docs, 90‑sec demo steps.

_Done when:_ Teammate can run the app from scratch.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind, TipTap
- **Backend:** Node.js (NestJS or Express) with TypeScript
- **OCR Providers:**
  - Primary: Mistral OCR (HTTP API)
  - Fallback: Tesseract
- **Storage:** Amazon S3
- **Database (optional MVP):** Supabase (Postgres)
- **Exports:** `docx` (npm `docx`), PDF (`pdf-lib` or `pdfkit`)
- **Auth:** Clerk (email/password or magic link)

**Learning Note:** Each technology is selected to give the developer practice in essential full‑stack skills: React components, server APIs, data modeling, third‑party API integration, authentication, and deployment.

---

## 📅 Build Plan (6 Workdays for MVP)

_This schedule aligns with bootcamp pacing. Each day balances learning with implementation._

**✅ Day 1 COMPLETED:** Learn Next.js basics → create app, upload UI, type guards, file validation

- _All EPIC A tickets completed with professional CI/CD setup_

**✅ Day 2 COMPLETED:** Learn file handling in Node.js → upload API + storage, in‑memory job model, progress UI

- _EPIC B nearly complete (5/6 tickets) - file upload system fully functional_

**🔄 Day 3 IN PROGRESS:** Learn OCR integration → provider abstraction, Tesseract fallback, per‑page text rendering

- _Starting EPIC C - currently finishing B6-1 (file preview)_

**Day 4:** Learn TipTap editor → rich editor with utilities, page navigation

**Day 5:** Learn export functions → implement `.txt` and `.docx` exports, filename handling

**Day 6:** Learn testing & deployment → E2E tests, benchmarks, deploy to Vercel/Render, polish & bugfixes

_(Stretch Week)_: Learn authentication and persistence, PDF export, i18n, and cloud sync.

### 🏆 Progress Milestones Achieved

1. **✅ Foundation Milestone**: Complete development environment with professional tooling
2. **✅ Infrastructure Milestone**: Deployed full-stack application with health monitoring
3. **🎯 Upload Milestone**: Secure file upload system with validation and progress tracking _(95% complete)_
4. **🔄 OCR Milestone**: Text extraction pipeline _(next major milestone)_
5. **⏳ Editor Milestone**: Rich text editing with OCR corrections
6. **⏳ Export Milestone**: Document export in multiple formats
7. **⏳ MVP Milestone**: End-to-end functional application

---

## 📈 Progress Status (Updated September 2, 2025)

### 🎉 EPIC A — Project Setup & CI: **COMPLETED** ✅

**Milestone: 20/20 issues closed (100%)**

All foundational setup tickets completed successfully:

- ✅ **A1-1 to A1-5**: Repository initialization, Next.js setup, Tailwind CSS, basic app shell, VS Code workspace
- ✅ **A2-1 to A2-4**: ESLint configuration, Prettier integration, NPM scripts, pre-commit hooks
- ✅ **A3-1 to A3-3**: Type-checking scripts, unit test harness, GitHub Actions CI pipeline
- ✅ **A4-1 to A4-3**: Environment management, safe env loader, client/server env separation
- ✅ **A5-1 to A5-5**: Backend API skeleton, deployment to Render/Vercel, health endpoint wiring, smoke checks

**Key Learning Achievements:**

- Mastered Next.js App Router with TypeScript
- Implemented comprehensive CI/CD pipeline
- Established professional development workflow with linting, formatting, and testing
- Successfully deployed full-stack application to production

### 🎓 Major Technical Learning Achievements

**Full-Stack Development Mastery:**

- ✅ **Modern React Development**: Next.js 13+ App Router, TypeScript, Tailwind CSS
- ✅ **Professional Development Workflow**: ESLint, Prettier, Husky pre-commit hooks
- ✅ **Testing & Quality Assurance**: Jest unit testing, GitHub Actions CI/CD
- ✅ **Environment Management**: Secure environment variable handling, validation
- ✅ **Cloud Deployment**: Vercel (frontend) + Render (API) with health monitoring

**Advanced File Handling & Storage:**

- ✅ **Secure File Uploads**: Presigned URLs, direct-to-cloud upload pattern
- ✅ **Client-Side Validation**: Dynamic file limits, type checking, size validation
- ✅ **Progress Tracking**: Real-time upload progress with error recovery
- ✅ **Cloud Storage Integration**: Supabase Storage (migrated from AWS S3)
- ✅ **File Preview System**: Image thumbnails and PDF first-page preview

**Backend API Development:**

- ✅ **RESTful API Design**: Health endpoints, storage APIs, presign endpoints
- ✅ **Error Handling**: Comprehensive error responses and validation
- ✅ **Security Best Practices**: Environment-based configuration, secure headers
- ✅ **Production Deployment**: Live API with monitoring and status endpoints

**Project Management & Git Workflow:**

- ✅ **Issue-Driven Development**: GitHub Issues with milestones and labels
- ✅ **Feature Branch Strategy**: One branch per ticket with descriptive naming
- ✅ **Professional Commits**: Clear commit messages and PR descriptions
- ✅ **Milestone Tracking**: Epic-based organization with progress monitoring

### 🚀 EPIC B — Upload & Storage: **83% COMPLETE** (5/6 issues closed)

**Milestone: Working file upload system with Supabase Storage**

- ✅ **B1-1**: Upload UI Shell - Drag & drop + file picker functionality
- ✅ **B2-1**: Client Validation - File type, size & page limits with dynamic limit checking
- ✅ **B3-1**: Secure Storage Setup - Migrated from AWS S3 to Supabase Storage
- ✅ **B4-1**: Presign Endpoint - Secure direct upload URLs implementation
- ✅ **B5-1**: Client Direct Upload - Progress tracking and comprehensive error handling
- 🔄 **B6-1**: First-Page Preview - Images & PDF thumbnails _(IN PROGRESS - current branch)_

**Key Learning Achievements:**

- Implemented secure file upload with presigned URLs
- Built robust client-side validation with custom hooks
- Mastered file handling and progress tracking
- Successfully integrated cloud storage (Supabase)

### 📋 Remaining Work for MVP

**EPIC C — OCR Pipeline** (6 tickets)

- OCR job management and provider abstraction
- Tesseract and Mistral OCR integration
- Error handling and accuracy benchmarking

**EPIC D — Status UI** (2 tickets)

- Real-time progress polling
- User-friendly status indicators

**EPIC E — Editor** (4 tickets)

- TipTap rich text editor integration
- Find/replace and OCR correction tools
- Multi-page navigation

**EPIC F — Export** (3-4 tickets)

- Text and DOCX export functionality
- Filename handling and optional PDF export

**EPIC G — Guest Flow** (2 tickets)

- Local session persistence
- Data cleanup and retention policies

**EPIC H — Tests & Docs** (4 tickets)

- Comprehensive testing suite
- Documentation and demo preparation

---

## ✅ Definition of Done (MVP)

- End‑to‑end demo: upload → OCR (3 pages) → edit → export `.docx` within 30 seconds
- README includes setup instructions, environment variables, sample documents, and a demo video link
- Automated tests pass in CI/CD pipeline
- Developer demonstrates the full‑stack learning journey during bootcamp presentation
