# iou-fe

Next.js 15 frontend for the IOU app. Lets Bank, Alice, and Bob issue, split, merge, and transfer IOUs backed by a Canton DAML ledger.

## Prerequisites

- Node.js 20+
- pnpm
- `iou-be` running on `http://localhost:4000`

## Setup

```bash
pnpm install
```

Create `.env.local` in this directory:

```env
NEXT_PUBLIC_RUN_MODE=development
NEXT_PUBLIC_API_URL_DEV=http://localhost:4000
NEXT_PUBLIC_API_URL_PROD=https://<your-deployed-backend>
SITE_URL=http://localhost:3000/
```

## Development

Start the full stack in order:

```bash
# Terminal 1 — Canton sandbox + JSON API (inside daml-example/)
daml start

# Terminal 2 — Express backend (inside iou-be/)
pnpm dev

# Terminal 3 — Next.js frontend (this directory)
pnpm dev
```

Open `http://localhost:3000`. You will be redirected to `/dashboard`.

## Usage

1. Select a party from the **Acting as:** dropdown (top-right of the dashboard).
2. As **Bank** — click **Issue IOU** to create an IOU for Alice or Bob.
3. As **Alice** or **Bob** — use **Split**, **Merge**, or **Transfer** on any IOU you own.
4. Go to **Pending Transfers** to accept or reject incoming transfers.

## Production build

```bash
pnpm build
pnpm start
```

Switch `NEXT_PUBLIC_RUN_MODE` to `production` and set `NEXT_PUBLIC_API_URL_PROD` to your deployed `iou-be` URL.
