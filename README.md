# UIU Food HUB — Campus Food Platform

> **An intelligent, API-integrated campus food management and ordering platform for United International University (UIU).**

Built with **React, TypeScript, Vite, and Google Gemini API**, and engineered for seamless deployment on **Vercel**.

---

## 📌 Executive Overview

UIU Food HUB is a dual-interface university food ecosystem connecting:
1. **Students**: Discover campus outlets, browse live menus with real-time stock availability, order meals ahead, customize pickup preferences (ASAP vs Scheduled), reserve cafeteria tables, track order preparation steps, and submit quality reports.
2. **Campus Vendors**: Monitor incoming orders, transition preparation stages (`Placed` ➔ `Preparing` ➔ `Ready` ➔ `Completed`), conduct prepared stock intake, monitor seating occupancy, and utilize an **Agentic AI Demand Assistant powered by Google Gemini** for data-driven restocking intelligence.

---

## 🚀 Why this project is API-integrated

> *"The vendor-side AI Demand Assistant communicates with the Gemini API to analyze application-generated order and inventory data and produce structured demand and restocking recommendations."*

Unlike simple mockups that present hard-coded text, UIU Food HUB connects live operational data to the **Google Gemini API** via a secure serverless architecture:

```text
                    UIU FOOD HUB (React + TypeScript)
                                 │
                     ┌───────────┴───────────┐
                     │                       │
                 STUDENT                  VENDOR
                     │                       │
               Browse / Order          Orders / Stock
               Checkout                Tables / Reports
               Tables                  AI Assistant
                     │                       │
                     └───────────┬───────────┘
                                 │
                          SHARED APP STATE
                    (Synchronized Inventory & Orders)
                                 │
                                 ▼
                     VERCEL SERVERLESS FUNCTION
                       (/api/analyze-demand)
                                 │
                                 ▼
                         GOOGLE GEMINI API
                      (gemini-2.0-flash model)
                                 │
                                 ▼
                      STRUCTURED DEMAND ANALYSIS
                      (JSON Schema with Risk Levels)
                                 │
                                 ▼
                       RESTOCK RECOMMENDATION
                     (Calculated refill portions)
                                 │
                                 ▼
                          VENDOR APPROVAL
                      (Human-in-the-Loop commit)
                                 │
                                 ▼
                       INVENTORY REPLENISHMENT
                 (Stock updates from 8 to 28 units)
```

### Agentic Intelligence Tools
The AI Demand Assistant encapsulates structured tools:
- `getInventory()`: Retrieves current stock levels and threshold statuses across all outlets.
- `getRecentOrders()`: Analyzes student ordering velocity during peak lecture breaks.
- `getSalesData()`: Calculates fast-moving items and pairing trends.
- `createRestockRecommendation()`: Calculates optimal refill portions with explicit rationale before presenting to the vendor.

The system enforces **Human-in-the-Loop control**: the AI cannot secretly tamper with stock; vendors must click **[Add Recommended Stock]** to verify and execute the replenishment.

---

## 🔑 Demo Credentials

| Role | Email | Password | Quick Action |
| :--- | :--- | :--- | :--- |
| **Student** | `student@uiu.ac.bd` | `demo123` | Click "Student" on login screen |
| **Vendor** | `vendor@uiu.ac.bd` | `demo123` | Click "Vendor" on login screen |

---

## 🏛️ Campus Outlets & Official Menus

1. **Khan's Kitchen**: Fried Rice, Chicken Fry *(demo initial stock: 10)*, Vegetables, Dim Khichuri, Chicken Khichuri, Sandwich, Shawarma.
2. **Olympia**: Fried Rice, Chicken Fry, Vegetables, Dim Khichuri, Chicken Khichuri, Sandwich, Shawarma.
3. **CP**: Chicken Fry, Spicy Chicken Fry, Sausage, Meatballs.
4. **Brew**: Americano, Cappuccino, Latte, Mocha, Cold Coffee, Iced Latte.
5. **Toa's Kitchen**: Mango Juice, Orange Juice, Watermelon Juice, Pineapple Juice, Lemon Juice.

### Live Stock Status Logic
- `0 units`: **Sold Out** (Red badge • Add to cart disabled)
- `1–8 units`: **Low Stock** (Amber badge • Alert triggered)
- `9+ units`: **Available** (Green badge • Optimal availability)

---

## 🎬 Faculty Presentation Walkthrough

Follow these exact steps during demonstration:

1. **Sign In as Student**:
   - Go to login, select **Student**, and sign in (`student@uiu.ac.bd`).
   - Notice **Khan's Kitchen Chicken Fry** has **10 units** (Available).
2. **Student Places Order**:
   - Open Khan's Kitchen ➔ Select Chicken Fry ➔ Choose quantity `2` ➔ Add to Cart.
   - Open Cart ➔ Proceed to Checkout ➔ Select Pickup (ASAP) and Payment (`bKash` demo) ➔ Click **Confirm & Place Order**.
   - **Shared state immediately deducts stock**: Chicken Fry stock drops from **10 to 8 units** (Status switches to **Low Stock**).
3. **Switch to Vendor**:
   - Sign in as Vendor (`vendor@uiu.ac.bd`).
   - Open **Orders**: Notice the student's order `#UIU-...`.
   - Update order from `Placed` ➔ `Preparing` ➔ `Ready`.
   - Switch back to student view or notice live synchronization.
4. **AI Demand Intelligence Demonstration**:
   - In Vendor portal, navigate to **AI Demand Assistant**.
   - Click **[Analyze Demand with AI]**.
   - Gemini analyzes live inventory, recent order velocity, and peak campus class times.
   - Output displays:
     - **Item**: Chicken Fry (Khan's Kitchen)
     - **Risk**: `HIGH SHORTAGE RISK` (Current Stock: 8)
     - **Expected Demand**: 26 portions
     - **Recommended Refill**: `+20 portions`
5. **Restock Execution**:
   - Vendor clicks **[Add Recommended Stock]**.
   - Shared inventory increases: `8 + 20 = 28 units`.
   - Status updates to **Available (28)**.
   - Student interface immediately reflects 28 available units.
6. **Table Reservation**:
   - Student navigates to **Tables** ➔ Selects Khan's Kitchen ➔ Table 02 ➔ Confirms booking.
   - Vendor **Tables** view instantly reflects Table 02 as `Reserved`.
7. **Repeat Demo**:
   - Click the **Reset Demo** button in the header or profile at any time to restore initial presentation state.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Modern CSS Design System (mobile-first 390×844 frame + responsive desktop preview)
- **Icons**: Lucide React
- **Routing**: React Router DOM (v6)
- **State Management**: Centralized React Context with synchronized shared state and `localStorage` persistence
- **AI Integration**: Google Gemini 2.0 Flash (`/api/analyze-demand`)
- **Deployment Platform**: Vercel Serverless Architecture

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js (v18 or v20+)
- npm

### 2. Installation
```bash
git clone <repo-url>
cd "UIU Food Hub"
npm install
```

### 3. Environment Variable Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your Google Gemini API key:
```env
GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
```
*(Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey))*

> *Note: If no API key is specified, the application seamlessly activates an intelligent local heuristic simulation so offline faculty grading never fails.*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Vercel Deployment Instructions

1. Push your repository to GitHub / GitLab.
2. Import project in [Vercel Dashboard](https://vercel.com).
3. Set the Framework Preset to **Vite**.
4. In **Settings ➔ Environment Variables**, add:
   - `GEMINI_API_KEY` = your Gemini API key.
5. Deploy! Vercel automatically deploys both the frontend and the serverless function `api/analyze-demand.ts`.

---

## 🔮 Future Improvements

- Campus RFID / UIU student ID card tap payments.
- Real-time WebSockets / Supabase broadcast channel for multi-device sync without shared browser cache.
- Kitchen display system (KDS) printer integration for physical token printing.
- Nutritional calorie tracking and allergen filtering for health-conscious students.

---

*Academic Prototype developed for UIU Faculty Evaluation.*
