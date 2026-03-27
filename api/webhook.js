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

    // 🚨 VERY IMPORTANT → respond instantly
    res.status(200).end();

    // 👉 run async (no blocking)
    setTimeout(async () => {
      try {
        const body = req.body;
        const value = body.entry?.[0]?.changes?.[0]?.value;

        if (!value || value.statuses) return;

        const msg = value.messages?.[0];
        if (!msg || msg.type !== "text") return;

        const message = msg.text?.body;
        const from = msg.from;

        if (!message || !from) return;

        console.log("User:", from, message);

        // 🔥 AI CALL
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

        // 📤 SEND REPLY
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

      } catch (err) {
        console.error("Error:", err);
      }
    }, 0);

    return;
  }

  return res.sendStatus(405);
}
