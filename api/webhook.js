export default async function handler(req, res) {
  const VERIFY_TOKEN = "upbeats123";

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

  if (req.method === "POST") {
    const body = req.body;

    const msg =
      body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (msg) {
      const from = msg.from;

      await fetch(
        `https://graph.facebook.com/v18.0/1129573116896941/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer EAALnCZCkmhCsBRE9mak68oO3AznJsGBDSRHd9hLdgkd3O154nKNfosTS2zU9G0rLdX4MHyFcVjF5ms3z32P1PKLnFdxiiW0EFbiLmjSG03tnospW17zZCl6ieNRgdXcj2vckCy1xKQSg608V7ZAnh4h2qqHmsya92s29hEx28zWweHD0LI3PoBC5ty4ODNdsA5YqmB4dMJ2wo707bduxzN1ZAfNzS6KGiDBm8i9b4CZAbZAkGw6p4HEgZDZD,
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
  }
}

