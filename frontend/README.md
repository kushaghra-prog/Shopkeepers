# Shopkeepers Frontend (Merchant Dashboard)

This app is the **merchant dashboard** — it receives and manages orders placed on the customer storefront.

**Customer storefront** (paired project): `food Delivery App/Bunny-Burger` — branded as **Shopkeepers | Order Online**, same design system and shared API.

## Shared backend

- Base URL: http://localhost:5000
- Used endpoints in this app:
  - GET /api/orders
  - GET /api/orders/:id

## Setup

1. Start backend once (in your backend folder):

   npm run dev

2. Create environment file in this frontend folder:
   - Copy .env.example to .env
   - Keep this value:

     VITE_API_URL=http://localhost:5000

3. Start frontend:

   npm install
   npm run dev

## What this site shows

- All placed orders from website 1
- Item list for a selected order
- Order total and created time
- Refresh button to pull latest orders
