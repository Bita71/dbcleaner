import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import mongodb from "../../lib/mongodb";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 400;
      res.json({ message: "Это запрос POST" });
      return;
    }

    const { uri, database, collection, ids } = req.body;
    if (!uri) {
      res.statusCode = 400;
      res.json({ message: "Ссылка обязательна" });
      return;
    }

    if (!database) {
      res.statusCode = 400;
      res.json({ message: "Название базы данных обязательно" });
      return;
    }

    if (!collection) {
      res.statusCode = 400;
      res.json({ message: "Название коллекции обязательно" });
      return;
    }

    if (!ids) {
      res.statusCode = 400;
      res.json({ message: "IDs обязателен" });
      return;
    }

    const client = await mongodb(uri);

    if (!client) {
      res.statusCode = 400;
      res.json({ message: "Некорректная ссылка" });
      return;
    }

    const db = client?.db(database);

    const currentCollection = db.collection(collection);

    const objects = ids.map((id: string) => new ObjectId(id));
  
    currentCollection.deleteMany({_id: { $in: objects}});

    res.json({
      message: "Успешно",
    });
  } catch (e) {
    res.statusCode = 400;
    res.json({ message: "Что-то пошло не так" });
  }
}

export default handler;
