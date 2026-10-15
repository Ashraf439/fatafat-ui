# Fatafat — Customer app

React 19 + Vite + Tailwind 4 + shadcn/ui (JSX). Talks to the Fatafat Spring Boot backend with cookie sessions.

## Run

```bash
npm install
cp .env.example .env      # set VITE_API_BASE_URL if the backend isn't on localhost:8080
npm run dev               # http://localhost:5174  (port is pinned: the backend CORS allow-list expects it)
```

Other scripts: `npm run build`, `npm run lint`, `npm run preview`.

## Structure

```
src/
  api/          one module per backend area (auth, restaurants, addresses, orders) + query-key factory
  lib/          http client (cookies, single-flight token refresh, ApiError), formatting, validators, images
  hooks/        useForm, useDebouncedValue
  components/   ui/ (shadcn primitives), layout/, and small shared pieces
  features/     auth, restaurants, cart, checkout, addresses, orders — each owns its queries + components
  pages/        route components (lazy-loaded from router.jsx)
```

Conventions

- **Server state** lives in TanStack Query (caching, pagination, polling). **Client state** is only auth (derived from `/api/auth/me`) and the cart (`localStorage`).
- **Online payments (Razorpay).** Choosing "Pay online" creates the order as `PENDING_PAYMENT`, then opens Razorpay's checkout on the order page (`/orders/:id?pay=1`). The client only forwards Razorpay's `order_id`, `payment_id` and `signature` to the backend, which verifies them; the restaurant never sees the order until that succeeds. A cancelled or failed payment can be retried from the same order page. The checkout script is loaded on demand from `checkout.razorpay.com`, and the public key id comes from the backend, so this app needs no Razorpay env var.
- **Money is never computed on the client.** Checkout shows the server's `/api/customer/orders/quote`; the order is re-priced on placement.
- Add a shadcn component: `npx shadcn@latest add <name>` (`components.json` is already configured, JS mode).
- Add a page: create `src/pages/XPage.jsx` (default export) and one line in `src/router.jsx`.

## Backend requirements

Needs the customer backend changes (orders, addresses, paginated restaurant search) and
`cors.allowed-origins` including `http://localhost:5174`.