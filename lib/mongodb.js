import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
let client;
if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
export default async function getDb() {
  const conn = await global._mongoClientPromise;
  return conn.db();
}