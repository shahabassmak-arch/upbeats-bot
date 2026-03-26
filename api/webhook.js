export default async function handler(req, res) {
  const VERIFY_TOKEN = "upbeats123";

  try {
    // ✅ Verification (GET)
    if (req.method === "GET") {
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];

      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      } else {
        return res.status(403).send("Forbidden");
      }
    }

    // ✅ Handle POST (WhatsApp messages)
    if (req.method === "POST") {
      let body = {};

      try {
        body =
          typeof req.body === "string"
            ? JSON.parse(req.body)
            : req.body || {};
      } catch (e) {
        console.log("Body parse error");
      }

      const message =
        body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      console.log("Incoming:", message);

      // ⚠️ SAFE: do not call API if no message
      if (!message || !message.from) {
        return res.status(200).send("No message");
      }

      const from = message.from;

      // ⚠️ TEMP: disable reply to avoid crash
      // (we enable after webhook works)

await fetch(
  "https://graph.facebook.com/v18.0/1129573116896941/messages",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer EAALnCZCkmhCsBRAujf7tt2QZBOXKL6nIwvhKv5qILZC1ssfWWi5xZCFEU1WZBwyyaOdyj6pPYoCZADzZCyRZBOz1ZBuuICEZBEARqYubYIE41jZBvrgnydI7gGoWbVpBrG7ZAvoQtyNGiMUGZBwCJ1ofHEKUB2b6ZBP4PJb81QT0ZCbPo87n4tgHfYF8Ys981IYM2eLWbX5nn7b2ZBqY5cK4u7ZAayZCL3Ybo6KHtwQL1DZBKdq6VsCiozzTdlrYN0ORzm5ZAtT0jZC7DLs96Uct0xlsNfZBfCFgV19WKLfAZDZD",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: from,
      text: { body: "Hello from Upbeats Bot 😊" },
    }),
  }
);

      return res.status(200).send("EVENT_RECEIVED");
    }

    return res.status(405).send("Method Not Allowed");
  } catch (error) {
    console.error("CRASH ERROR:", error);
    return res.status(200).send("Error handled");
  }
}
