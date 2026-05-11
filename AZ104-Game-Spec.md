# AZ-104 Learning Game — Product Specification

**Version**: 1.0  
**Date**: 2026-05-11  
**Status**: Draft

---

## 1. Overview

### 1.1 Product Summary

A mobile-first, gamified web application designed to help learners prepare for the **Microsoft Azure Administrator (AZ-104)** certification exam. The app combines a curated question bank with AI-generated content to deliver flashcards, multiple-choice quizzes, and product identification challenges across progressive difficulty levels.

### 1.2 Goals

- Make AZ-104 exam prep engaging, bite-sized, and habit-forming
- Cover all official AZ-104 exam domains with structured progression
- Use AI to provide unlimited content variety and contextual explanations
- Track learner progress and surface weak areas intelligently

### 1.3 Non-Goals (v1)

- No offline mode
- No social/multiplayer features
- No video content
- No native mobile app (PWA acceptable)

---

## 2. Target Users

| Persona | Description |
|---|---|
| **The Career Switcher** | Moving into cloud/Azure roles, studying part-time |
| **The IT Pro** | Already working with Azure, wants to validate knowledge |
| **The Student** | University or bootcamp learner, exam in 4–8 weeks |

All personas share: **mobile-first usage**, **short study sessions (5–15 min)**, **need for immediate feedback**.

---

## 3. Tech Stack

### 3.1 Frontend

| Layer | Technology | Rationale |
|---|---|---|
| Framework | React 18 + Vite | Fast builds, large ecosystem, easy deployment |
| Styling | Tailwind CSS | Mobile-first utilities, consistent design system |
| Components | shadcn/ui | Accessible, unstyled base, full control |
| Routing | React Router v6 | SPA navigation between game modes |
| State | Zustand | Lightweight global state (session, progress) |
| Animations | Framer Motion | Flashcard flips, transitions, score reveals |

### 3.2 Backend / API

| Layer | Technology | Rationale |
|---|---|---|
| Database | Supabase (Postgres) | Question bank, user progress, leaderboards |
| Auth | Supabase Auth | Email/magic link or Google OAuth |
| AI Layer | Anthropic Claude API (`claude-sonnet-4-20250514`) | Dynamic question generation, answer explanations |
| Serverless Fns | Vercel Edge Functions | Proxy Claude API calls (hide API key) |
| File Storage | Supabase Storage | Service icons/images for Product ID mode |

### 3.3 Hosting & DevOps

| Concern | Choice |
|---|---|
| Hosting | Vercel (or Azure Static Web Apps) |
| CI/CD | GitHub Actions → auto-deploy on merge to main |
| Environment | `.env` for API keys, Vercel env vars in production |
| Monitoring | Vercel Analytics + Supabase logs |

---

## 4. Information Architecture

```
/                        → Home / Dashboard
/learn                   → Mode selector
/learn/flashcards        → Flashcard session
/learn/quiz              → MCQ quiz session
/learn/product-id        → Product identification challenge
/progress                → Stats, streaks, weak areas
/settings                → Account, preferences
```

---

## 5. Game Structure

### 5.1 Level System (v1 scope: Level 1)

| Level | Name | Unlock Condition |
|---|---|---|
| 1 | **Foundation** | Available immediately |
| 2 | **Practitioner** | Score 70%+ across all Level 1 topics |
| 3 | **Administrator** | Score 80%+ across all Level 2 topics |
| 4 | **Expert** | Complete all timed challenges in Level 3 |

### 5.2 AZ-104 Exam Domains (mapped to topics)

| Domain | Weight | Topics |
|---|---|---|
| Manage Azure Identities & Governance | 20–25% | Entra ID, RBAC, Subscriptions, Policies |
| Implement & Manage Storage | 15–20% | Blob, Files, Lifecycle, SAS tokens |
| Deploy & Manage Azure Compute Resources | 20–25% | VMs, Scale Sets, App Service, Containers |
| Implement & Manage Virtual Networking | 15–20% | VNets, NSGs, Load Balancer, DNS, VPN |
| Monitor & Maintain Azure Resources | 10–15% | Monitor, Alerts, Backup, Log Analytics |

---

## 6. Game Modes

### 6.1 Flashcards

**Purpose**: Build vocabulary and concept recall.

**Flow**:
1. User selects a topic (or "random mix")
2. Card appears showing **Term / Concept** on front
3. User taps to flip → reveals **Definition / Explanation**
4. User self-rates: `Got it ✓` / `Almost` / `Missed ✗`
5. Rating feeds spaced repetition queue
6. Session ends after N cards (user-configurable: 10, 20, 30)

**Card Data Fields**:
```json
{
  "id": "uuid",
  "type": "flashcard",
  "domain": "networking",
  "topic": "NSG",
  "front": "What is a Network Security Group?",
  "back": "A set of security rules that allow or deny inbound/outbound traffic to Azure resources...",
  "difficulty": 1,
  "tags": ["networking", "security", "level-1"],
  "source": "bank | ai-generated"
}
```

**AI Enhancement**:
- If user exhausts the bank for a topic, Claude generates new cards on demand
- Prompt includes domain, topic, difficulty level, and a list of already-seen card IDs to avoid repetition

**UX Notes**:
- Swipe left = Missed, swipe right = Got it (mobile gesture)
- Progress bar across top showing cards remaining
- Flip animation (Y-axis card flip)
- Streak counter visible during session

---

### 6.2 Multiple Choice Quiz (MCQ)

**Purpose**: Simulate exam conditions, test applied knowledge.

**Flow**:
1. User selects topic, difficulty, and question count
2. Optional: enable timer (45 seconds per question, AZ-104 pace)
3. Question displayed with 4 options (A/B/C/D)
4. On answer:
   - **Correct**: Green highlight + brief explanation (1–2 sentences)
   - **Incorrect**: Red highlight on chosen, green on correct + full explanation
5. "Next" → advances to next question
6. End screen: score %, time taken, weak topics flagged

**Question Data Fields**:
```json
{
  "id": "uuid",
  "type": "mcq",
  "domain": "identity",
  "topic": "RBAC",
  "question": "Which built-in RBAC role allows a user to manage all Azure resources but not grant access?",
  "options": {
    "A": "Owner",
    "B": "Contributor",
    "C": "Reader",
    "D": "User Access Administrator"
  },
  "correct": "B",
  "explanation": "Contributor can manage all resources but cannot assign roles. Owner includes role assignment rights.",
  "difficulty": 2,
  "tags": ["identity", "rbac", "level-1"],
  "source": "bank | ai-generated"
}
```

**AI Enhancement**:
- Claude generates new MCQ questions for any topic on demand
- Claude also generates **explanations** for bank questions that lack them
- Post-quiz: user can tap "Explain more" → Claude gives a deeper breakdown

**UX Notes**:
- Timer shown as a shrinking progress ring around question number
- Keyboard shortcuts on desktop: A/B/C/D keys
- Swipe up to skip (costs a "hint token" — future feature)
- Results screen shows domain breakdown chart

---

### 6.3 Product Identification

**Purpose**: Build visual/name recognition of Azure services — critical for real exam scenarios.

**Flow**:
1. A service **name**, **icon**, or **one-line description** is shown
2. User must identify the correct category or use case from 4 options
3. Alternatively: match-the-service card pairs (memory game variant)

**Sub-modes**:

| Sub-mode | Input | Task |
|---|---|---|
| **Name → Category** | Service name (e.g. "Azure Bastion") | Pick the correct category (Networking / Security / Compute / Storage / Identity) |
| **Description → Name** | "Provides secure RDP/SSH access to VMs without public IP" | Pick the correct service name from 4 options |
| **Icon → Name** | Azure service icon image | Name the service |
| **Memory Match** | Grid of face-down cards | Match service name to its description |

**Data Fields**:
```json
{
  "id": "uuid",
  "type": "product-id",
  "service_name": "Azure Bastion",
  "category": "Networking",
  "description": "Provides secure and seamless RDP and SSH access to your VMs directly through the Azure portal without exposing public IPs.",
  "icon_url": "/icons/azure-bastion.svg",
  "common_confusions": ["VPN Gateway", "Azure Firewall"],
  "difficulty": 1
}
```

**UX Notes**:
- Icons sourced from official Azure icon set (SVG)
- "Confused this with X" tracking to surface confusable services
- Memory match uses a grid layout, optimized for portrait mobile

---

## 7. AI Integration

### 7.1 Claude API Usage Patterns

| Trigger | Prompt Type | Output |
|---|---|---|
| Question bank exhausted for a topic | Generation | 5–10 new MCQ or flashcard items (JSON) |
| User answers incorrectly | Explanation | 2–3 sentence contextual explanation |
| User taps "Explain more" | Deep dive | Paragraph explanation with example scenario |
| Weekly review session | Weak area analysis | Summary of struggling topics + recommendations |

### 7.2 Prompt Design Principles

- Always include: domain, topic, difficulty level, exam context ("AZ-104")
- For generation: include list of existing question IDs to avoid duplicates
- For explanations: include the question, all options, and the user's wrong answer
- Temperature: `0.7` for generation, `0.3` for explanations (factual accuracy priority)
- Always request JSON output for generation; plain text for explanations

### 7.3 Serverless Function: `/api/ai`

```
POST /api/ai
Body: { mode: "generate" | "explain" | "deep-dive", payload: {...} }
Response: { content: string | QuestionItem[] }
```

- Rate limited: 20 AI calls per user per day (free tier)
- Cached: identical prompts cached in Supabase for 7 days to reduce API cost

---

## 8. Data Model (Supabase)

### Tables

```sql
-- Question bank
questions (
  id uuid PRIMARY KEY,
  type text,           -- 'flashcard' | 'mcq' | 'product-id'
  domain text,
  topic text,
  difficulty int,      -- 1 (easy) to 3 (hard)
  content jsonb,       -- flexible per type
  source text,         -- 'bank' | 'ai-generated'
  created_at timestamp
)

-- Users (extends Supabase Auth)
profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  display_name text,
  streak_days int DEFAULT 0,
  last_active date,
  level int DEFAULT 1
)

-- User progress per question
user_progress (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  question_id uuid REFERENCES questions,
  times_seen int DEFAULT 0,
  times_correct int DEFAULT 0,
  last_rating text,    -- 'correct' | 'almost' | 'missed'
  next_review date,    -- spaced repetition
  updated_at timestamp
)

-- Quiz sessions
sessions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  mode text,
  topic text,
  score_pct float,
  duration_seconds int,
  completed_at timestamp
)
```

---

## 9. Spaced Repetition Logic

Uses a simplified **SM-2 algorithm**:

| Rating | Next Review |
|---|---|
| Got it ✓ | +3 days (first time), then doubles |
| Almost | +1 day |
| Missed ✗ | Tomorrow |

- Questions due for review surface first in any session
- "Daily Review" mode on home screen shows cards due today

---

## 10. UX & Design

### 10.1 Design Principles

- **Mobile-first**: All layouts designed for 375px width first, scaled up
- **Thumb-friendly**: Primary actions in bottom 60% of screen
- **Dark mode default**: Azure blue + dark background (easy on eyes during study)
- **Progress visible always**: Streak, XP, and session progress always in view

### 10.2 Key Screens

| Screen | Key Elements |
|---|---|
| **Home / Dashboard** | Daily streak, XP bar, "Continue", due-for-review count, quick-start buttons |
| **Mode Selector** | Three large cards (Flashcards / Quiz / Product ID) with topic filter |
| **Flashcard Session** | Full-screen card, flip animation, self-rating buttons, progress bar |
| **Quiz Session** | Question + 4 tappable options, timer ring, explanation panel |
| **Product ID** | Icon/name/description display, 4 category options or match grid |
| **Results Screen** | Score, domain breakdown, XP earned, "Review Missed" CTA |
| **Progress Dashboard** | Domain radar chart, streak calendar, weak topics list |

### 10.3 Mobile Gestures

| Gesture | Action |
|---|---|
| Swipe right | Flashcard: "Got it" |
| Swipe left | Flashcard: "Missed" |
| Tap card | Flip flashcard |
| Tap option | Select MCQ answer |
| Swipe up | Next question (after answering) |

---

## 11. Gamification

| Element | Description |
|---|---|
| **XP Points** | Earned per correct answer, bonus for streaks |
| **Daily Streak** | Days in a row with at least one session |
| **Level Badges** | Foundation → Practitioner → Administrator → Expert |
| **Domain Mastery** | Per-domain progress bar (0–100%) |
| **Perfect Quiz** | Badge for 100% on a timed quiz |
| **Hint Tokens** | Earn tokens to reveal a hint during MCQ (future) |

---

## 12. Question Bank Seed Plan

Initial bank targets **200 questions** across all domains:

| Domain | Flashcards | MCQ | Product ID |
|---|---|---|---|
| Identity & Governance | 15 | 20 | 10 |
| Storage | 10 | 15 | 8 |
| Compute | 15 | 20 | 12 |
| Networking | 15 | 20 | 10 |
| Monitoring | 10 | 15 | 5 |
| **Total** | **65** | **90** | **45** |

Questions sourced from:
- Official Microsoft Learn AZ-104 study guide
- Public exam prep communities (rephrased/original)
- AI-generated (Claude, reviewed before seeding)

---

## 13. Development Phases

### Phase 1 — Foundation (Weeks 1–2)
- [ ] Supabase schema + seed 50 questions
- [ ] React app scaffold with routing
- [ ] Flashcard mode (static, no AI)
- [ ] Basic MCQ mode (static, no timer)
- [ ] Supabase Auth (email login)

### Phase 2 — Core Game (Weeks 3–4)
- [ ] Product ID mode (Name → Category sub-mode)
- [ ] Timer for MCQ
- [ ] Results screen with domain breakdown
- [ ] User progress tracking
- [ ] Streak + XP system

### Phase 3 — AI Layer (Weeks 5–6)
- [ ] Vercel Edge Function for Claude API proxy
- [ ] AI-generated question generation (on bank exhaustion)
- [ ] AI explanation on wrong answers
- [ ] "Explain more" deep dive
- [ ] Response caching in Supabase

### Phase 4 — Polish & Launch (Weeks 7–8)
- [ ] Full question bank (200 questions)
- [ ] Dark mode + design refinement
- [ ] PWA manifest + mobile install prompt
- [ ] Spaced repetition ("Daily Review" mode)
- [ ] Progress dashboard with radar chart
- [ ] Performance audit + Lighthouse score ≥ 90

---

## 14. Success Metrics

| Metric | Target (3 months post-launch) |
|---|---|
| Daily Active Users | 500+ |
| Avg session length | 8–12 minutes |
| D7 retention | 30%+ |
| Quiz completion rate | 75%+ |
| User-reported exam pass rate | Track via optional survey |

---

## 15. Open Questions

1. **Auth required?** Should users be able to play without signing up (guest mode with local storage progress)?
2. **Pricing model?** Free with AI call limits, or paid tier for unlimited AI?
3. **Official Microsoft icons?** Need to verify licensing for Azure icon set usage.
4. **Localization?** English only for v1, or include French/Dutch given Belgian audience?
5. **Accessibility?** Screen reader support priority level?

---

*Spec authored with Claude (Anthropic). Review and iterate before development kickoff.*
