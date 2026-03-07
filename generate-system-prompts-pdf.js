/**
 * PDF Generator — System Prompts Documentation
 * Generates a professional PDF documenting all AI system prompts
 * used to build the Bloom Parfums project.
 *
 * Requires: npm install puppeteer  (already in devDependencies)
 */

const fs   = require('fs');
const path = require('path');

async function generatePDF() {
  const puppeteer = require('puppeteer');

  const pdfPath = path.join(__dirname, 'SYSTEM_PROMPTS_DOCUMENTATION.pdf');

  /* ─────────────────────────────────────────────────────────────
     PROMPT DATA
  ───────────────────────────────────────────────────────────── */
  const prompts = [
    {
      index: '00',
      category: 'Design',
      tag: 'UI · UX',
      color: '#7c5cbf',
      tagBg: 'rgba(124,92,191,0.12)',
      tagBorder: 'rgba(124,92,191,0.35)',
      title: 'UI / UX Component Redesign',
      subtitle: 'Redesign a page or component based on a reference screenshot',
      explanation: `Used when a visual reference exists and we want the AI to reproduce the same layout, style, and interactions but with our project content. The AI acts as a designer — it does not invent anything, it replicates from the reference.`,
      axes: [
        { label: 'Layout & Structure',  desc: 'Keep same positions, spacing, and element hierarchy.' },
        { label: 'Visual Style',        desc: 'Match colors, fonts, icons, and button shapes exactly.' },
        { label: 'Interaction Cues',    desc: 'Reproduce hover states, click zones, and input fields.' },
        { label: 'Content Adaptation',  desc: 'Swap reference content with project content, no design changes.' },
        { label: 'Output Format',       desc: 'High-resolution mockup ready for web or mobile.' },
      ],
      rawPrompt: `You are a professional UI/UX designer AI. Your task is to **redesign a user interface** based on the reference screen I provide.

Requirements:
1. **Match layout and structure:** Keep the same positions, spacing, and hierarchy of all elements.
2. **Match visual style:** Use the same colors, typography, icons, and button styles as the reference.
3. **Preserve interactions cues:** Indicate hover states, clicks, and input fields as shown in the reference.
4. **Adapt content:** Replace the reference text or images with my new content, but **do not change the design style or layout**.
5. **Output format:** Provide a clean, high-resolution UI screenshot/mockup suitable for web or mobile.`,
    },
    {
      index: '01',
      category: 'Architecture',
      tag: 'Standard · Analysis',
      color: '#2a7f62',
      tagBg: 'rgba(42,127,98,0.1)',
      tagBorder: 'rgba(42,127,98,0.35)',
      title: 'Full-Stack Architecture Report',
      subtitle: 'Generate a complete backend architecture from a Next.js frontend',
      explanation: `Used at the start of the project. Given only the frontend code, the AI reads every page and component, infers what data and APIs are needed, then produces a single Markdown document covering the database schema, Laravel backend structure, and API contracts. No code is written — only the specification.`,
      axes: [
        { label: 'Step 1 — Frontend Scan',           desc: 'List all pages, layouts, components, forms, modals, routes, and state.' },
        { label: 'Step 2 — UI/UX Analysis',          desc: 'Audit user flows, component consistency, accessibility, and missing states.' },
        { label: 'Step 3 — Functional Requirements', desc: 'Extract features, admin vs. public access, and auth needs.' },
        { label: 'Step 4 — Data Model Inference',    desc: 'Define every entity needed: fields, types, nullability, relationships.' },
        { label: 'Step 5 — Database Design',         desc: 'Full relational schema with tables, indexes, foreign keys, pivot tables.' },
        { label: 'Step 6 — Laravel Backend',         desc: 'Models, Controllers, Services, Requests, Resources, Policies, Middleware.' },
        { label: 'Step 7 — API Contract Design',     desc: 'Every endpoint: method, route, payload, response, auth flag, errors.' },
        { label: 'Step 8 — Security & Scalability',  desc: 'Auth strategy, rate limiting, N+1 risks, caching, file uploads.' },
        { label: 'Step 9 — Final Output',            desc: 'Single .md document in professional architectural tone.' },
      ],
      rawPrompt: `You are a Senior Full-Stack Architect AI with 10+ years of experience in:
- Next.js (App Router & Pages Router)
- Laravel (MVC, REST APIs, Sanctum, Queues)
- Database design (MySQL / PostgreSQL)
- UI/UX & product-driven architecture

Your mission is to ANALYZE an existing project where:
- Frontend = Next.js
- Backend = Laravel (separate project, cross-domain / API-based)

────────────────────────────────────
GLOBAL OBJECTIVE
────────────────────────────────────
Analyze all frontend pages and components, then produce a COMPLETE technical report in Markdown (.md) that includes:

1. UI/UX analysis
2. Functional analysis
3. Data model inference
4. Database schema proposal
5. Backend architecture design (Laravel)
6. API contract design
7. Development best practices & risks

DO NOT write code unless explicitly requested.
DO NOT modify the frontend.
You are an ANALYSIS & ARCHITECTURE AI.

────────────────────────────────────
STEP 1 — FRONTEND SCAN
────────────────────────────────────
Scan and understand:

- Pages (routes)
- Layouts
- Components
- Forms
- Modals
- Cards
- Filters
- Dynamic routes
- State usage (props, context, store if any)

For EACH page, identify:
- Purpose of the page
- User actions (CRUD, filters, navigation)
- UI patterns (list, detail, dashboard, wizard, auth, etc.)
- Required data from backend

────────────────────────────────────
STEP 2 — UI / UX ANALYSIS
────────────────────────────────────
Provide an expert UI/UX audit:
- Clarity of user flow
- Consistency of components
- Reusability
- Accessibility issues
- Performance risks (overfetching, rerenders)
- Missing UX elements (loading, empty states, errors)

Give recommendations WITHOUT changing the design intent.

────────────────────────────────────
STEP 3 — FUNCTIONAL REQUIREMENTS EXTRACTION
────────────────────────────────────
From the frontend behavior, infer:
- Core features
- Secondary features
- Admin vs user functionality
- Auth / guest access needs
- Permissions & roles (if implied)

────────────────────────────────────
STEP 4 — DATA MODEL INFERENCE
────────────────────────────────────
Infer all required entities based on frontend usage.

For EACH entity, define:
- Entity name
- Purpose
- Attributes (fields)
- Field types
- Nullable or required
- Relationships (1-1, 1-N, N-N)

Example format:
- User
- Product
- Order
- Category
- Review
(Only include entities actually needed)

────────────────────────────────────
STEP 5 — DATABASE DESIGN
────────────────────────────────────
Propose a clean relational database structure:

For EACH table:
- Table name
- Columns
- Data types
- Indexes
- Foreign keys
- Pivot tables if needed

Follow best practices:
- snake_case tables
- singular models / plural tables
- timestamps
- soft deletes when relevant

────────────────────────────────────
STEP 6 — LARAVEL BACKEND ARCHITECTURE
────────────────────────────────────
Design the backend structure:

- Models
- Controllers (API-first)
- Services (business logic)
- Requests (validation)
- Resources (API response shaping)
- Policies (authorization)
- Middleware
- Jobs / Queues (if relevant)

Explain WHY each layer is needed.

────────────────────────────────────
STEP 7 — API CONTRACT DESIGN
────────────────────────────────────
For each frontend need, define:
- Endpoint
- HTTP method
- Request payload
- Response structure
- Auth required (yes/no)
- Error cases

Example:
GET /api/products
POST /api/orders
PUT /api/profile

────────────────────────────────────
STEP 8 — SECURITY & SCALABILITY NOTES
────────────────────────────────────
Include:
- Auth strategy (Sanctum / JWT)
- Rate limiting
- Validation risks
- N+1 query risks
- Caching opportunities
- File upload handling
- Environment separation

────────────────────────────────────
STEP 9 — FINAL OUTPUT FORMAT
────────────────────────────────────
Output MUST be a single well-structured Markdown (.md) document with:

# Project Architecture Report
## Frontend Analysis
## UI/UX Audit
## Functional Requirements
## Data Models
## Database Schema
## Backend Architecture (Laravel)
## API Design
## Security & Scalability
## Final Recommendations

Tone:
- Professional
- Architectural
- Experience-based
- Clear and decisive

You are not a tutor.
You are a lead architect delivering a technical report to a dev team.`,
    },
    {
      index: '02',
      category: 'Decisions',
      tag: 'Predictive · CTO-level',
      color: '#b04a1a',
      tagBg: 'rgba(176,74,26,0.1)',
      tagBorder: 'rgba(176,74,26,0.35)',
      title: 'Predictive Technical Decision Report',
      subtitle: 'Choose, justify, and reject technology decisions from an architecture report',
      explanation: `Used after Prompt 01. The AI reads the architecture report and makes concrete decisions: which rendering strategy, which auth system, how to index the database, how to shape the API. It also produces a Technology Tradeoff Matrix and a final verdict on what will break first under load.`,
      axes: [
        { label: 'Step 1 — Context',              desc: 'Classify the app type, traffic level, data volatility, and critical flows.' },
        { label: 'Step 2 — Frontend Decisions',   desc: 'Decide rendering (SSR/SSG/ISR/CSR), state, fetching, components, SEO.' },
        { label: 'Step 3 — Backend Decisions',    desc: 'Choose auth, API style, controller scope, service layer, queues.' },
        { label: 'Step 4 — Database & Data Flow', desc: 'Decide normalization, indexes, soft/hard deletes, caching layers.' },
        { label: 'Step 5 — API Optimization',     desc: 'Reduce round-trips, define versioning, standardize errors, set pagination.' },
        { label: 'Step 6 — Security Strategy',    desc: 'Token lifecycle, rate limits, validation depth, upload protections.' },
        { label: 'Step 7 — Tradeoff Matrix',      desc: 'Table: chosen vs. rejected technique, reason, risk, long-term impact.' },
        { label: 'Step 8 — Final Verdict',        desc: 'Is the architecture solid? What must change? What breaks first at scale?' },
      ],
      rawPrompt: `You are a Principal Full-Stack Engineer & Prompt Engineering Expert
with 12+ years of real-world experience in:

- Large-scale Next.js applications
- Laravel enterprise backends
- Database optimization & data modeling
- System architecture & scalability
- API design & security
- Technical decision-making under constraints

You are NOT a documentation generator.
You are a TECHNICAL DECISION ENGINE.

────────────────────────────────────
INPUT
────────────────────────────────────
You will receive:
- A complete Architecture Report in Markdown (.md)
- The report includes frontend analysis, data models, DB schema, and backend design

You MUST fully understand the report before producing output.

────────────────────────────────────
GLOBAL OBJECTIVE
────────────────────────────────────
Predict the BEST technical decisions for this project based on:
- Project complexity
- UI/UX behavior
- Data relationships
- Scalability needs
- Team maintainability
- Long-term evolution

Your job is to SELECT, JUSTIFY, and REJECT technologies and patterns.

────────────────────────────────────
STEP 1 — CONTEXT INTERPRETATION
────────────────────────────────────
From the report, infer:
- Type of application (SaaS, e-commerce, dashboard, content, hybrid)
- Expected traffic level (low / medium / high)
- Data volatility (static / dynamic / real-time)
- Critical user flows
- Performance-sensitive areas
- Security-sensitive areas

────────────────────────────────────
STEP 2 — FRONTEND TECHNICAL DECISIONS (Next.js)
────────────────────────────────────
Decide and justify:
- Rendering strategy (SSR, SSG, ISR, CSR, hybrid)
- Routing strategy (App Router vs Pages Router)
- Data fetching (Server Actions, fetch, React Query, SWR)
- State management (local, context, store, server state)
- Component architecture (atomic, feature-based, domain-driven)
- Performance optimizations (memoization, streaming, caching)
- SEO strategy (meta handling, structured data)

Explicitly state:
- What to USE
- What to AVOID
- WHY (based on the report)

────────────────────────────────────
STEP 3 — BACKEND TECHNICAL DECISIONS (Laravel)
────────────────────────────────────
Choose and justify:
- Auth system (Sanctum, JWT, session-based)
- API architecture (REST, hybrid REST + actions)
- Controller responsibilities
- Service layer necessity
- Use of Form Requests
- Resource transformers
- Queue usage (when & why)
- Event-driven logic (if needed)

Reject overengineering where unnecessary.

────────────────────────────────────
STEP 4 — DATABASE & DATA FLOW DECISIONS
────────────────────────────────────
Analyze the proposed schema and decide:
- Normalization vs denormalization
- Index strategy
- Pivot tables vs JSON fields
- Soft deletes vs hard deletes
- Read/write separation necessity
- Caching layers (DB, Redis, HTTP)

Predict future scaling issues and preemptively solve them.

────────────────────────────────────
STEP 5 — API CONTRACT OPTIMIZATION
────────────────────────────────────
Improve the API design by:
- Reducing round trips
- Avoiding overfetching
- Grouping endpoints logically
- Versioning strategy
- Error normalization
- Pagination & filtering standards

────────────────────────────────────
STEP 6 — SECURITY & STABILITY STRATEGY
────────────────────────────────────
Decide:
- Auth guard strategy
- Token lifecycle
- Rate limiting rules
- Input validation depth
- File upload protections
- Environment separation
- Secrets management

Base decisions on real attack surfaces inferred from the report.

────────────────────────────────────
STEP 7 — TECHNOLOGY TRADEOFF MATRIX
────────────────────────────────────
Create a decision table:
- Chosen technique
- Alternative rejected
- Reason for rejection
- Risk level
- Long-term impact

This step is mandatory.

────────────────────────────────────
STEP 8 — FINAL TECHNICAL VERDICT
────────────────────────────────────
Deliver a clear verdict:
- Is the architecture solid or fragile?
- What MUST be changed?
- What is safe to keep?
- What will break first if traffic grows?
- What is the single most important improvement?

────────────────────────────────────
OUTPUT FORMAT (MANDATORY)
────────────────────────────────────
Return a Markdown (.md) document with:

# Predictive Technical Decision Report
## Project Context Interpretation
## Frontend Decisions (Next.js)
## Backend Decisions (Laravel)
## Database & Data Flow Strategy
## API Optimization
## Security & Stability
## Technology Tradeoffs
## Final Technical Verdict

Tone:
- Opinionated
- Experience-driven
- Precise
- No generic explanations
- No beginner content

You think like a CTO reviewing an architecture before launch.`,
    },
    {
      index: '03',
      category: 'Architecture',
      tag: 'Extended · Component-level',
      color: '#1a6fa8',
      tagBg: 'rgba(26,111,168,0.1)',
      tagBorder: 'rgba(26,111,168,0.35)',
      title: 'Deep-Scan Architecture Report',
      subtitle: 'Same as Prompt 01 but scans every component individually, not just pages',
      explanation: `A more thorough version of Prompt 01. It goes deeper into nested components, modals, shared UI primitives, and cards. Used when the initial architecture report missed details hidden inside smaller components rather than at the page level.`,
      axes: [
        { label: 'Step 1 — Deep Frontend Scan',      desc: 'Scan every component individually: modals, cards, filters, shared primitives.' },
        { label: 'Step 2 — UI/UX Analysis',          desc: 'Audit user flows, reusability, accessibility, and missing UX states.' },
        { label: 'Step 3 — Functional Requirements', desc: 'Infer features and role boundaries from fine-grained UI evidence.' },
        { label: 'Step 4 — Data Model Inference',    desc: 'Map each UI element to a backend entity with full field definitions.' },
        { label: 'Step 5 — Database Design',         desc: 'Relational schema with snake_case, indexes, FKs, and pivot tables.' },
        { label: 'Step 6 — Laravel Backend',         desc: 'Full layer: Models, Controllers, Services, Resources, Policies.' },
        { label: 'Step 7 — API Contract Design',     desc: 'All endpoints needed by the frontend, including edge-case error modes.' },
        { label: 'Step 8 — Security & Scalability',  desc: 'Auth, rate limiting, N+1, caching, uploads, environment separation.' },
        { label: 'Step 9 — Final Output',            desc: 'Single structured .md report in architectural tone for the dev team.' },
      ],
      rawPrompt: `You are a Senior Full-Stack Architect AI with 10+ years of experience in:
- Next.js (App Router & Pages Router)
- Laravel (MVC, REST APIs, Sanctum, Queues)
- Database design (MySQL / PostgreSQL)
- UI/UX & product-driven architecture

Your mission is to ANALYZE an existing project where:
- Frontend = Next.js
- Backend = Laravel (separate project, cross-domain / API-based)

────────────────────────────────────
GLOBAL OBJECTIVE
────────────────────────────────────
Analyze all frontend pages and components, then produce a COMPLETE technical report in Markdown (.md) that includes:

1. UI/UX analysis
2. Functional analysis
3. Data model inference
4. Database schema proposal
5. Backend architecture design (Laravel)
6. API contract design
7. Development best practices & risks

DO NOT write code unless explicitly requested.
DO NOT modify the frontend.
You are an ANALYSIS & ARCHITECTURE AI.

────────────────────────────────────
STEP 1 — FRONTEND SCAN
────────────────────────────────────
Scan and understand:

- Pages (routes)
- Layouts
- Components
- Forms
- Modals
- Cards
- Filters
- Dynamic routes
- State usage (props, context, store if any)

For EACH page, identify:
- Purpose of the page
- User actions (CRUD, filters, navigation)
- UI patterns (list, detail, dashboard, wizard, auth, etc.)
- Required data from backend

────────────────────────────────────
STEP 2 — UI / UX ANALYSIS
────────────────────────────────────
Provide an expert UI/UX audit:
- Clarity of user flow
- Consistency of components
- Reusability
- Accessibility issues
- Performance risks (overfetching, rerenders)
- Missing UX elements (loading, empty states, errors)

Give recommendations WITHOUT changing the design intent.

────────────────────────────────────
STEP 3 — FUNCTIONAL REQUIREMENTS EXTRACTION
────────────────────────────────────
From the frontend behavior, infer:
- Core features
- Secondary features
- Admin vs user functionality
- Auth / guest access needs
- Permissions & roles (if implied)

────────────────────────────────────
STEP 4 — DATA MODEL INFERENCE
────────────────────────────────────
Infer all required entities based on frontend usage.

For EACH entity, define:
- Entity name
- Purpose
- Attributes (fields)
- Field types
- Nullable or required
- Relationships (1-1, 1-N, N-N)

Example format:
- User
- Product
- Order
- Category
- Review
(Only include entities actually needed)

────────────────────────────────────
STEP 5 — DATABASE DESIGN
────────────────────────────────────
Propose a clean relational database structure:

For EACH table:
- Table name
- Columns
- Data types
- Indexes
- Foreign keys
- Pivot tables if needed

Follow best practices:
- snake_case tables
- singular models / plural tables
- timestamps
- soft deletes when relevant

────────────────────────────────────
STEP 6 — LARAVEL BACKEND ARCHITECTURE
────────────────────────────────────
Design the backend structure:

- Models
- Controllers (API-first)
- Services (business logic)
- Requests (validation)
- Resources (API response shaping)
- Policies (authorization)
- Middleware
- Jobs / Queues (if relevant)

Explain WHY each layer is needed.

────────────────────────────────────
STEP 7 — API CONTRACT DESIGN
────────────────────────────────────
For each frontend need, define:
- Endpoint
- HTTP method
- Request payload
- Response structure
- Auth required (yes/no)
- Error cases

Example:
GET /api/products
POST /api/orders
PUT /api/profile

────────────────────────────────────
STEP 8 — SECURITY & SCALABILITY NOTES
────────────────────────────────────
Include:
- Auth strategy (Sanctum / JWT)
- Rate limiting
- Validation risks
- N+1 query risks
- Caching opportunities
- File upload handling
- Environment separation

────────────────────────────────────
STEP 9 — FINAL OUTPUT FORMAT
────────────────────────────────────
Output MUST be a single well-structured Markdown (.md) document with:

# Project Architecture Report
## Frontend Analysis
## UI/UX Audit
## Functional Requirements
## Data Models
## Database Schema
## Backend Architecture (Laravel)
## API Design
## Security & Scalability
## Final Recommendations

Tone:
- Professional
- Architectural
- Experience-based
- Clear and decisive

You are not a tutor.
You are a lead architect delivering a technical report to a dev team.`,
    },
    {
      index: '04',
      category: 'Optimization',
      tag: 'Constrained · Production',
      color: '#8b5e34',
      tagBg: 'rgba(139,94,52,0.1)',
      tagBorder: 'rgba(139,94,52,0.4)',
      title: 'Final Technical Decisions (Constrained)',
      subtitle: 'Finalize the architecture with fixed project constraints applied',
      explanation: `The last prompt in the chain. It takes the architecture report and applies hard constraints specific to this project (no user auth, no user table, wishlist in cookies only). The AI validates what stays, removes overengineering, and produces a shipping-ready decision document.`,
      constraints: [
        'No user authentication — admin only',
        'Wishlist stored in browser cookies only (30-day TTL)',
        'Frontend: Next.js · Backend: Laravel REST API',
        'No user accounts, sessions, or user tables in DB',
      ],
      axes: [
        { label: 'Step 1 — Architecture Validation', desc: 'Find overengineering, unnecessary tables, wrong responsibility boundaries.' },
        { label: 'Step 2 — Tech Stack Decisions',    desc: 'Finalize rendering, state, API pattern, admin auth, controller structure, DB entities.' },
        { label: 'Step 3 — Wishlist Cookie Design',  desc: 'Cookie name, data structure (IDs only), 30-day expiry, edge cases.' },
        { label: 'Step 4 — Admin Auth Strategy',     desc: 'Single role, protected routes, middleware on both frontend and backend.' },
        { label: 'Step 5 — API Optimization',        desc: 'Separate public vs. admin endpoints, caching, rate limiting, error format.' },
        { label: 'Step 6 — Production Readiness',    desc: 'Security headers, cookie flags, bottlenecks, what NOT to build.' },
      ],
      rawPrompt: `You are a Principal Full-Stack Architect AI and Prompt Engineering Expert with 10+ years of experience in:
- Large-scale web applications
- Next.js (App Router, SSR, Edge, Middleware)
- Laravel (API-first, Sanctum, Policies)
- Database architecture & performance
- Security, cookies, and session design

You will receive a TECHNICAL ARCHITECTURE REPORT in Markdown (.md).

Your role is NOT to analyze again.
Your role is to PREDICT, DECIDE, and OPTIMIZE the final implementation.

────────────────────────────────────
GLOBAL OBJECTIVE
────────────────────────────────────
Based strictly on the provided .md report, you must:

1. Predict the optimal final system architecture
2. Choose the best technical strategies
3. Validate or correct architectural decisions
4. Eliminate unnecessary complexity
5. Adapt the solution to real-world production constraints

You must think like a senior engineer shipping a real product.

────────────────────────────────────
SYSTEM CONSTRAINTS (MANDATORY)
────────────────────────────────────
- NO user authentication system (no login / register)
- ONLY admin authentication exists
- Wishlist is:
  - Stored in browser cookies
  - Persisted for 30 days
  - Automatically removed after expiration
  - NOT stored in database
- Frontend = Next.js
- Backend = Laravel (API-only)
- Communication = REST API (JSON)

DO NOT suggest user accounts, sessions, or user tables.
DO NOT violate cookie-based wishlist logic.

────────────────────────────────────
STEP 1 — ARCHITECTURE VALIDATION
────────────────────────────────────
Validate the architecture proposed in the report:

- Identify overengineering
- Identify missing layers
- Identify unnecessary tables
- Identify incorrect responsibility boundaries

Clearly state:
- What should stay
- What should be removed
- What should be simplified

────────────────────────────────────
STEP 2 — FINAL TECH STACK DECISIONS
────────────────────────────────────
Decide and justify:

Frontend:
- Rendering strategy (SSR / SSG / ISR / CSR)
- State management (cookies, local state, server state)
- API communication pattern
- Middleware usage (admin-only access)

Backend:
- Auth method for admin (Sanctum / session)
- Controller structure
- Service layer necessity
- Validation strategy
- API versioning

Database:
- Which entities truly require persistence
- What must NOT be stored (wishlist, guest data)
- Indexing & performance rules

────────────────────────────────────
STEP 3 — WISHLIST TECHNICAL DESIGN (CRITICAL)
────────────────────────────────────
Design the wishlist system using cookies ONLY:

- Cookie name strategy
- Data structure (IDs only, no sensitive data)
- Max size considerations
- Expiration strategy (30 days)
- Sync behavior with backend (read-only product validation)
- Edge cases:
  - Product removed
  - Cookie cleared
  - Expired cookie

Explain WHY cookies are the best choice here.

────────────────────────────────────
STEP 4 — ADMIN-ONLY AUTH STRATEGY
────────────────────────────────────
Design a minimal, secure admin system:

- Single admin role
- Auth method
- Protected routes (backend + frontend)
- Middleware usage
- No public auth endpoints

Explain why this is safer and simpler.

────────────────────────────────────
STEP 5 — API OPTIMIZATION
────────────────────────────────────
Refine the API layer:

- Which endpoints are public
- Which endpoints are admin-only
- Caching strategies
- Rate limiting
- Error normalization

DO NOT repeat endpoints unless necessary.

────────────────────────────────────
STEP 6 — PRODUCTION READINESS
────────────────────────────────────
Provide final senior-level decisions on:

- Environment separation
- Security headers
- Cookie security flags
- Performance bottlenecks
- Scalability limits
- What NOT to build (important)

────────────────────────────────────
FINAL OUTPUT FORMAT
────────────────────────────────────
Output a SINGLE Markdown (.md) document with:

# Final Technical Decisions Report
## Architecture Validation
## Chosen Tech Stack & Rationale
## Wishlist Cookie System Design
## Admin Authentication Strategy
## Optimized API Architecture
## Production Readiness Notes
## Final Verdict (What This Project SHOULD Be)

Tone:
- Decisive
- Technical
- Experience-driven
- No teaching, no fluff

You are not documenting possibilities.
You are FINALIZING decisions like a tech lead before development.`,
    },
  ];

  /* ─────────────────────────────────────────────────────────────
     HTML GENERATION
  ───────────────────────────────────────────────────────────── */

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderConstraints(constraints) {
    if (!constraints || constraints.length === 0) return '';
    return `
      <div class="constraints-box">
        <div class="constraints-label">Hard Constraints for this Prompt</div>
        <ul class="constraints-list">
          ${constraints.map(c => `<li>${c}</li>`).join('\n          ')}
        </ul>
      </div>`;
  }

  function renderAxes(axes) {
    return axes.map((a, i) => `
        <div class="axis-row ${i % 2 === 0 ? 'odd' : 'even'}">
          <div class="axis-label">${a.label}</div>
          <div class="axis-desc">${a.desc}</div>
        </div>`).join('');
  }

  function renderCard(p) {
    return `
  <div class="prompt-card" style="--accent:${p.color}; --tag-bg:${p.tagBg}; --tag-border:${p.tagBorder};">
    <div class="card-header">
      <div class="card-number" style="color:${p.color};">Prompt ${p.index}</div>
      <div class="card-tags">
        <span class="cat-tag" style="background:${p.tagBg}; border-color:${p.tagBorder}; color:${p.color};">${p.category}</span>
        <span class="type-tag">${p.tag}</span>
      </div>
    </div>
    <div class="card-title">${p.title}</div>
    <div class="card-subtitle">${p.subtitle}</div>
    <div class="block">
      <div class="block-label">What this prompt does</div>
      <p class="explanation">${p.explanation || p.purpose}</p>
    </div>
    ${renderConstraints(p.constraints)}
    <div class="block">
      <div class="block-label">Steps &amp; Axes covered</div>
      <div class="axes">${renderAxes(p.axes)}</div>
    </div>
    <div class="block">
      <div class="block-label">System Prompt — exact text</div>
      <pre class="raw-prompt">${escapeHtml(p.rawPrompt || '')}</pre>
    </div>
  </div>`;
  }

  const allCards = prompts.map(renderCard).join('\n\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>System Prompts Documentation — Bloom Parfums</title>
<style>
  /* ── Page setup ─────────────────────────────────── */
  @page { size: A4; margin: 20mm 16mm 20mm 16mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 10pt;
    color: #1a1a1a;
    line-height: 1.6;
    background: #fff;
  }

  /* ── Cover ─────────────────────────────────────── */
  .cover {
    background: linear-gradient(140deg, #1a1410 0%, #2c2218 45%, #4a3728 80%, #6b4f38 100%);
    color: #fff;
    padding: 52px 44px 44px;
    border-radius: 8px;
    margin-bottom: 48px;
    page-break-after: always;
  }
  .cover-eyebrow {
    font-size: 8.5pt;
    letter-spacing: 0.4em;
    color: #cda873;
    text-transform: uppercase;
    margin-bottom: 18px;
    font-weight: 600;
  }
  .cover h1 {
    font-size: 28pt;
    font-weight: 900;
    line-height: 1.15;
    margin-bottom: 10px;
    color: #fff;
    border: none;
    padding: 0;
  }
  .cover-tagline {
    font-size: 11pt;
    color: #e0cebc;
    margin-bottom: 28px;
    max-width: 480px;
    line-height: 1.5;
  }
  .cover-divider {
    border: none;
    border-top: 1px solid rgba(205,168,115,0.3);
    margin: 28px 0;
  }
  .cover-description {
    font-size: 10pt;
    color: #c9b8a0;
    max-width: 500px;
    line-height: 1.65;
    margin-bottom: 28px;
  }
  .cover-badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 28px;
  }
  .cover-badge {
    background: rgba(205,168,115,0.15);
    border: 1px solid rgba(205,168,115,0.4);
    color: #f0dfc0;
    font-size: 7.5pt;
    padding: 3px 11px;
    border-radius: 20px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .cover-meta {
    display: flex;
    gap: 36px;
    font-size: 8.5pt;
    color: #a89070;
  }
  .cover-meta-item strong {
    display: block;
    color: #cda873;
    font-size: 7.5pt;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  /* ── Prompt count summary ───────────────────────── */
  .summary-section {
    margin-bottom: 44px;
    padding: 24px 28px;
    background: #fdf8f2;
    border-radius: 6px;
    border: 1px solid #ede3d5;
  }
  .summary-title {
    font-size: 9pt;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #8b6840;
    margin-bottom: 16px;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
  }
  .summary-item {
    text-align: center;
    padding: 12px 8px;
    background: #fff;
    border-radius: 5px;
    border: 1px solid #e8d9c5;
  }
  .summary-num {
    font-size: 18pt;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 4px;
  }
  .summary-label {
    font-size: 7.5pt;
    color: #7a6555;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    line-height: 1.3;
  }

  /* ── Prompt card ────────────────────────────────── */
  .prompt-card {
    border: 1.5px solid #e8d9c5;
    border-radius: 8px;
    margin-bottom: 32px;
    padding: 28px 32px;
    page-break-inside: avoid;
    position: relative;
    overflow: hidden;
  }
  .prompt-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: var(--accent);
    border-radius: 8px 0 0 8px;
  }

  /* Card header */
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .card-number {
    font-size: 8.5pt;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .card-tags {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .cat-tag {
    font-size: 7.5pt;
    font-weight: 700;
    padding: 2px 9px;
    border-radius: 12px;
    border: 1px solid;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .type-tag {
    font-size: 7.5pt;
    color: #9a8573;
    font-weight: 500;
    letter-spacing: 0.03em;
  }

  /* Card content */
  .card-title {
    font-size: 14pt;
    font-weight: 800;
    color: #1e1610;
    margin-bottom: 3px;
    line-height: 1.25;
  }
  .card-subtitle {
    font-size: 9pt;
    color: #7a6555;
    margin-bottom: 18px;
    font-style: italic;
  }

  /* Section blocks */
  .block {
    margin-bottom: 16px;
  }
  .block-label {
    font-size: 7pt;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 8px;
    border-bottom: 1px solid var(--tag-border, #e8d9c5);
    padding-bottom: 4px;
  }
  .explanation {
    font-size: 9.5pt;
    color: #3a3028;
    line-height: 1.68;
  }

  /* Constraints box */
  .constraints-box {
    background: rgba(176,74,26,0.05);
    border: 1px solid rgba(176,74,26,0.2);
    border-radius: 5px;
    padding: 14px 18px;
    margin-bottom: 18px;
  }
  .constraints-label {
    font-size: 7.5pt;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #b04a1a;
    margin-bottom: 8px;
  }
  .constraints-list {
    list-style: none;
    padding: 0;
  }
  .constraints-list li {
    font-size: 9pt;
    color: #5a3020;
    padding: 2px 0 2px 18px;
    position: relative;
  }
  .constraints-list li::before {
    content: '⚠';
    position: absolute;
    left: 0;
    color: #b04a1a;
    font-size: 8pt;
  }

  /* Axes grid */
  .axes {
    display: flex;
    flex-direction: column;
  }
  .axis-row {
    display: grid;
    grid-template-columns: 190px 1fr;
    gap: 14px;
    padding: 8px 10px;
    border-radius: 3px;
    align-items: start;
  }
  .axis-row.odd  { background: #fdf8f2; }
  .axis-row.even { background: #fff; }
  .axis-label {
    font-size: 8pt;
    font-weight: 700;
    color: #3a2c1e;
    line-height: 1.4;
  }
  .axis-desc {
    font-size: 8.5pt;
    color: #5a4535;
    line-height: 1.5;
  }

  /* Raw prompt block */
  .raw-prompt {
    background: #1c1814;
    color: #e8d5b8;
    padding: 16px 18px;
    border-radius: 5px;
    font-family: 'Cascadia Code', 'Consolas', 'Courier New', monospace;
    font-size: 7.5pt;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    border-left: 3px solid var(--accent);
    page-break-inside: avoid;
    margin-top: 4px;
  }

  /* ── Workflow chain section ──────────────────────── */
  .workflow-section {
    margin: 40px 0 32px;
    padding: 28px 32px;
    background: linear-gradient(135deg, #fdf8f2, #f5ede0);
    border: 1px solid #e8d9c5;
    border-radius: 8px;
    page-break-inside: avoid;
  }
  .workflow-title {
    font-size: 13pt;
    font-weight: 800;
    color: #2c2218;
    margin-bottom: 6px;
  }
  .workflow-subtitle {
    font-size: 9pt;
    color: #7a6555;
    margin-bottom: 22px;
    font-style: italic;
  }
  .workflow-chain {
    display: flex;
    align-items: center;
    gap: 0;
    flex-wrap: wrap;
  }
  .wf-node {
    text-align: center;
    padding: 10px 14px;
    border-radius: 6px;
    min-width: 88px;
    flex-shrink: 0;
  }
  .wf-node-num {
    font-size: 7pt;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.7;
    margin-bottom: 3px;
  }
  .wf-node-name {
    font-size: 8pt;
    font-weight: 700;
    line-height: 1.3;
  }
  .wf-arrow {
    font-size: 14pt;
    color: #cda873;
    padding: 0 4px;
    font-weight: 300;
    flex-shrink: 0;
  }

  /* ── Footer ─────────────────────────────────────── */
  .doc-footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 2px solid #e8d9c5;
    font-size: 8pt;
    color: #9a8573;
    text-align: center;
  }
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════
     COVER PAGE
═══════════════════════════════════════════════════ -->
<div class="cover">
  <div class="cover-eyebrow">Internal Technical Reference</div>
  <h1>System Prompts<br>Documentation</h1>
  <div class="cover-tagline">
    AI Engineering Prompts used to architect and build<br/>the Bloom Parfums full-stack platform.
  </div>
  <hr class="cover-divider" />
  <div class="cover-description">
    This document catalogs every system prompt that was used during the design and
    architecture phase of this project. For each prompt, it describes its purpose,
    intended use cases, and the axes (steps/sections) it covers — without reproducing
    the raw prompt text. It serves as a reproducible methodology reference for future
    projects of similar scope.
  </div>
  <div class="cover-badges">
    <span class="cover-badge">Next.js</span>
    <span class="cover-badge">Laravel</span>
    <span class="cover-badge">MySQL</span>
    <span class="cover-badge">AI-Assisted Architecture</span>
    <span class="cover-badge">Prompt Engineering</span>
    <span class="cover-badge">5 Prompts</span>
  </div>
  <div class="cover-meta">
    <div class="cover-meta-item">
      <strong>Project</strong>
      Bloom Parfums
    </div>
    <div class="cover-meta-item">
      <strong>Date</strong>
      March 2026
    </div>
    <div class="cover-meta-item">
      <strong>Version</strong>
      1.0 — Final
    </div>
    <div class="cover-meta-item">
      <strong>Prompts Documented</strong>
      5 (00 → 04)
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════
     SUMMARY TABLE
═══════════════════════════════════════════════════ -->
<div class="summary-section">
  <div class="summary-title">Prompt Overview</div>
  <div class="summary-grid">
    <div class="summary-item">
      <div class="summary-num" style="color:#7c5cbf;">00</div>
      <div class="summary-label">UI / UX<br>Redesign</div>
    </div>
    <div class="summary-item">
      <div class="summary-num" style="color:#2a7f62;">01</div>
      <div class="summary-label">Architecture<br>Report</div>
    </div>
    <div class="summary-item">
      <div class="summary-num" style="color:#b04a1a;">02</div>
      <div class="summary-label">Predictive<br>Decisions</div>
    </div>
    <div class="summary-item">
      <div class="summary-num" style="color:#1a6fa8;">03</div>
      <div class="summary-label">Deep-Scan<br>Report</div>
    </div>
    <div class="summary-item">
      <div class="summary-num" style="color:#8b5e34;">04</div>
      <div class="summary-label">Final<br>Constrained</div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════
     WORKFLOW CHAIN
═══════════════════════════════════════════════════ -->
<div class="workflow-section">
  <div class="workflow-title">Prompt Execution Chain</div>
  <div class="workflow-subtitle">Recommended sequence for using the prompts end-to-end on a new project</div>
  <div class="workflow-chain">
    <div class="wf-node" style="background:rgba(124,92,191,0.1); color:#5a3fac; border:1px solid rgba(124,92,191,0.3);">
      <div class="wf-node-num">Prompt 00</div>
      <div class="wf-node-name">UI Redesign</div>
    </div>
    <div class="wf-arrow">›</div>
    <div class="wf-node" style="background:rgba(42,127,98,0.1); color:#1e6a50; border:1px solid rgba(42,127,98,0.3);">
      <div class="wf-node-num">Prompt 01</div>
      <div class="wf-node-name">Architecture Report</div>
    </div>
    <div class="wf-arrow">›</div>
    <div class="wf-node" style="background:rgba(26,111,168,0.1); color:#145a90; border:1px solid rgba(26,111,168,0.3);">
      <div class="wf-node-num">Prompt 03</div>
      <div class="wf-node-name">Deep-Scan Report</div>
    </div>
    <div class="wf-arrow">›</div>
    <div class="wf-node" style="background:rgba(176,74,26,0.1); color:#963d10; border:1px solid rgba(176,74,26,0.3);">
      <div class="wf-node-num">Prompt 02</div>
      <div class="wf-node-name">Predictive Decisions</div>
    </div>
    <div class="wf-arrow">›</div>
    <div class="wf-node" style="background:rgba(139,94,52,0.1); color:#6b4820; border:1px solid rgba(139,94,52,0.35);">
      <div class="wf-node-num">Prompt 04</div>
      <div class="wf-node-name">Final Constrained</div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════
     PROMPT CARDS
═══════════════════════════════════════════════════ -->
${allCards}

<!-- ═══════════════════════════════════════════════════
     FOOTER
═══════════════════════════════════════════════════ -->
<div class="doc-footer">
  Bloom Parfums &nbsp;·&nbsp; System Prompts Documentation &nbsp;·&nbsp; March 2026 &nbsp;·&nbsp; Internal Reference — Confidential
</div>

</body>
</html>`;

  /* ─────────────────────────────────────────────────────────────
     PDF EXPORT
  ───────────────────────────────────────────────────────────── */
  console.log('Launching browser…');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size:7pt; color:#9a8573; width:100%; padding: 8px 16mm 0;
                  display:flex; justify-content:space-between; font-family:'Segoe UI',Arial,sans-serif;">
        <span>Bloom Parfums — System Prompts Documentation</span>
        <span style="color:#cda873; font-weight:700; letter-spacing:0.08em;">INTERNAL REFERENCE</span>
      </div>`,
    footerTemplate: `
      <div style="font-size:7pt; color:#9a8573; width:100%; padding: 0 16mm 8px;
                  display:flex; justify-content:space-between; font-family:'Segoe UI',Arial,sans-serif;">
        <span>March 2026</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>`,
    margin: { top: '20mm', bottom: '20mm', left: '16mm', right: '16mm' },
  });

  await browser.close();

  console.log('\n✅  PDF generated successfully:');
  console.log('   ' + pdfPath);
  console.log('   Size: ' + (fs.statSync(pdfPath).size / 1024).toFixed(1) + ' KB');
}

generatePDF().catch(err => {
  console.error('❌  PDF generation failed:', err.message);
  process.exit(1);
});
