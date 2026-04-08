# my-room

Browser-based multiplayer Gaussian splat virtual space with up to 100 anonymous users, third-person capsule avatars, and global text chat.

**Live:** https://edward-my-room.vercel.app

## Prerequisites

- Node 18+

## Local Development

Run two terminals:

**Terminal 1 — Server:**

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

**Terminal 2 — Client:**

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `VITE_SPLAT_URL` | client/.env | URL to the Gaussian splat file |
| `VITE_SERVER_URL` | client/.env | Socket.IO server URL (e.g. `http://localhost:3001`) |
| `PORT` | server/.env | Server port (default: `3001`) |
| `MAX_USERS` | server/.env | Max simultaneous connections (default: `100`) |

## Deploy

### Client → Vercel

Deployed at https://edward-my-room.vercel.app. Auto-deploys on push to `main` via GitHub integration.

- Splat files are hosted on Vercel Blob Storage (too large for bundled deploy)
- `vercel.json` in project root handles build config
- `VITE_SERVER_URL` env var points to the Railway backend

#### Splat Loading: Local vs Production

Vercel's CDN applies Brotli compression to `.splat` files, which strips the `Content-Length` header. drei's `SplatLoader` requires `Content-Length` to parse the file, so loading fails on production without a workaround.

- **Production (Vercel):** `SplatScene.tsx` uses the `useSplatBlobUrl` hook to fetch the splat file first and create a local blob URL that always has a correct `Content-Length`. This must be enabled for the deployed site to work.
- **Local dev:** The Vite dev server proxies splat requests with `Accept-Encoding: identity` (configured in `client/vite.config.ts`), which avoids CDN compression entirely. The `useSplatBlobUrl` hook also works locally, so the current code works in both environments.

### Server → Railway

1. Import the repo on [railway.app](https://railway.app)
2. Set `PORT` and `MAX_USERS` environment variables
3. Deploy — `railway.toml` handles build config
