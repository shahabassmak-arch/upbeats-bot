let lastMessageId = null;

export default async function handler(req, res) {

  // ==============================
  // ✅ 1. WEBHOOK VERIFICATION
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
  // ✅ 2. HANDLE INCOMING MESSAGE
  // ==============================
  if (req.method === "POST") {
    try {
      const body = req.body;

      const value = body.entry?.[0]?.changes?.[0]?.value;

      // Ignore non-message events
      if (!value || !value.messages) {
        return res.sendStatus(200);
      }

      const msg = value.messages[0];

      // ✅ Prevent duplicate messages
      if (msg.id === lastMessageId) {
        return res.sendStatus(200);
      }
      lastMessageId = msg.id;

      // ✅ Only allow text messages
      if (!msg.text || !msg.text.body) {
        return res.sendStatus(200);
      }

      const message = msg.text.body;
      const from = msg.from;

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
          body: JSON.stringify({ message })
        }
      );

      const aiData = await aiResponse.json();
      const reply = aiData.reply || "Sorry! Try again 😓";

      console.log("AI Reply:", reply);

      // ==============================
      // 📤 4. SEND REPLY TO WHATSAPP
      // ==============================
      const PHONE_NUMBER_ID = "1033957863139428";
      // 🔴 REPLACE THIS WITH YOUR REAL TOKEN
      const ACCESS_TOKEN = "EAALnCZCkmhCsBRPHODvs4AS4fno8NO82weU88cH461cm8ZBhW0zw0IvFhUPvDAVzZBWh70LUZADhQW6WeYVKkvHNMe0kMAACwAQ8A0wDj1XZAMHqZCp0VLvuEbrdLYYKlIdhWFvRS73ReXZAph14y0bhWZANzyZCxxUdfoDxma5Odl9pkvZADydvSGyXAtMbZB8jW0Ivs1Wy3qGK7aBZA6qw65CrnqZAZB0uZCTDWA6QpzjpxF6jOrUbw7QxccqtRIdxnYrLjc60lvTRjP3qxTiLSeidP7e4ORi";

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
            text: { body: reply }
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
