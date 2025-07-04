import { ObjectId } from 'mongodb';
import getDb from '../../lib/mongodb';
export default async function handler(req, res) {
  const db = await getDb();
  const coll = db.collection('transactions');
  switch (req.method) {
    case 'GET': {
      const list = await coll.find().sort({ date: -1 }).toArray();
      return res.status(200).json(list);
    }
    case 'POST': {
      const { amount, date, description, category } = req.body;
      if (!amount || !date || !category) {
        return res.status(400).json({ error: 'Amount, date, and category are required.' });
      }
      const doc = { amount: Number(amount), date: new Date(date), description: description||'', category };
      const result = await coll.insertOne(doc);
      return res.status(201).json({ ...doc, _id: result.insertedId });
    }
    case 'DELETE': {
      const { id } = req.query;
      await coll.deleteOne({ _id: new ObjectId(id) });
      return res.status(204).end();
    }
    default:
      res.setHeader('Allow', ['GET','POST','DELETE']);
      return res.status(405).end();
  }
}