import { NextApiRequest, NextApiResponse } from "next";
import mongodb from "../../lib/mongodb";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
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
      res.json({ message: "Некорректная ссылка" });
      return;
    }

    const result = await client?.db("admin").admin().listDatabases();

    res.json({
      data: result.databases.filter(
        (item) => item.name !== "admin" && item.name !== "local" && item.name !== "config"
      ),
    });
  } catch (e) {
    res.statusCode = 400;
    res.json({ message: "Что-то пошло не так" });
  }
}

export default handler;
