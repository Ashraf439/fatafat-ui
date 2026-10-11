# Fatafat UI

Web frontends for **Fatafat**, a multi-role food-delivery platform. This repo holds three independent React apps that talk to the [Fatafat](https://github.com/Ashraf439/Fatafat) Spring Boot backend.

| App | Folder | For | Dev port |
| --- | --- | --- | --- |
| Customer | [`customer/`](./customer) | Browse restaurants, cart, checkout, orders, addresses | 5174 |
| Restaurant | [`restaurant/`](./restaurant) | Sign up, onboarding and payment, menu upload, staff, orders | 5173 |
| Admin | [`admin/`](./admin) | Review restaurant applications | not pinned (see below) |

## Tech stack

- React 19, Vite, React Router 7
- Tailwind CSS 4 (customer and restaurant also use shadcn/ui on Radix primitives)
- TanStack Query for server state (customer)
- MapLibre / MapTiler for address picking (customer and restaurant)
- Oxlint for linting, React Compiler enabled

## Prerequisites

- Node.js 20 or newer and npm
- The backend running on `http://localhost:8080` (see the backend README for setup)

## Quick start

Each app is installed and run on its own. The backend only allows requests from ports **5173** and **5174**, so run the restaurant and customer apps on those ports.

```bash
# Customer app, http://localhost:5174
cd customer
npm install
cp .env.example .env     # set VITE_API_BASE_URL if the API is not on localhost:8080
npm run dev

# Restaurant app, http://localhost:5173
cd restaurant
npm install
npm run dev
```

Scripts available in every app: `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`.

## Configuration

| App | Variable | Purpose |
| --- | --- | --- |
| customer | `VITE_API_BASE_URL` | Backend base URL (defaults to `http://localhost:8080`) |
| restaurant | `VITE_RAZORPAY_KEY_ID` | Razorpay **key id** for the onboarding-fee checkout. Use a test key locally. Never put the secret here. |

The restaurant and admin apps currently hardcode the API URL (`http://localhost:8080`) in `src/api/client.js`. Change it there until it is moved to an environment variable.

## How authentication works

The backend sets httpOnly, `SameSite=Strict` cookies on login, so the frontends never see or store tokens. Every request must send credentials (`credentials: "include"`). The customer app also retries a request once after a silent `/api/auth/refresh` when it gets a 401.

Because the cookies are `SameSite=Strict`, in production the apps and the API must share the same registrable domain (for example `app.example.com` and `api.example.com`).

## Repository structure

```
customer/     React + Vite + Tailwind + shadcn/ui, TanStack Query
  src/api/        one module per backend area, plus query keys
  src/features/   auth, cart, checkout, addresses, orders, restaurants
  src/pages/      route components
  src/lib/        http client, formatting, validators
restaurant/   owner and staff portal
  src/api/        auth, onboarding, menu, staff, restaurant
  src/pages/      Signup, Login, Onboarding, Dashboard, MenuUpload, StaffManagement, Orders
  src/routes/     protected and role-guarded routes
admin/        minimal admin dashboard
  src/pages/      Login, Dashboard
```

The customer app has its own detailed [README](./customer/README.md).

## Known issues

- **Admin app is out of date with the backend.** It sends a Bearer token and expects tokens in the login response, but the backend authenticates with cookies only and returns no token in the body. Its API client also omits `credentials: "include"`, and its reject call sends `reason` while the backend expects `rejectionReason`. It will not authenticate until the client is updated to match the customer app's `http.js`.
- **Admin dev port is not pinned.** Vite's default (5173) clashes with the restaurant app, and the backend CORS list does not include another port. Add the admin origin to `cors.allowed-origins` and pin a port in `admin/vite.config.js`.
- **Restaurant app has no silent token refresh,** so sessions end when the access token expires.
- `restaurant/.env` is committed. It only contains a public test key id, but env files should be gitignored with an `.env.example` committed instead.

## Contributing

1. Create a branch from `main`.
2. Run `npm run lint` and `npm run build` in the app you changed.
3. Open a pull request describing the change.

## License

No license has been chosen yet.