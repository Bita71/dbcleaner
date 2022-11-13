import { NextApiRequest, NextApiResponse } from "next";
import mongodb from "../../lib/mongodb";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.statusCode = 400;
      res.json({ message: "Это запрос POST" });
      return;
    }

    const { uri } = req.body;

    if (!uri) {
      res.statusCode = 400;
      res.json({ message: "Ссылка обязательна" });
      return;
    }

    const client = await mongodb(uri);

    if (!client) {
      res.statusCode = 400;
      res.json({ message: "Не удалось подлючиться" });
      return;
    }

    res.json({ message: "Подключено" });
  } catch (e) {
    res.statusCode = 400;
    res.json({ message: "Не удалось подлючиться" });
  }
}

export default handler;
