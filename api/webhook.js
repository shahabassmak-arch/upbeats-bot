export default async function handler(req, res) {

  // ==============================
  // ✅ VERIFY WEBHOOK
  // ==============================
  if (req.method === "GET") {
    const VERIFY_TOKEN = "upbeats123";

    if (
      req.query["hub.mode"] === "subscribe" &&
      req.query["hub.verify_token"] === VERIFY_TOKEN
    ) {
      return res.status(200).send(req.query["hub.challenge"]);
    }
    return res.sendStatus(403);
  }

  // ==============================
  // ✅ HANDLE MESSAGE
  // ==============================
  if (req.method === "POST") {
    try {
      const body = req.body;

      const value = body.entry?.[0]?.changes?.[0]?.value;

      // Ignore invalid
      if (!value) return res.sendStatus(200);

      // Ignore status updates
      if (value.statuses) return res.sendStatus(200);

      const msg = value.messages?.[0];

      // No message
      if (!msg) return res.sendStatus(200);

      // ==============================
      // ✅ STOP DUPLICATES
      // ==============================
      const msgId = msg.id;

      global.processedMessages = global.processedMessages || new Set();

      if (global.processedMessages.has(msgId)) {
        return res.sendStatus(200);
      }
      global.processedMessages.add(msgId);

      // ==============================
      // ✅ ONLY TEXT
      // ==============================
      if (msg.type !== "text") return res.sendStatus(200);

      const message = msg.text?.body;
      const from = msg.from;

      if (!message || !from) return res.sendStatus(200);

      // ==============================
      // ⚠️ IMPORTANT: IGNORE SELF LOOP
      // ==============================
      if (from === "1033957863139428") {
        return res.sendStatus(200);
      }

      console.log("User:", from);
      console.log("Message:", message);

      // ==============================
      // 🔥 AI CALL
      // ==============================
      const aiRes = await fetch(
        "https://hscobkuzqqmqchyaqcsf.supabase.co/functions/v1/ai-chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message })
        }
      );

      const data = await aiRes.json();
      const reply = data.reply || "Try again 😓";

      // ==============================
      // 📤 SEND REPLY
      // ==============================
      await fetch(
        "https://graph.facebook.com/v18.0/1033957863139428/messages",
        {
          method: "POST",
          headers: {
            "Authorization": "Bearer EAALnCZCkmhCsBRDaOoqS7bkVZBBFr23z7amSJLmSMUzl7qn488SqmZB5SCWO9NcZBp7jLL36QEK4ExruKQl7XNpszZAOmEElmHZBZCaZBSQ7SDZAlh4poLjYOHc0hZCcs3ZA14dqAjZCNB0wFLoYo6Y04Qbo9YpVG9YCSgGymWTGH91JPtAdpEBcx4LBt8Aqxnu55rJRtQZDZD",
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

    } catch (err) {
      console.error("Error:", err);
      return res.sendStatus(200);
    }
  }

  return res.sendStatus(405);
}
