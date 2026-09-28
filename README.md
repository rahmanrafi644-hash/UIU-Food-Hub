# UIU Food HUB — Campus Food Platform

> **An intelligent, API-integrated campus food management and ordering platform for United International University (UIU).**

Built with **React, TypeScript, Vite, Supabase (Auth, PostgreSQL Database, Realtime, RLS), and Google Gemini API**, engineered for seamless deployment on **Vercel**.

---

## 📌 Executive Overview

UIU Food HUB is a full-stack, multi-user university food ecosystem connecting:
1. **Students**: Register with verified `@uiu.ac.bd` credentials, discover campus outlets, browse live menus with real-time stock availability, order meals ahead, customize pickup preferences (ASAP vs Class Break Slots), reserve cafeteria tables, track real-time order preparation steps, and direct-message outlet kitchens.
2. **Campus Vendors**: Individual authenticated outlet accounts, monitor incoming branch orders, transition preparation stages (`Placed` ➔ `Preparing` ➔ `Ready` ➔ `Completed`), verify 4-digit pickup PINs, conduct prepared stock intake, monitor seating occupancy, and utilize an **Agentic AI Demand Assistant powered by Google Gemini** for data-driven restocking intelligence.

---

## 🗄️ Backend Architecture & Supabase Integration

The platform is backed by **Supabase** for secure authentication, relational database storage, Row Level Security (RLS), and Realtime synchronization:

```text
                     UIU FOOD HUB (React + TypeScript)
                                  │
         ┌────────────────────────┴────────────────────────┐
         │                                                 │
   STUDENT AUTH                                      VENDOR AUTH
   (*.uiu.ac.bd only)                            (Any valid email + branch)
         │                                                 │
         └────────────────────────┬────────────────────────┘
                                  ▼
                        SUPABASE AUTHENTICATION
                   (Email Verification, Sessions, JWT)
                                  │
                                  ▼
                         SUPABASE POSTGRESQL
                   (Row Level Security Policies Enforced)
       ┌──────────────────┬─────────────────┬─────────────────┐
       │                  │                 │                 │
    PROFILES           ORDERS          INVENTORY        BOOKINGS
 (id, role, UIU)    (ORD-XXXX)        (Real Stock)     (TB-XXX)
       │                  │                 │                 │
       └──────────────────┼─────────────────┴─────────────────┘
                          │
                          ▼
             SUPABASE REALTIME SUBSCRIPTIONS
       (Order Status updates stream live to student UI)
                          │
                          ▼
              VERCEL SERVERLESS FUNCTION
                (/api/analyze-demand)
                          │
                          ▼
                  GOOGLE GEMINI API
               (gemini-2.0-flash model)
```

---

## 🛡️ Database Structure & Tables

Run the SQL migration script located in [`supabase/schema.sql`](supabase/schema.sql) in your **Supabase Dashboard > SQL Editor**.

1. **`profiles`**: Linked to `auth.users(id)` with `role` (`student` or `vendor`), `full_name`, `email`, `phone`, `student_id`, `vendor_outlet_id`.
   * Enforces database-level constraint: Students MUST have an email ending with `@uiu.ac.bd`.
2. **`vendors`**: Relates authenticated vendor users to their assigned campus outlets.
3. **`inventory`**: Persistent database-backed stock levels across all campus outlets.
4. **`orders`**: Real persistent orders with unique order numbers (e.g. `ORD-1045`), pickup PINs, time preference windows, and status tracking.
5. **`order_items`**: Line items linked to parent orders with quantities and prices.
6. **`table_bookings`**: Cafeteria table reservations with conflict prevention.
7. **`customer_reports`**: Student issue reports submitted to outlet managers.
8. **`chat_messages`**: Direct two-way messaging between students and kitchen counters.

---

## 🔒 Row Level Security (RLS) & Route Protection

The database enforces security at the PostgreSQL level:
* **Students**: Can view and create only their own profile, orders, order items, and bookings. Cannot see other students' orders.
* **Vendors**: Can view and update only orders, inventory, and bookings belonging to their assigned outlet. Cannot view or modify unrelated outlets.
* **Frontend Route Protection**:
  * `/student/*` & main pages: Protected by `<RequireStudent>`, unauthenticated users redirect to `/login`, vendors redirect to `/vendor`.
  * `/vendor/*`: Protected by `<RequireVendor>`, unauthenticated users redirect to `/login`, students redirect to `/`.

---

## 🎓 Registration & Email Verification Rules

### 1. Student Registration
* **Fields**: Full Name, UIU Institutional Email, Phone Number, Student ID, Password, Confirm Password.
* **Email Restriction**: Must end with `.uiu.ac.bd` across all departments:
  - BBA: `mrahman2330209@bba.uiu.ac.bd`
  - CSE: `studentname@cse.uiu.ac.bd`
  - EEE: `studentname@eee.uiu.ac.bd`
  - CE / Eco / Other departments: `studentname@department.uiu.ac.bd`
  - Root: `studentname@uiu.ac.bd`
* If a student enters `test@gmail.com` or any non-UIU domain:
  > *"Students must register using a valid UIU institutional email address (e.g. mrahman2330209@bba.uiu.ac.bd, student@cse.uiu.ac.bd)."*
* Account requires 6-digit OTP verification before first login.

### 2. Vendor Registration & Free Portal Access
* **Fields**: Vendor/Owner Name, Outlet Selection (`Khan's Kitchen`, `Olympia`, `CP`, `Brew`, `Toua's Kitchen`), Email, Phone Number, Password, Confirm Password.
* **Open Access**: Faculty and evaluators can enter any outlet dashboard with 1-click open access without registration.
* **Email Rule**: Vendors can use general email addresses (e.g. `khanskitchen@gmail.com`).
* 6-digit verification code screen with resend functionality.

---

## 🔑 Demo & Presentation Accounts

For offline demonstration and faculty review, demo credentials are built-in:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Student (BBA)** | `demo.student@bba.uiu.ac.bd` | `demo123` | Student UI, order history, table bookings |
| **Student (CSE)** | `demo.student@cse.uiu.ac.bd` | `demo123` | Student UI, order history, table bookings |
| **Vendor** | `vendor@uiu.ac.bd` (or direct 1-click) | `demo123` | Khan's Kitchen (or selectable branch) |

---

## 🏛️ Campus Outlets & Menus

1. **Khan's Kitchen**: Fried Rice, Crispy Chicken Fry *(10 initial stock)*, Chinese Vegetables, Dim Khichuri, Chicken Khichuri, Club Sandwich, Shawarma Wrap.
2. **Olympia**: Special Fried Rice, Southern Fried Chicken, Stir Fry Vegetables, Egg Khichuri, Olympia Chicken Khichuri, Grilled Chicken Sub, Lebanese Shawarma.
3. **CP**: Five Star Crispy Chicken, Spicy Crispy Chicken, Smoked Chicken Frank Sausage, Spicy Meatballs.
4. **Brew**: Hot Americano, Frothy Cappuccino, Classic Latte, Chocolate Mocha, Special Cold Coffee, Iced Caramel Latte.
5. **Toua's Kitchen**: Mango Juice, Squeezed Orange Juice, Hydrating Watermelon Juice, Pineapple Juice, Iced Fresh Lemonade.

### Live Stock Status
* `0 units`: **Sold Out** (Red badge • Disabled)
* `1–8 units`: **Low Stock** (Amber badge • Alert triggered)
* `9+ units`: **Available** (Green badge • Optimal)

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the project root:

```env
# 1. Supabase Backend (Auth, Database, Realtime)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# 2. Google Gemini API (AI Demand Assistant)
GEMINI_API_KEY=your-gemini-api-key
```

---

## 🚀 Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Vite Dev Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/)

3. **Production Build**:
   ```bash
   npm run build
   ```

---

## ☁️ Vercel Deployment

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Under **Project Settings > Environment Variables**, add:
   * `VITE_SUPABASE_URL`: Your Supabase Project URL
   * `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Public Key
   * `GEMINI_API_KEY`: Your Google AI Studio API Key
4. Deploy! The serverless function `/api/analyze-demand` will automatically configure for Gemini 2.0 Flash.

---

## 📋 Faculty Evaluation Demonstration Scenario

```text
TEST A: STUDENT FLOW
1. Go to http://localhost:5173/login
2. Click [Register] tab > Student
3. Enter Name: Test Student, Email: teststudent@uiu.ac.bd, Phone: 01700000000, Pass: Demo@12345
4. Notice UI validates @uiu.ac.bd domain strictly.
5. Verify email / Sign in.
6. Browse Khan's Kitchen > Add 2x Chicken Fry (Stock drops from 10 to 8 units).
7. Checkout > Select pickup preference (+30m or ASAP) > Confirm.
8. Unique Order #ORD-XXXX generated with 4-digit pickup PIN.
9. Check [My Orders] > Only test student's orders appear.

TEST B: VENDOR FLOW
1. Sign in as Vendor (Khan's Kitchen).
2. Open Vendor Dashboard > Order #ORD-XXXX appears.
3. Advance status: Placed -> Preparing -> Ready.
4. Student's tracking view updates immediately via Realtime.
5. Stock alerts show Chicken Fry (8 units, Low Stock).

TEST C: AI DEMAND ASSISTANT
1. In Vendor portal, go to [AI Demand] tab.
2. Click [Analyze Demand with AI].
3. Gemini 2.0 Flash detects High Shortage Risk and recommends +20 portions refill.
4. Click [Add Recommended Stock (+20)] > Stock updates to 28 units (Available).
```
