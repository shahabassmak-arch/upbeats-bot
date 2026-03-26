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
  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const message =
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message || !message.from) {
      return res.status(200).send("No message");
    }

    const from = message.from;
    const userMessage = message.text?.body || "Hi";

// 🔥 Call Lovable AI API
const aiResponse = await fetch("https://upbeatsacademy.online/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer Shahabas@123" // <-- Your Lovable key
  },
  body: JSON.stringify({ message: userMessage })
});

const aiData = await aiResponse.json();

// Get AI reply
const replyText = aiData.reply || aiData.message || aiData.response || "Sorry, I couldn't understand.";

    // 🔥 Send reply to WhatsApp
    await fetch(
      "https://graph.facebook.com/v18.0/1129573116896941/messages",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer EAALnCZCkmhCsBRFIr0wtIHz7lZBbUpb6ZBN9REq1iyjGDTZAnZCNZC2jzyfgXoJ0UjgMLyiI1b2GFjeyGZCQWvB26zmbMBMJxKFNQnZApSmN7Vc3NJ6nAepZAm8oZAJBXF5lqGgxTAUevnvWr4Na388St6qfqRoB4QzSAydZBXK6EeIWzjwZB5i02iuHr3qmgjZAuNbEZB5lSL5vZCvyn6UghqLzEmsKe9s67WwBHst5vuGzQYBOhT4dndv9QJqVWwqFphZAS3gTT2sqwddjs6sI9ultJNnFehMVRwZDZD",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          text: { body: replyText },
        }),
      }
    );

    return res.status(200).send("OK");
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(200).send("Error handled");
  }
}
