/*
  ─── WEB PUSH CONFIG ────────────────────────────────────────
  Sends browser push notifications using the standard Web Push
  Protocol (RFC 8030 + VAPID/RFC 8292), implemented with Node's
  built-in `crypto` module only — no `web-push` npm package
  required. This avoids adding a new dependency; if the seller's
  environment can install packages normally, swapping this file
  for the `web-push` library later is a drop-in replacement
  (same `sendPushNotification(subscription, payload)` shape).

  ─── SETUP ──────────────────────────────────────────────────
  1. Generate your own VAPID keys (do NOT reuse any keys shared
     in chat/docs — they must be private to your deployment):

       node -e "
       const crypto = require('crypto');
       const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
         namedCurve: 'prime256v1',
         publicKeyEncoding: { type: 'spki', format: 'der' },
         privateKeyEncoding: { type: 'pkcs8', format: 'der' },
       });
       const publicKeyRaw = publicKey.subarray(publicKey.length - 65);
       const marker = Buffer.from('020101' + '0420', 'hex');
       const idx = privateKey.indexOf(marker);
       const privateKeyRaw = privateKey.subarray(idx + marker.length, idx + marker.length + 32);
       const b64url = (b) => b.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
       console.log('VAPID_PUBLIC_KEY=' + b64url(publicKeyRaw));
       console.log('VAPID_PRIVATE_KEY=' + b64url(privateKeyRaw));
       "

  2. Add both to your .env, plus a contact email VAPID requires:
       VAPID_PUBLIC_KEY=...
       VAPID_PRIVATE_KEY=...
       VAPID_CONTACT_EMAIL=you@yourdomain.com

  3. The public key is also needed on the frontend (it's not
     secret — it's sent to the browser's Push API). Expose it via
     the existing dashboard API response, or a small GET route.
--------------------------------------------------------------*/

const crypto = require("crypto");

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_CONTACT_EMAIL = process.env.VAPID_CONTACT_EMAIL || "mailto:support@example.com";

const base64UrlDecode = (str) => {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64");
};

const base64UrlEncode = (buf) =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/* Builds a short-lived VAPID JWT (ES256) authorizing this server
   to push to the given endpoint's origin — required by every
   push service (Chrome, Firefox, etc.) per RFC 8292. */
function buildVapidJwt(audience) {
  const header = base64UrlEncode(
    Buffer.from(JSON.stringify({ typ: "JWT", alg: "ES256" })),
  );
  const payload = base64UrlEncode(
    Buffer.from(
      JSON.stringify({
        aud: audience,
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
        sub: VAPID_CONTACT_EMAIL,
      }),
    ),
  );
  const unsigned = `${header}.${payload}`;

  const privateKeyDer = buildPkcs8FromRawScalar(
    base64UrlDecode(VAPID_PRIVATE_KEY),
    base64UrlDecode(VAPID_PUBLIC_KEY),
  );
  const keyObject = crypto.createPrivateKey({ key: privateKeyDer, format: "der", type: "pkcs8" });

  // ECDSA signature from Node comes DER-encoded; JWTs need the raw
  // r||s concatenation (64 bytes for P-256), so it's converted below.
  const derSignature = crypto.sign("sha256", Buffer.from(unsigned), {
    key: keyObject,
    dsaEncoding: "der",
  });
  const rawSignature = derToRawSignature(derSignature);

  return `${unsigned}.${base64UrlEncode(rawSignature)}`;
}

/* Node's crypto needs a full PKCS8 DER wrapper to import a raw
   32-byte EC private key scalar — this rebuilds that wrapper
   (the inverse of the extraction shown in the setup comment).
   The public key point must be the real one; OpenSSL validates
   that the embedded point is a genuine point on the curve, so a
   placeholder/zeroed point is rejected outright. */
function buildPkcs8FromRawScalar(rawPrivateKey, rawPublicKey) {
  const prefix = Buffer.from(
    "308187020100301306072a8648ce3d020106082a8648ce3d030107046d306b02010104" +
      "20",
    "hex",
  );
  const suffix = Buffer.from("a144034200", "hex");
  return Buffer.concat([prefix, rawPrivateKey, suffix, rawPublicKey]);
}

function derToRawSignature(der) {
  // Minimal DER SEQUENCE(INTEGER r, INTEGER s) parser.
  let offset = 2; // skip SEQUENCE tag + length
  const readInt = () => {
    offset += 1; // INTEGER tag
    let len = der[offset];
    offset += 1;
    let bytes = der.subarray(offset, offset + len);
    offset += len;
    // Strip a leading zero byte used to keep the integer positive.
    if (bytes[0] === 0x00 && bytes.length > 32) bytes = bytes.subarray(1);
    // Left-pad to 32 bytes if shorter.
    if (bytes.length < 32) {
      bytes = Buffer.concat([Buffer.alloc(32 - bytes.length), bytes]);
    }
    return bytes;
  };
  const r = readInt();
  const s = readInt();
  return Buffer.concat([r, s]);
}

/*
  Sends one push message to one subscription. `payload` is any
  JSON-serializable object — the service worker receives it in
  the `push` event and decides how to render the notification.

  Encryption follows the aes128gcm scheme (RFC 8291): a fresh
  ECDH key pair per message, HKDF-derived content encryption
  key, then AES-128-GCM. This is what every browser's push
  service expects — there's no simpler "send plaintext" option,
  push payloads are always encrypted end-to-end.
*/
async function sendPushNotification(subscription, payload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.log("⚠️ Push not sent: VAPID keys not configured in .env");
    return { success: false, reason: "vapid_not_configured" };
  }

  try {
    const endpointUrl = new URL(subscription.endpoint);
    const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;
    const jwt = buildVapidJwt(audience);

    const plaintext = Buffer.from(JSON.stringify(payload));
    const encrypted = encryptPayload(
      plaintext,
      subscription.keys.p256dh,
      subscription.keys.auth,
    );

    const res = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        TTL: "86400",
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        Authorization: `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
      },
      body: encrypted,
    });

    if (res.status === 404 || res.status === 410) {
      return { success: false, reason: "expired", shouldRemove: true };
    }
    if (!res.ok) {
      return { success: false, reason: `http_${res.status}` };
    }
    return { success: true };
  } catch (error) {
    console.log("Push send error:", error.message);
    return { success: false, reason: error.message };
  }
}

/* aes128gcm payload encryption per RFC 8291 — ECDH with the
   subscriber's p256dh key, HKDF to derive the content encryption
   key and nonce, then a single AES-128-GCM record. */
function encryptPayload(plaintext, p256dhKeyB64, authSecretB64) {
  const subscriberPublicKey = base64UrlDecode(p256dhKeyB64);
  const authSecret = base64UrlDecode(authSecretB64);

  const localKeys = crypto.createECDH("prime256v1");
  localKeys.generateKeys();
  const localPublicKey = localKeys.getPublicKey();
  const sharedSecret = localKeys.computeSecret(subscriberPublicKey);

  const salt = crypto.randomBytes(16);

  const authInfo = Buffer.concat([Buffer.from("WebPush: info\0"), subscriberPublicKey, localPublicKey]);
  const prk = hkdf(authSecret, sharedSecret, authInfo, 32);

  const cekInfo = Buffer.from("Content-Encoding: aes128gcm\0");
  const cek = hkdf(salt, prk, cekInfo, 16);

  const nonceInfo = Buffer.from("Content-Encoding: nonce\0");
  const nonce = hkdf(salt, prk, nonceInfo, 12);

  // Padding: a single 0x02 delimiter byte with no extra padding —
  // the minimum valid aes128gcm record per spec.
  const paddedPlaintext = Buffer.concat([plaintext, Buffer.from([0x02])]);

  const cipher = crypto.createCipheriv("aes-128-gcm", cek, nonce);
  const ciphertext = Buffer.concat([cipher.update(paddedPlaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const recordSize = Buffer.alloc(4);
  recordSize.writeUInt32BE(4096, 0);
  const keyIdLen = Buffer.from([localPublicKey.length]);

  const header = Buffer.concat([salt, recordSize, keyIdLen, localPublicKey]);
  return Buffer.concat([header, ciphertext, authTag]);
}

function hkdf(salt, ikm, info, length) {
  const prk = crypto.createHmac("sha256", salt).update(ikm).digest();
  let t = Buffer.alloc(0);
  let okm = Buffer.alloc(0);
  let counter = 1;
  while (okm.length < length) {
    t = crypto
      .createHmac("sha256", prk)
      .update(Buffer.concat([t, info, Buffer.from([counter])]))
      .digest();
    okm = Buffer.concat([okm, t]);
    counter += 1;
  }
  return okm.subarray(0, length);
}

/*
  ─── SEND TO A SELLER (ALL THEIR DEVICES) ───────────────────
  Looks up every subscription this seller has (phone, laptop,
  etc.) and pushes to all of them. Expired subscriptions
  (endpoint returned 404/410, meaning the browser un-registered
  it) are cleaned up automatically so the collection doesn't
  accumulate dead rows over time.
--------------------------------------------------------------*/
async function sendPushToSeller(sellerId, payload) {
  const PushSubscription = require("../models/PushSubscription");
  const subscriptions = await PushSubscription.find({ seller: sellerId });

  const results = await Promise.all(
    subscriptions.map(async (sub) => {
      const result = await sendPushNotification(sub, payload);
      if (result.shouldRemove) {
        await PushSubscription.deleteOne({ _id: sub._id });
      }
      return result;
    }),
  );

  return results;
}

/*
  ─── LOW-CREDIT PUSH CHECK ───────────────────────────────────
  Called after any action that deducts credits (tryon, fabric
  generation, etc.) — checks whether the seller just crossed
  below the low-credit threshold and, if so, sends one push.

  Why "just crossed" and not "is currently below": if this ran
  on every single credit-consuming action while the seller sits
  at 20 credits, they'd get a push every single try-on until
  they top up — extremely annoying. Comparing the balance
  before and after the deduction means exactly one push fires,
  right when they cross the line.
--------------------------------------------------------------*/
async function checkAndSendLowCreditPush(seller, creditsBefore, creditsAfter, threshold = 50) {
  const justCrossedThreshold = creditsBefore >= threshold && creditsAfter < threshold;
  if (!justCrossedThreshold) return;

  try {
    await sendPushToSeller(seller._id, {
      title: "Running Low on Credits ⚡",
      body: `Only ${creditsAfter} credits left — top up to keep try-ons running.`,
      url: "/dashboard",
      tag: "low-credits",
    });
  } catch (e) {
    console.log("Low-credit push failed:", e.message);
  }
}

module.exports = {
  sendPushNotification,
  sendPushToSeller,
  checkAndSendLowCreditPush,
  VAPID_PUBLIC_KEY,
};