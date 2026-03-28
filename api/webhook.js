const seenMessages = new Set();

export default async function handler(req, res) {

  // ==============================
  // ✅ VERIFY
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

      // 🚫 Ignore invalid
      if (!value) return res.sendStatus(200);

      // 🚫 Ignore status updates
      if (value.statuses) return res.sendStatus(200);

      // 🚫 Ignore if no contacts (not a real user message)
      const contacts = value.contacts?.[0];
      if (!contacts) return res.sendStatus(200);

      const msg = value.messages?.[0];
      if (!msg) return res.sendStatus(200);

      // ✅ FIX: Ignore old messages (older than 30 seconds)
      const msgTime = parseInt(msg.timestamp) * 1000;
      const now = Date.now();
      if (now - msgTime > 30000) return res.sendStatus(200);

      // ✅ FIX: Skip duplicate messages
      const msgId = msg.id;
      if (seenMessages.has(msgId)) return res.sendStatus(200);
      seenMessages.add(msgId);

      // ✅ FIX: Only allow messages TO your number
      const phoneNumberId = value.metadata?.phone_number_id;
      if (phoneNumberId !== "1033957863139428") return res.sendStatus(200);

      // 🚫 Only handle text
      if (msg.type !== "text") return res.sendStatus(200);

      const message = msg.text?.body;
      const from = msg.from;

      if (!message || !from) return res.sendStatus(200);

      // 🚫 Ignore if the sender is YOUR OWN number (bot talking to itself)
      if (from === "1033957863139428") return res.sendStatus(200);

      console.log("User:", from);
      console.log("Message:", message);

      // ==============================
      // 🔥 AI CALL
      // ==============================
      const aiRes = await fetch(
        "https://hscobkuzqqmqchyaqcsf.supabase.co/functions/v1/ai-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
