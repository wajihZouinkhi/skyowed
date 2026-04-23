# Design System

## Brand personality
- **Honest friend, not a corporation.** "We tell you what the airline doesn't want you to know."
- Slightly cheeky. Uses plain language. No legal jargon on the surface.

## Color palette
| Role | Hex | Usage |
|---|---|---|
| Primary (Trust Blue) | `#1E3A8A` | Headers, logo, primary buttons |
| Accent (Action Orange) | `#F97316` | CTAs, "Claim Now" button |
| Success Green | `#10B981` | "You're eligible!" badge |
| Warning Yellow | `#F59E0B` | "May be contested" warnings |
| Error Red | `#EF4444` | Not eligible |
| Neutral background | `#F9FAFB` | Page background |
| Neutral text | `#111827` | Body text |
| Muted | `#6B7280` | Secondary text |

## Typography
- Headings: **Inter**, 700 weight (free, modern, legible)
- Body: **Inter**, 400 weight
- Numbers (compensation amount): **Inter**, 800 weight, large

## Tone of voice examples
- ❌ "Our proprietary algorithm determined you are entitled to pecuniary reimbursement."
- ✅ "Lufthansa owes you €600. Here's how to get it."

## Key screens (wireframe descriptions)

### 1. LANDING / HOME
```
+--------------------------------------------------+
|  [Logo]                              [Login]     |
+--------------------------------------------------+
|                                                  |
|   Was your flight delayed or cancelled?          |
|   You could be owed up to €600.                  |
|   Keep 100% — we're a tool, not a lawyer.        |
|                                                  |
|   [  Flight Number: ______  ]                    |
|   [  Date:          ______  ]                    |
|   [      CHECK IF I'M ELIGIBLE →     ]           |
|                                                  |
|   ⭐⭐⭐⭐⭐  "Got €400 back from Ryanair in 3 weeks"|
+--------------------------------------------------+
|  How it works:                                   |
|  1. Enter flight  2. See amount  3. Send letter  |
+--------------------------------------------------+
```

### 2. ELIGIBILITY FORM (Step 2)
```
+------------------------------------------------+
|  ← Back                                        |
|                                                |
|  We found your flight:                         |
|  LH 441 · Frankfurt → Miami · 15 Jul 2024      |
|  Distance: 7,627 km  →  Tier: €600 flights     |
|                                                |
|  What happened?                                |
|  ( ) Delayed                                   |
|  ( ) Cancelled                                 |
|  ( ) Denied boarding                           |
|                                                |
|  How late did you arrive at the final          |
|  destination?                                  |
|  [ 5 ] hours  [ 20 ] minutes                   |
|                                                |
|  [      CHECK NOW →     ]                      |
+------------------------------------------------+
```

### 3. RESULT SCREEN (the WOW moment)
```
+------------------------------------------------+
|                                                |
|     ✈️  Lufthansa owes you                     |
|                                                |
|        €  6  0  0                              |
|                                                |
|     Under EU Regulation 261/2004, Article 7    |
|     (flight > 3,500 km, delay > 3 hours)       |
|                                                |
|   [ GENERATE MY CLAIM LETTER (€6.99) ]         |
|                                                |
|   Or [continue with free summary]              |
|                                                |
|   ⚠️ Note: If Lufthansa claims extraordinary   |
|     circumstances (weather/strike), they may   |
|     refuse. Courts often side with passengers. |
+------------------------------------------------+
```

### 4. PRO UNLOCK / PAYMENT
Simple Stripe / Apple-Google IAP modal. One-tap purchase.

### 5. LETTER PREVIEW + DOWNLOAD
Shows rendered PDF in-app, big "Download" + big "Copy airline email" button, with step-by-step: "1. Download. 2. Email it to customerrelations@lufthansa.com. 3. Track reply in 30 days."

### 6. CLAIM TRACKER (Pro feature)
Simple list: Flight | Status | Next action | Days since sent

## Design tools
- **Figma** (free) for screen design
- **Untitled UI** or **shadcn/ui** as free component library
- **Heroicons** (free) for icons
- Logo: use **Looka** or **Canva** (cheap) for v1; upgrade later
