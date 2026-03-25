export default async function handler(req, res) {
  const VERIFY_TOKEN = "upbeats123";

  // ✅ Webhook verification (GET)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }

  // ✅ Handle incoming WhatsApp messages (POST)
  if (req.method === "POST") {
    try {
      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body)
          : req.body;

      const message =
        body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (message) {
        const from = message.from;

        await fetch(
          "https://graph.facebook.com/v18.0/1129573116896941/messages",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer EAALnCZCkmhCsBRE4z9AWZBe5INpOyVlrAojj2pFZCNa7KK55UI4zotVCdgOQxgbiHPPGTv5h0Mvqo7PZCwqaJ9QbW1x9gW5LKqUrNPUZCNpZCkFmWu32qAm6tDNkRmPWd1t1ONbO8QEG471iN8ivKQhZBb6CG1kUEvmXtzbkG5bCJZC3eQlYpqas17vAjo0SLba4FZBluwtzgOQvUS9V7jqYCuhEq27hMBZCSZBQfZAS5XvkYIUCY7dwbPM22wwtXACnz1ZCRXECN7Wi3JnauFMdpTn9fih6ZCOwZDZD",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: from,
              text: { body: "Hello from Upbeats Bot 😊" },
            }),
          }
        );
      }

      return res.sendStatus(200);
    } catch (error) {
      console.error("ERROR:", error);
      return res.sendStatus(200);
    }
  }

  return res.sendStatus(405);
}
