// Checks a BML Connect transaction after the guest returns from the payment page.
// Returns the state ("CONFIRMED" when paid), the amount in cents and the booking code.
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
  const apiKey = process.env.BML_API_KEY;
  if (!apiKey) return json(500, { error: "BML_API_KEY is not set on Netlify" });
  const id = String((event.queryStringParameters || {}).id || "");
  if (!/^[a-zA-Z0-9_-]{6,64}$/.test(id)) return json(400, { error: "Missing transaction id" });

  try {
    const res = await fetch(`${BASE()}/transactions/${id}`, {
      headers: { Authorization: apiKey, Accept: "application/json" },
    });
    const t = await res.json().catch(() => ({}));
    if (!res.ok) return json(502, { error: "BML Connect error" });
    return json(200, { id: t.id, state: t.state, amount: t.amount, currency: t.currency, localId: t.localId });
  } catch (e) {
    return json(502, { error: "Could not reach BML Connect" });
  }
};
