const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET;
const TOLERANCE_SECONDS = 5 * 60;

if (!WHOP_WEBHOOK_SECRET) {
  console.error('WHOP_WEBHOOK_SECRET env var is not set — every webhook will be rejected.');
}

// Raw body needed for signature verification — must be the exact bytes Whop signed.
app.use(express.raw({ type: '*/*', limit: '1mb' }));

// Whop's dashboard has shown secrets as both "whsec_<base64>" (Standard Webhooks
// convention, per docs.whop.com) and "ws_<hex>" (seen in practice) — decode whichever
// we were actually given rather than assuming one.
function decodeSecret(raw) {
  const stripped = raw.replace(/^(whsec_|ws_)/, '');
  if (/^[0-9a-f]+$/i.test(stripped) && stripped.length % 2 === 0) {
    return Buffer.from(stripped, 'hex');
  }
  return Buffer.from(stripped, 'base64');
}

function verify(id, timestamp, rawBody, signatureHeader) {
  if (!WHOP_WEBHOOK_SECRET || !id || !timestamp || !signatureHeader) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > TOLERANCE_SECONDS) return false;

  const secretBytes = decodeSecret(WHOP_WEBHOOK_SECRET);
  const signedContent = `${id}.${timestamp}.${rawBody.toString('utf8')}`;
  const expected = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');

  return signatureHeader
    .split(' ')
    .some((part) => {
      const [, sig] = part.split(',');
      if (!sig) return false;
      const a = Buffer.from(sig);
      const b = Buffer.from(expected);
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    });
}

app.get('/health', (_req, res) => res.json({ ok: true }));

function handleWhopWebhook(req, res) {
  const id = req.header('webhook-id');
  const timestamp = req.header('webhook-timestamp');
  const signature = req.header('webhook-signature');

  if (!verify(id, timestamp, req.body, signature)) {
    console.warn('Rejected webhook: bad or missing signature', { id });
    return res.status(401).json({ ok: false });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ ok: false });
  }

  // Respond fast; log now, wire up real delivery (email/Files-app grant/etc.) next.
  console.log('Verified Whop webhook:', JSON.stringify({
    id,
    type: event.type || event.action,
    data: event.data
  }));

  res.status(200).json({ ok: true });
}

// Accepted at both the root and /webhooks/whop so either URL works in Whop's dashboard.
app.post('/', handleWhopWebhook);
app.post('/webhooks/whop', handleWhopWebhook);

app.listen(PORT, () => console.log(`bloomrecorder-webhook listening on ${PORT}`));
