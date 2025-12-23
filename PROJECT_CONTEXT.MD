# 🏋️‍♂️ Project: Fitness Platform (Hybrid Subscription & E-commerce)

## 1. Project Overview
We are building a high-end web application for fitness.
**Concept:** A hybrid platform combining "Netflix-style" subscription access with a digital store for one-time purchases (e.g., specific workout packs).
**Target Audience:** Russian market (requires local payment providers and compliance).

**Design Philosophy:**
- **Visuals:** Source code (HTML/Tailwind) provided by "Aura.build". Style: Dark mode, neon accents, glassmorphism, high-end animation.
- **Workflow:** Refactor raw Aura HTML into interactive React/Next.js components. Maintain exact visual fidelity.

## 2. User Roles & Access Tiers
The system must distinguish between these user states:
1.  **Guest:** Unregistered. Can view Landing Page, Pricing, Public Previews.
2.  **Registered (Free):** Logged in. Has access to the "Free Materials" section.
3.  **Subscriber (3 Tiers):**
    -   *Tier 1 (Basic):* Access to the core workout library.
    -   *Tier 2 (Pro):* Core library + Advanced techniques section.
    -   *Tier 3 (Elite):* Full access + Priority support/Personal features.
4.  **One-Time Buyer:** User who purchased a specific "Digital Pack" (e.g., "30-Day Abs"). They own this content forever, regardless of subscription status.

## 3. Core User Flows

### A. Authentication
- **Methods:** Phone (SMS) or Socials (Telegram, VK, Yandex, Gmail, Apple-id, e-mail).
- **Tech:** Supabase Auth.
- **Onboarding:** Create a `profile` record upon signup, default to "Free" tier.

### B. Commercial Model (Russia-focused)
**Provider:** CloudPayments or T-Pay (T-Kassa).
**Requirements:** Support for MIR cards, 54-FZ (receipts), and recurring payments.

**Flow 1: Subscriptions (Recurring)**
- User selects Tier (1, 2, or 3).
- System initializes a recurring payment.
- On success: Save payment token (RebillId), set `subscription_status` = 'active', set `expires_at`.
- **Cancellation:** User must be able to cancel the subscription **inside the App dashboard**. The backend will call the Provider API to stop future charges.

**Flow 2: One-Time Purchases**
- User selects a specific Pack.
- Standard checkout flow.
- On success: Add `product_id` to the user's `purchases` table.

### C. Content Delivery
- **Hosting:** Video content is hosted on **Kinescope**. Use their iframe/player API.
- **Access Logic (The Gatekeeper):**
    - Show video IF:
        - (`Workout.is_free` == true AND user is logged in)
        - OR (`User.subscription_tier` >= `Workout.required_tier` AND subscription is active)
        - OR (`User.purchases` contains `Workout.linked_product_id`)
    - Else: Show "Locked" overlay with CTA to Subscribe or Buy.

### D. Gamification (Flexible)
- **Goal:** Engagement. Structure must be modular to allow future changes.
- **Current Mechanics:** Track "Workouts Completed".
- **Data:** Store stats in a flexible JSONB column or separate table to allow adding "Streaks", "Badges", or "XP" later without schema migration.
- **UI:** Display progress in the Dashboard (data fetched from Supabase).

## 4. Data Structure (Supabase Draft)

### `profiles`
- `id`: UUID (FK to auth.users)
- `email`: Text
- `role`: Text ('user', 'admin')
- `subscription_status`: Text ('active', 'inactive', 'canceled')
- `subscription_tier`: Integer (0=Free, 1=Basic, 2=Pro, 3=Elite)
- `subscription_expires_at`: Timestamp
- `payment_method_info`: JSON (e.g., "Visa *1234")
- `stats`: JSONB (Flexible storage for gamification data)

### `products`
- `id`: UUID
- `type`: Text ('subscription_tier', 'one_time_pack')
- `name`: Text
- `price`: Integer
- `tier_level`: Integer (nullable, used if type is subscription)

### `user_purchases`
- `id`: UUID
- `user_id`: UUID
- `product_id`: UUID
- `created_at`: Timestamp

### `workouts`
- `id`: UUID
- `title`: Text
- `video_kinescope_id`: Text
- `is_free`: Boolean (default: false)
- `required_tier`: Integer (1, 2, or 3)
- `linked_product_id`: UUID (nullable, for one-time packs)

## 5. Tech Constraints
- **Framework:** Next.js 15 (App Router).
- **Styling:** Tailwind CSS.
- **Language:** TypeScript.
- **Database:** Supabase.