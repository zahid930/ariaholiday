// Creates a BML Connect card payment and returns the hosted payment page URL.
// Set these in Netlify → Site configuration → Environment variables:
//   BML_API_KEY  (from your BML merchant portal)
//   BML_APP_ID   (from your BML merchant portal)
//   BML_MODE     "production" for live payments, anything else = test (UAT)
const crypto = require("crypto");

const BASE = () =>
  process.env.BML_MODE === "production"
    ? "https://api.merchants.bankofmaldives.com.mv/public"
    : "https://api.uat.merchants.bankofmaldives.com.mv/public";

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const apiKey = process.env.BML_API_KEY;
  const appId = process.env.BML_APP_ID || "";
  if (!apiKey) return json(500, { error: "BML_API_KEY is not set on Netlify" });

  let data;
  try { data = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "Bad JSON" }); }

  const currency = ["USD", "MVR"].includes(data.currency) ? data.currency : "USD";
  const amount = Math.round(Number(data.amount) * 100); // cents / laari
  const code = String(data.code || "").slice(0, 40);
  if (!(amount > 0) || amount > 5000000) return json(400, { error: "Invalid amount" });
  if (!/^ARIA-[A-Z0-9]{6}$/.test(code)) return json(400, { error: "Invalid booking code" });

  // Only allow redirects back to this same site
  const site = process.env.URL || "";
  let redirectUrl = String(data.redirectUrl || "");
  if (site && !redirectUrl.startsWith(site)) redirectUrl = `${site}/?paid=${encodeURIComponent(code)}`;

  const signature = crypto
    .createHash("sha1")
    .update(`amount=${amount}&currency=${currency}&apiKey=${apiKey}`)
    .digest("base64");

  const body = {
    amount,
    currency,
    localId: code,
    customerReference: `Aria Holiday booking ${code}`,
    redirectUrl,
    signMethod: "sha1",
    signature,
    appVersion: "aria-holiday-1.0",
    apiVersion: "2.0",
    deviceId: appId,
  };

  try {
    const res = await fetch(`${BASE()}/transactions`, {
      method: "POST",
      headers: { Authorization: apiKey, Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || !out.url) return json(502, { error: out.message || "BML Connect error", detail: out });
    return json(200, { id: out.id, url: out.url });
  } catch (e) {
    return json(502, { error: "Could not reach BML Connect" });
  }
};
