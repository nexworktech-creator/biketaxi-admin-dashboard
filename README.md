# Dispatch — Bike Taxi Admin Dashboard

React + Vite web app for managing the platform: captain approvals, live fleet map, ride logs, riders, coupons, and commission billing. Talks to the backend built earlier over REST.

## Setup

```bash
cd admin-dashboard
cp .env.example .env       # point VITE_API_BASE_URL at your running backend
npm install
npm run dev                 # http://localhost:5173
```

Make sure the backend (`../backend`) is running first, and that you've run `npm run seed:admin` there so you have a login. `CLIENT_ORIGIN` in the backend's `.env` should allow `http://localhost:5173` (or be left as `*` for local dev, which is the default).

`npm run build` produces a static `dist/` folder you can deploy anywhere (Netlify, Vercel, S3+CloudFront, nginx, etc.) — just set `VITE_API_BASE_URL` to your deployed backend's URL at build time.

## What's inside

- **Overview** — fleet/ride/revenue stat cards + a ride-completion breakdown chart (Recharts).
- **Captains** — filter applications by status, review full KYC (ID front/back, payment QR, profile photo) in a detail modal, and approve (auto-generates & displays the Emp ID + password to hand off), reject with a reason, or suspend an active captain.
- **Live map** — all on-duty captains plotted on OpenStreetMap tiles via Leaflet (no API key required), auto-refreshing every 8s, with available-vs-on-ride counts.
- **Rides** — paginated ride log, filterable by status, showing rider/captain/fare/commission.
- **Riders** — registered riders with lifetime ride count and spend.
- **Coupons** — create/enable/disable/delete flat or percentage promo codes with usage and expiry limits.
- **Billing** — generate the 30-day commission statement per captain from completed-but-unbilled rides, list statements, mark paid.

## Design notes

Built as a "dispatch console" rather than a generic SaaS template: dark ink sidebar, warm-white paper background, a single amber accent used only for primary actions and the active nav item, tabular monospace-style numerals (via Space Grotesk) for all stats so figures are easy to scan, and hairline-bordered flat cards instead of soft drop-shadow cards.

## Notes / things to swap before production

- The live map uses free OpenStreetMap tiles via Leaflet — no billing or API key needed. Swap the `TileLayer` URL in `src/pages/LiveMap.jsx` for Google Maps/Mapbox if you want a different look or richer geocoding elsewhere in the app.
- Admin auth is a single shared login (from `npm run seed:admin` on the backend). Add per-admin accounts / roles via the `Admin` model's `role` field if you need multiple ops users with different permissions.
- KYC images are fetched from the backend's `/uploads` static path — once the backend switches to S3/Cloudinary, `fileUrl()` in `src/api/client.js` should be simplified to just return the stored URL as-is.
