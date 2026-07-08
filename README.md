# BloomRecorder — Landing Page

Static marketing site for **BloomRecorder** (the pay-once screen + camera recorder), intended for **bloomrecorder.com**.

## Stack
- Single self-contained `index.html` (inline CSS, no build step)
- `assets/screenshot.png` — hero image (captured from the live app)
- `Dockerfile` + `nginx.conf` — nginx static server for **Coolify** (Contabo VPS 2)

## Local preview
```bash
docker build -t bloomrecorder-site .
docker run --rm -p 8080:80 bloomrecorder-site
# open http://localhost:8080
```

## Deploy (Coolify)
- New Coolify project → Dockerfile build-pack → GitHub repo under `bensblueprints`
- Domain: `bloomrecorder.com` → Cloudflare A-record to `212.28.184.24` (proxied)

## To update before launch
- `#buy-btn` / nav CTA point to `https://whop.com/bloomrecorder` — swap for the real Whop product URL once created.
- Launch price is set to **$19** (regular **$29**). Adjust in the pricing card + final CTA.
