# ProbHub: Problem Discovery Platform  — Technical Spec v0

## 0. Goal & Scope

Build a web platform that aggregates *problem/complaint* data from multiple public sources and surfaces them as structured, searchable "problems" for entrepreneurs and problem-solvers.

**Initial constraints**:

- Frontend: Next.js (app router) + TypeScript + Tailwind CSS.
- Backend: Node/TypeScript inside the same Next.js repo (route handlers / API routes) + background workers.
- DB: PostgreSQL as the system of record. Optionally Redis for job queues/caching.
- Cost sensitive: prefer free/public APIs over scraping or paid APIs.
- v1: Single-source ingestion (Hacker News Ask HN), basic search & filtering.
- Later: Multi-source ingestion (StackExchange, GitHub Issues, Reddit, etc.), ranking, tagging, AI summarization, and B2B features.

---

## 1. High-Level Architecture

### 1.1 Component Overview

**Frontend (Next.js app)**

- Next.js App Router, TypeScript, Tailwind CSS.
- Pages:
  - `/` — Landing + high-level explanation, featured problems.
  - `/problems` — Problem feed (search, filters, sort by recency/impact/source).
  - `/problems/[id]` — Problem details page (source context, discussion, tags).
  - `/sources` — Explain supported sources and coverage.
  - `/collections` (later) — Curated lists of problems.
- Uses a typed API client to call the backend (REST/JSON or tRPC, see 2.3).

**Backend (API & business logic)**

- Implemented inside Next.js using `app/api/**/route.ts` route handlers.
- Responsible for:
  - Exposing problem/query APIs.
  - Auth (minimal/optional in v1 — read-only public).
  - Rate limiting & caching.
  - Aggregation logic (ranking, deduplication, normalization).

**Data Layer**

- **Supabase** as the primary managed Postgres instance.
  - Gives us: hosted Postgres, built-in auth, row-level security (if needed later), simple dashboard, and backups out of the box.
  - We still treat it conceptually as "PostgreSQL" so the schema design stays the same.
- service role key for backend worker, anon key for read-only FE if we ever want direct access.
- Schema for:
  - `sources`
  - `raw_events` (raw JSON payloads from each external API)
  - `problems` (normalized, denormalised problem records)
  - `problem_tags`, `tags`
  - `problem_signals` (clicks, saves, upvotes, etc.)

**Ingestion Workers (simplified for v1 using Vercel Cron)**

- **For v1: no separate worker process** unless ingestion volume becomes too large.
- Scheduled ingestion is handled by **Vercel Cron Jobs**, which make HTTP requests directly to our Next.js API route handlers (e.g., `/api/ingest/hackernews`).
- Route handlers:
  - Fetch external data from source APIs.
  - Write raw responses into `raw_events` in Supabase.
  - Run LLM normalization inline (for small batches) or trigger a second cron route for normalization.
- This eliminates the need for Redis, BullMQ, or maintaining a separate long-running worker server.



**Search/Indexing**

- v1: Postgres full-text search (tsvector) on title + description.
- v2: Optional vector search (pgvector / external service) to cluster similar problems and improve search quality.

**Deployment**

- **Supabase** hosts the Postgres DB (and optionally auth/storage later).
- Option A (simplest for v1):
  - Next.js app (frontend + API routes) on Vercel.
  - Background ingestion workers as **Vercel Cron jobs** or a small standalone Node process on a cheap VPS that also talks to Supabase.
- Option B: Dockerized deployment on a single VPS:
  - Next.js server
  - Worker process
  - (Still using Supabase as DB, or self-hosted Postgres if you ever want to migrate off Supabase.)

---

## 2. Backend Design

### 2.1 Core Entities & Schema (Draft)

Using a relational DB (Postgres). ORM can be Prisma or Drizzle; spec below is logical, not ORM-specific.

**sources**

- `id` (PK, UUID)
- `name` (e.g., `hackernews`, `stackexchange`, `github`, `reddit`)
- `display_name`
- `type` (enum: `forum`, `qa`, `code_repo`, `review_site`, etc.)
- `status` (enum: `active`, `paused`)
- `metadata` (JSONB) — any source-specific data (API endpoint base URL, rate limits, etc.)
- `created_at`, `updated_at`

**raw\_events**

- `id` (PK, UUID)
- `source_id` (FK → sources)
- `external_id` (string, unique per source, e.g., HN item id, GitHub issue id)
- `external_parent_id` (nullable string, for threading)
- `payload` (JSONB) — raw API response
- `fetched_at` (timestamp)
- `ingestion_status` (enum: `pending`, `processed`, `error`)
- `ingestion_error` (nullable text)

**problems**

- `id` (PK, UUID)
- `source_id` (FK → sources)
- `raw_event_id` (FK → raw\_events)
- `external_id` (string) — same as in `raw_events` for quick join
- `title` (text)
- `description` (text) — normalized main problem text; may include combined post + top comments.
- `source_url` (text)
- `author_handle` (text or hashed)
- `created_at_source` (timestamp) — original creation time from source
- `created_at` (timestamp default now)
- `updated_at` (timestamp)
- `language` (text, e.g., `en`, `zh`, etc.)
- `upvotes` (integer, from source)
- `comments_count` (integer, from source)
- `score` (numeric) — composite score for ranking (see 2.2).
- `fts` (tsvector) — materialized full-text search vector.

**tags**

- `id` (PK, UUID)
- `slug` (text, unique)
- `name` (text)
- `type` (enum: `domain`, `persona`, `impact`, `status`, `source_tag`, `system`)

**problem\_tags**

- `problem_id` (FK → problems)
- `tag_id` (FK → tags)
- PK on (problem\_id, tag\_id)

**problem\_signals** (later)

- `id` (PK, UUID)
- `problem_id`
- `user_id` (nullable for anonymous events, or hashed IP/session)
- `type` (enum: `view`, `click_source`, `bookmark`, `share`)
- `created_at`

### 2.2 Ranking & Scoring (v1)

Basic `score` field computed during normalization or via a scheduled job:

- Inputs:
  - `upvotes` / `score` from source
  - `comments_count`
  - time decay factor based on `created_at_source`
  - source weight (HN vs GitHub vs StackExchange, etc.)

Pseudo formula:

```text
score = (a * log(1 + upvotes))
      + (b * log(1 + comments_count))
      - (c * age_in_days)
```

Where `a, b, c` are tunable constants stored in configuration.

### 2.3 API Surface (v1)

Prefer **REST JSON** for simplicity.

**List problems**

- `GET /api/problems`
- Query params:
  - `q`: full-text search query
  - `source`: filter by source name (`hackernews`, etc.)
  - `tag`: filter by tag slug (repeatable)
  - `sort`: `new`, `top`, `trending`
  - `page`, `page_size`
- Response:
  - `items: Problem[]`
  - `total`
  - `page`, `page_size`

**Get problem details**

- `GET /api/problems/:id`
- Includes:
  - problem core fields
  - tags
  - selected original context (link back to source)

**List sources**

- `GET /api/sources`

**List tags**

- `GET /api/tags`

Later:

- `POST /api/problems/bookmark` (auth required)
- `GET /api/collections`

### 2.4 Ingestion & Normalization Flow

1. **Scheduler** triggers a job per connector (e.g., every 10–30 minutes per source type, adjustable).
2. **Connector** calls the external API, retrieves new/updated items.
3. For each item:
   - Upsert into `raw_events` by `(source_id, external_id)`.
   - Enqueue a normalization job.
4. **Normalizer (LLM-centric)**:
   - Reads `raw_events` with `ingestion_status = 'pending'`.
   - Builds a **normalization prompt** for an LLM from the raw payload, including:
     - Source name and minimal structured metadata (title, score, tags, etc.).
     - Plain-text body (HTML stripped, truncated at a configurable max length, e.g. 4–8k tokens total).
   - Calls an LLM (e.g., OpenAI-compatible API or self-hosted model) with a **system prompt** like:
     - "You are a problem mining agent. Extract the underlying problem statement, who is affected, and context, from forum posts, Q&A or issue text."
   - Expects a **strict JSON response** describing a normalized problem (see `NormalizedProblem` shape below).
   - Parses and validates the JSON; on success:
     - Upserts into `problems`.
     - Populates `title`, `description` (problem-focused summary), `source_url`, `upvotes`, `comments_count`, etc.
     - Maps LLM-returned labels to `tags` (e.g. domain, persona, severity).
     - Updates `fts` column using `to_tsvector('english', title || ' ' || description)`.
   - If the LLM classifies the content as **"no clear problem"**, the normalizer can skip creating a `problem` row, leaving only `raw_events` stored.

**Cost control strategies for LLM normalization**:

- Only send **promising candidates** to the LLM based on simple heuristics:
  - Source-specific filters (e.g., HN Ask HN only, GitHub issues with `feature-request` labels, StackOverflow with certain tags/keywords).
  - Minimum score/upvotes threshold, or recency window.
- Use a **two-stage LLM pipeline** when needed:
  - Stage 1 (cheap): short classification prompt → is this a meaningful problem? (yes/no + coarse tags).
  - Stage 2 (richer): full extraction only if Stage 1 says "yes".
- Truncate long texts and comments, keeping the parts most likely to describe the pain (original post + top N comments).
- Cache LLM responses keyed by `(source, external_id, model_version)` so re-runs are unnecessary unless you change the model or prompt.

Error handling:

- On normalization error, set `ingestion_status = 'error'` + `ingestion_error`.
- Expose basic admin UI or CLI for reprocessing failed items.

### 2.5 Rate Limiting & Caching

- Use in-memory or Redis-backed rate limiting for public API (per IP).
- Cache most popular `/api/problems` responses for short TTL (e.g., 30–60s) to reduce DB load.
- Ingestion connectors must respect external API rate limits (see 4.x).

---

## 3. Frontend Design (Next.js + TS + Tailwind)

### 3.1 Project Structure (App Router)

```text
src/
  app/
    layout.tsx
    page.tsx                # landing
    problems/
      page.tsx              # list / search view
      [id]/page.tsx         # detail view
    sources/page.tsx        # list of sources
    api/                    # Next.js route handlers (if colocated)
  components/
    ProblemCard.tsx
    ProblemList.tsx
    ProblemFilters.tsx
    SourceBadge.tsx
    Layout/
      Header.tsx
      Footer.tsx
      Shell.tsx
  lib/
    apiClient.ts            # typed fetch wrappers
    types.ts                # shared TS types (Problem, Source, Tag)
    config.ts
```

### 3.2 Key UI Components

**ProblemCard**

- Shows title, truncated description, source, score, age, tags.
- Clickable → navigate to detail.

**ProblemFilters**

- Search input (debounced).
- Source dropdown/filter chips.
- Tag filter pills.
- Sort selector.

**ProblemDetailPage**

- Full description + meta
- Button/link to open original source.
- Show associated tags and basic statistics.
- (Later) show similar problems (based on tags or embeddings).

### 3.3 API Client & Types

Define shared TypeScript interfaces in `lib/types.ts` (mirroring backend).

Example:

```ts
export interface Problem {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceUrl: string;
  createdAtSource: string;
  upvotes: number;
  commentsCount: number;
  score: number;
  tags: string[];
}
```

Use a thin wrapper `apiClient.ts` to call `/api/*` and handle errors.

### 3.4 Styling

- Tailwind CSS with a small design system:
  - Colors: neutral background, high-contrast text.
  - Components: `card`, `badge`, `pill`, `button`, `input` defined via Tailwind utility classes or a `ui` folder.
- Focus on readability of long-form text (good line-height, font-size, max-width).

---

## 4. Source Integration Roadmap & Technical Notes

We cannot integrate everything at once. We prioritize **(1) usefulness, (2) free API availability, (3) ease of integration, (4) ToS friendliness.**

### Phase 1 — Hacker News (Ask HN)

**Why**: Highly concentrated startup-relevant problems. Official Firebase API is public and free; widely used. [Refs: official HN API docs and discussions about the live Firebase API.]

**API**: Hacker News official Firebase API (e.g., `https://hacker-news.firebaseio.com/v0/...`).

**What to ingest**:

- `askstories` endpoint → list of Ask HN item IDs.
- For each item ID:
  - `item/{id}.json` → get story details and comments.

**Extraction rules**:

- Problem candidate = Ask HN post where:
  - Title contains patterns like `Ask HN:`.
  - Body describes a problem/pain (we may start by ingesting all Ask HN and refine later).
- Description field:
  - Combine story `title` + `text` (HTML → markdown) and optionally top N comments as context.

**Connector implementation** (HNConnector):

- Maintain state of last fetched `time` or a set of processed IDs.
- Periodic job:
  - Call `askstories` to get IDs.
  - Filter out IDs that already exist in `raw_events`.
  - Fetch story details for new IDs.
  - Insert into `raw_events` + enqueue normalization.

**Rate limiting**:

- Simple local throttle (e.g., max 50 calls/min) is usually enough; can be tuned.

---

### Phase 2 — StackExchange (StackOverflow & others)

**Why**: Free API with generous limits and very rich Q&A content. Users often describe concrete technical pain points. The StackExchange API is free of charge (with usage limits). [Refs: StackExchange API docs and community Q&A indicating it is free with quotas.]

**API**: StackExchange API (`https://api.stackexchange.com/2.3/...`).

**What to ingest** (initially):

- Focus on StackOverflow (site=`stackoverflow`).
- Query questions with specific filters:
  - `inname` or `intitle` contains keywords like `struggle`, `problem`, `pain`, `workaround`, `why is there no`.
  - Or simply ingest top questions in certain tags (e.g., `devops`, `data-engineering`, `fintech`) and rely on normalization/ML later.

**Connector implementation** (StackExchangeConnector):

- Use `questions` endpoint with `order=desc&sort=creation&site=stackoverflow`.
- Store `question_id`, `title`, `body`, `tags`, `score`, `answer_count`, `creation_date`.
- Map to `problems` with:
  - Title → `title`.
  - Body → `description`.
  - Score → `upvotes`.
  - Answer count → `comments_count` equivalent.

**Quota handling**:

- Without API key: smaller quotas.
- With API key: daily quota \~10,000 requests per app/user pair. [Refs: docs on `quota_max`, `quota_remaining` and StackExchange throttling/quota pages.]
- Implement `X-RateLimit` aware behavior; pause when `quota_remaining` is low.

---

### Phase 3 — GitHub Issues

**Why**: Issues often represent real developer pain & missing tools. GitHub REST API is free for public data, with rate limits. [Refs: GitHub REST API rate limits: unauthenticated \~60 req/hour; higher for authenticated with PAT.]

**API**: GitHub REST v3 or GraphQL.

**What to ingest**:

- Issues from repositories matching certain topics (e.g., `devtools`, `data-engineering`, `ai`, `productivity`).
- Or curated repository list we maintain.

**Connector implementation** (GitHubConnector):

- Authenticate with a personal access token to raise rate limits.
- Use search API: `GET /search/issues?q=is:issue+is:open+repo:owner/repo` or filters like `label:feature-request`.
- Extract:
  - `title`, `body`, `html_url`, `user.login`, `created_at`, `reactions`, `comments`.
- Map issues that look like feature requests or pain points into `problems`.

**Rate limits**:

- Respect REST API rate limits and use conditional requests (ETags) when possible.

---

### Phase 4 — Reddit (Selective)

**Why**: Huge volume of complaints & real-life problems. **Constraints**: API pricing changes and ToS restrictions; we must stay in the free tier and respect use-case constraints. [Refs: Reddit API changes and pricing controversy.]

**Approach**:

- Start with a *very low-volume* integration for specific subreddits (e.g., `r/Entrepreneur`, `r/startups`, `r/smallbusiness`) if we can safely fit in free quotas.
- Use official Reddit Data API with OAuth, staying under free-tier usage.
- Alternatively, rely on user-provided problem submissions for content similar to Reddit (Phase 1/2) and defer heavy Reddit ingestion.

**Connector implementation** (RedditConnector — LATER):

- Authenticate via OAuth.
- Fetch recent posts tagged as `Question` or `Advice`.
- Extract `title`, `selftext`, upvotes, comments.
- Map to `problems`.

---

### Phase 5 — Other Sources (Longer Term)

These are valuable but more complex:

- **Product Hunt**: comments & launch feedback — requires auth and ToS review.
- **G2 / Capterra**: B2B software complaints in reviews — mostly scraping → legal & technical overhead.
- **Amazon Reviews**: consumer product complaint signals — scraping; consider only if we build a dedicated consumer vertical.
- **Kaggle / Open problem competitions**: structured but niche.

We keep them in the roadmap but not in the first implementation waves.

---

## 5. Ingestion Infrastructure Details

### 5.1 Job Runner Options

**Option A — BullMQ + Redis (recommended)**

- Pros: battle-tested, delayed jobs, retries, backoff, observability.
- Cons: need Redis instance.

Job queues:

- `fetch_external_source` — per source/connector; payload contains source name + cursor.
- `normalize_raw_event` — for each raw event.

**Option B — Simple in-process scheduler**

- For MVP/local: Node cron (`node-cron`) that periodically runs connector functions.
- Less robust, but fewer moving parts.

### 5.2 Connector Interface

Define a common TS interface for all connectors:

```ts
export interface SourceConnector {
  sourceName: string; // 'hackernews' | 'stackexchange' | ...
  fetchNewRawEvents(since: Date | null): Promise<RawEventPayload[]>;
}

export interface RawEventPayload {
  externalId: string;
  externalParentId?: string;
  payload: unknown; // raw JSON
  createdAtSource: Date;
  sourceUrl: string;
}
```

Each connector:

- Knows how to handle pagination/cursors.
- Returns normalized raw payloads for storage.

### 5.3 Normalizer Interface (LLM-backed)

```ts
export interface ProblemNormalizer {
  sourceName: string;
  normalize(raw: RawEventPayload): Promise<NormalizedProblem | null>;
}

export interface NormalizedProblem {
  title: string;                     // concise, problem-focused title
  description: string;               // LLM-summarized problem statement + key context
  createdAtSource: Date;
  sourceUrl: string;
  authorHandle?: string;
  upvotes?: number;
  commentsCount?: number;
  tags?: string[];                   // flat list of tag slugs suggested by LLM
}
```

Implementation notes:

- **LLMNormalizers** (one per source) are thin wrappers that:
  - Extract source-specific raw fields from `raw.payload`.
  - Construct an LLM prompt with: title, body, comments, basic metrics.
  - Call a shared `llmClient` with a model + system prompt + user prompt.
  - Parse/validate the JSON response into `NormalizedProblem`.
- Non-LLM or hybrid normalizers can still implement the same interface if we want to do rule-based enrichment.

The interface stays simple (single method, single output), while the internals rely on an LLM for most of the text understanding.

### 5.4 LLM Service Architecture

To keep the rest of the system clean, centralize all model-related logic:

- `llmClient` module:

  - Wraps underlying provider(s) (e.g., OpenAI-compatible HTTP endpoint or self-hosted model).
  - Handles API keys, timeouts, retries, and exponential backoff.
  - Enforces **max tokens** and truncation strategy.
  - Logs token usage (for cost monitoring) and error statistics.

- Prompt templates:

  - Store reusable templates for each source (HN, StackExchange, GitHub, etc.).
  - Version them: `llm_prompt_version` so we can re-run normalization with a new prompt/model later if needed.

- Safety & compliance:

  - Strip or hash personal data when feasible before sending to the LLM.
  - Respect source ToS regarding data processing.

This way, connectors only care about fetching raw data, and normalization logic only cares about building and interpreting LLM calls.

One normalizer per source; can be extended without touching core ingestion.

---

## 6. Non-Functional Requirements

### 6.1 Performance

- Initial traffic expected to be low-moderate.
- Aim for P95 page load < 1.5–2s for main list pages.
- API endpoints should return in <300ms for cached queries and <700ms for cold queries.

### 6.2 Reliability

- If external APIs fail, ingestion jobs should retry with exponential backoff.
- Failures should not break the public site (we always serve from Postgres, not live APIs).

### 6.3 Legal & ToS Compliance

- Each connector must:
  - Respect source API ToS and rate limits.
  - Provide clear attribution and links back to the original content.
  - Avoid storing personal-identifying information beyond usernames/handles.

### 6.4 Observability

- Minimal logging: ingestion success/fail, rate limiting hit, error stacks.
- Later: health page `/api/admin/health` to monitor ingestion lag per source.

---

## 7. Implementation Plan (Step-by-Step)

### Step 1 — Repo & Core Setup

- Create Next.js (App Router) project with TypeScript and Tailwind.
- Create a Supabase project and configure:
  - Postgres database.
  - Service role key (used only on the backend/worker side).
  - (Optional) Auth, if/when we add user accounts.
- Install ORM (Prisma/Drizzle) and set up a connection to **Supabase Postgres** using the service key for backend API routes and workers.
- Implement initial DB schema migrations for `sources`, `raw_events`, `problems`, `tags`, `problem_tags`.

### Step 2 — Basic API + Frontend Skeleton — Basic API + Frontend Skeleton

- Implement `/api/problems` and `/api/problems/[id]` with mocked data.
- Build basic UI for:
  - Problem list (search box, filters stubbed).
  - Problem detail page.
- Deploy MVP skeleton (even before real data) to verify hosting & CI/CD.

### Step 3 — Ingestion Infrastructure (HN Only, via Vercel Cron)

- Create a new API route: `/api/ingest/hackernews`.
  - This route contains the entire ingestion pipeline for v1:
    - Fetch new Ask HN posts.
    - Write raw items into Supabase (`raw_events`).
    - Run LLM normalization (inline in the same route, for small batches).
- Add a **Vercel Cron Job** (e.g., every 15 or 30 minutes) that sends a `POST` request to this route.
  - Use a simple header-based secret (e.g., `Authorization: Bearer <INGESTION_SECRET>`) so that only cron can trigger ingestion.
- Verify ingestion works end-to-end by manually triggering the API route initially.
- Backfill small historical data sets (e.g., last 3 months) using a manual script or multiple calls.
- Wire up FTS index on `problems`.

### Step 4 — Wire Frontend to Real Data

- Replace mocked data with live DB-backed API.
- Add filters for `source = hackernews`.
- Add basic ranking (`sort=top`, `sort=new`).

### Step 5 — Add StackExchange Connector

- Implement `StackExchangeConnector` and `StackExchangeNormalizer`.
- Decide on initial query strategy (tags, titles with certain keywords, etc.).
- Backfill small dataset to test.
- Update UI filters to support multiple sources.

### Step 6 — Add GitHub Issues Connector

- Implement `GitHubConnector` and `GitHubNormalizer`.
- Start with a curated list of repos and low ingestion frequency to stay within rate limits and cost.

### Step 7 — Tagging & Simple Discovery Features

- Implement automatic tagging logic (e.g., based on source tags, keywords).
- UI updates: tag filters, tag chips.
- Add simple "related problems" (by overlapping tags and FTS similarity).

### Step 8 — Analytics & Feedback

- Log problem views and source clicks into `problem_signals`.
- Add simple stats dashboard (internal-only) for:
  - Problems per source
  - New problems per day
  - Top viewed problems

### Step 9 — Future: User Accounts & Curation

- Add minimal auth (email/password or OAuth).
- Allow users to:
  - Bookmark problems
  - Create custom collections
  - Upvote problems (internal signal in addition to source upvotes).

### Step 10 — Future: AI Layer

- Add optional summarization of problem threads.
- Cluster problems based on embeddings to show themes.
- Provide a "problem radar" view: areas with growing complaint volume.

---

## 8. Open Questions / To Refine Later

1. **Deployment choice**: Vercel + worker VM vs single-VPS Docker stack.
2. **ORM**: Prisma vs Drizzle (both work; choose based on team preference).
3. **Tagging strategy**: how much is rule-based vs ML-based in v1.
4. **Rate limit handling**: global configuration for all connectors vs per-connector logic.
5. **Data retention**: do we keep all historical raw events or prune after normalization?

---

This spec is v0 and intended to be iteratively refined as we:

- finalize hosting choices,
- test actual API behaviors and limits,
- and validate UX with early users.

