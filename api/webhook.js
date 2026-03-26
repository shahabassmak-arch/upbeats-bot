// /api/webhook.js
export default async function handler(req, res) {
  const VERIFY_TOKEN = "upbeats123"; // Your WhatsApp verify token

  // ✅ WhatsApp webhook verification
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

  // ✅ Handle incoming WhatsApp messages
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (!message || !message.from) return res.status(200).send("No message");

      const from = message.from;

      // ✅ Simple test reply
      const replyText = "Hi";

      // Send reply back to WhatsApp
      await fetch(`https://graph.facebook.com/v18.0/1129573116896941/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer EAALnCZCkmhCsBRFIr0wtIHz7lZBbUpb6ZBN9REq1iyjGDTZAnZCNZC2jzyfgXoJ0UjgMLyiI1b2GFjeyGZCQWvB26zmbMBMJxKFNQnZApSmN7Vc3NJ6nAepZAm8oZAJBXF5lqGgxTAUevnvWr4Na388St6qfqRoB4QzSAydZBXK6EeIWzjwZB5i02iuHr3qmgjZAuNbEZB5lSL5vZCvyn6UghqLzEmsKe9s67WwBHst5vuGzQYBOhT4dndv9QJqVWwqFphZAS3gTT2sqwddjs6sI9ultJNnFehMVRwZDZD`, // Your token
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          text: { body: replyText }
        })
      });

      return res.status(200).send("OK");
    } catch (error) {
      console.error("Webhook error:", error);
      return res.status(200).send("Error handled");
    }
  }

  return res.status(405).send("Method Not Allowed");
}
