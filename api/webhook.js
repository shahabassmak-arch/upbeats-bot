export default async function handler(req, res) {
  const VERIFY_TOKEN = "upbeats123";

  // ✅ Verification (GET request from Meta)
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

  // ✅ Handle incoming messages
  if (req.method === "POST") {
    try {
      const body = req.body;

      const message =
        body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (message) {
        const from = message.from;

        await fetch(
          "https://graph.facebook.com/v18.0/1129573116896941/messages",
          {
            method: "POST",
            headers: {
              Authorization:
                "Bearer EAALnCZCkmhCsBRMCtym2s6RdlUu8yrEHkb7WrsZAEQtyjMdLsfAmNa2j1KxbsuwSWBZCWvhEUs0yjlZBLtprg9H8TrWscL9LUs2GWVYjsHRScWjd15pw6r8L38zcZApGFmRHrZAdYtxjnnZA0QYvbTRLThXAZCucMCpmWZA8DsqREr0LZBQEVojZAfvWTc2g55KOZBpZCc3OnHG0th2IIUOxTnS7SDRQYa2ktU4aN4wuMatQz4DarDPRnEJrODMKgpJaM5MIYB1aQeS7CIt4mW54vVRBNNg2I",
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
      console.error(error);
      return res.sendStatus(500);
    }
  }

  return res.sendStatus(405);
}
