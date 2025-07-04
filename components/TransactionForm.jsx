import { useState } from 'react';

export default function TransactionForm({ categories, onSubmit }) {
  const [form, setForm] = useState({ amount:'', date:'', description:'', category:'' });
  const [err, setErr] = useState('');

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const submit = e => {
    e.preventDefault();
    if (!form.amount || !form.date || !form.category) {
      return setErr('Please fill amount, date, and category.');
    }
    setErr('');
    onSubmit(form);
    setForm({ amount:'', date:'', description:'', category:'' });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {err && <p className="col-span-full text-red-600">{err}</p>}
      <input name="amount" value={form.amount} onChange={handle}
        placeholder="Amount" type="number"
        className="p-2 border rounded" />
      <input name="date" value={form.date} onChange={handle}
        type="date" className="p-2 border rounded" />
      <select name="category" value={form.category} onChange={handle}
        className="p-2 border rounded">
        <option value="">Select category</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        Add Transaction
      </button>
      <input name="description" value={form.description} onChange={handle}
        placeholder="Description (optional)" className="col-span-full p-2 border rounded" />
    </form>
  );
}