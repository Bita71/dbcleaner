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

    const { uri, database, collection, updateObj } = req.body;
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

    if (!updateObj) {
      res.statusCode = 400;
      res.json({ message: "Объект с обновлением обязателен" });
      return;
    }

    const client = await mongodb(uri);

    if (!client) {
      res.statusCode = 400;
      res.json({ message: "Некорректная ссылка" });
      return;
    }

    const db = client?.db(database);

    Object.keys(updateObj).forEach(async (id) => {
      const setObj = Object.keys(updateObj[id]).reduce((acc, field) => ({...acc, [field]: updateObj[id][field]}), {})
      await db
      .collection(collection).updateOne({
        _id: new ObjectId(id),
      },
      {
        $set: setObj
      }
      )
    })

    res.json({
      message: "Успешно",
    });
  } catch (e) {
    res.statusCode = 400;
    res.json({ message: "Что-то пошло не так" });
  }
}

export default handler;
