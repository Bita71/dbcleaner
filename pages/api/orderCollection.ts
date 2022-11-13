import { NextApiRequest, NextApiResponse } from "next";
import mongodb from "../../lib/mongodb";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 400;
      res.json({ message: "Это запрос POST" });
      return;
    }

    const { uri, database, collection, order } = req.body;
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

    if (!order) {
      res.statusCode = 400;
      res.json({ message: "Порядок обязателен" });
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

    const currentCollectionData = await db
      .collection(collection)
      .find({})
      .toArray();

    const newCollection = await db.createCollection("newOrderedCollection");

    const docs = currentCollectionData.map((row) => {
      const doc: any = {};
      order.forEach((key: string) => (doc[key] = row[key]));
      return doc;
    });

    // this option prevents additional documents from being inserted if one fails
    const options = { ordered: true };

    await newCollection.insertMany(docs, options);

    await currentCollection.drop();

    await newCollection.rename(collection);

    res.json({
      message: "Успешно",
    });
  } catch (e) {
    res.statusCode = 400;
    res.json({ message: "Что-то пошло не так" });
  }
}

export default handler;
