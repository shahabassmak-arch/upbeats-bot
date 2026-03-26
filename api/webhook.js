export default async function handler(req, res) {

  // ==============================
  // ✅ 1. WEBHOOK VERIFICATION (GET)
  // ==============================
  if (req.method === "GET") {
    const VERIFY_TOKEN = "upbeats123";

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }

  // ==============================
  // ✅ 2. HANDLE INCOMING MESSAGE (POST)
  // ==============================
  if (req.method === "POST") {
    try {
      const body = req.body;

      const message =
        body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;

      const from =
        body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;

      if (!message || !from) {
        return res.sendStatus(200);
      }

      console.log("User:", from);
      console.log("Message:", message);

      // ==============================
      // 🔥 3. CALL YOUR AI API
      // ==============================
      const aiResponse = await fetch(
        "https://hscobkuzqqmqchyaqcsf.supabase.co/functions/v1/ai-chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: message
          })
        }
      );

      const aiData = await aiResponse.json();
      const reply = aiData.reply || "Sorry! Try again 😓";

      console.log("AI Reply:", reply);

      // ==============================
      // 📤 4. SEND REPLY TO WHATSAPP
      // ==============================

      const PHONE_NUMBER_ID = "1129573116896941";

      // 🔴 REPLACE "Shahabas" WITH YOUR REAL ACCESS TOKEN
      const ACCESS_TOKEN = "EAALnCZCkmhCsBRMYiZB0eDzDW8OvaQywavHo1licD9ZASkdAYYPZBnywPwm2dd0pgMFEaskU7C7G0rsYSUJfZBv1rLBelScD3vPukxf146uZAWiewK3OZAIiVxwdQHH2YzNxga96HvIZBJDn9iKHDzJ8QDp0oompf0gQP7yuOcQAdt6iq0pID7nf74jh9iff1TCzRJeb9syH8e4ep1joGN1dU4FZBdTfLWfXCaGIF4NmYdGawKh8VEb4ELmZAziZAHiqjUidmZAeWeObZCsuXxPKd0QKqLJsM";

      await fetch(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: {
              body: reply
            }
          })
        }
      );

      return res.sendStatus(200);

    } catch (error) {
      console.error("Error:", error);
      return res.sendStatus(200);
    }
  }

  return res.sendStatus(405);
}
