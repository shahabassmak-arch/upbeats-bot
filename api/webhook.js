// ✅ Store processed message IDs (temporary memory)
const processedMessages = new Set();

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

      // 🚫 Ignore invalid
      if (!value) return res.sendStatus(200);

      // 🚫 Ignore status updates (VERY IMPORTANT)
      if (value.statuses) return res.sendStatus(200);

      const msg = value.messages?.[0];
      if (!msg) return res.sendStatus(200);

      // 🚫 Ignore non-text
      if (msg.type !== "text") return res.sendStatus(200);

      // 🚫 Ignore bot's own messages (IMPORTANT 🔥)
      const myNumber = value.metadata?.display_phone_number;
      if (msg.from === myNumber) {
        return res.sendStatus(200);
      }

      // 🚫 Prevent duplicate processing
      if (processedMessages.has(msg.id)) {
        return res.sendStatus(200);
      }
      processedMessages.add(msg.id);

      // Optional cleanup (avoid memory leak)
      setTimeout(() => processedMessages.delete(msg.id), 60000);

      const message = msg.text?.body;
      const from = msg.from;

      if (!message || !from) return res.sendStatus(200);

      console.log("User:", from);
      console.log("Message:", message);

      // ==============================
      // 🔥 CALL AI API
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
      // 📤 SEND MESSAGE
      // ==============================
      const PHONE_NUMBER_ID = "1033957863139428";

      const ACCESS_TOKEN = "EAALnCZCkmhCsBRDaOoqS7bkVZBBFr23z7amSJLmSMUzl7qn488SqmZB5SCWO9NcZBp7jLL36QEK4ExruKQl7XNpszZAOmEElmHZBZCaZBSQ7SDZAlh4poLjYOHc0hZCcs3ZA14dqAjZCNB0wFLoYo6Y04Qbo9YpVG9YCSgGymWTGH91JPtAdpEBcx4LBt8Aqxnu55rJRtQZDZD";

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
