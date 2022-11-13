import { MongoClient } from "mongodb";

export default async function (uri: string) {
  try {
    const clientPromise = await MongoClient.connect(uri)
    return clientPromise;
  } catch (error) {
    console.log('Connection error: ', error);
    return null;
  }
}
