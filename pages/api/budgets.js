import { ObjectId } from 'mongodb';
import getDb from '../../lib/mongodb';
export default async function handler(req, res) {
  const db = await getDb();
  const coll = db.collection('budgets');
  switch (req.method) {
    case 'GET': {
      const list = await coll.find().toArray();
      return res.status(200).json(list);
    }
    case 'POST': {
      const { category, amount } = req.body;
      if (!category || !amount) {
        return res.status(400).json({ error: 'Category and amount required.' });
      }
      const doc = { category, amount: Number(amount) };
      const result = await coll.updateOne(
        { category },
        { $set: doc },
        { upsert: true }
      );
      return res.status(200).json(doc);
    }
    default:
      res.setHeader('Allow', ['GET','POST']);
      return res.status(405).end();
  }
}