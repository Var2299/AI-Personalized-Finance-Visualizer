import { useState } from 'react';
export default function BudgetForm({ categories, budgets, onSave }) {
  const [form, setForm] = useState({ category:'', amount:'' });
  const save = e => {
    e.preventDefault();
    if(form.category&&form.amount) onSave(form.category, form.amount);
    setForm({category:'',amount:''});
  };
  return (
    <form onSubmit={save} className="flex gap-3 items-end">
      <select
        value={form.category}
        onChange={e=>setForm(f=>({...f,category:e.target.value}))}
        className="p-2 border rounded"
      >
        <option value="">Select category</option>
        {categories.map(c=> <option key={c} value={c}>{c} (₹{budgets[c]||0})</option>)}
      </select>
      <input
        type="number"
        placeholder="Budget amount"
        value={form.amount}
        onChange={e=>setForm(f=>({...f,amount:e.target.value}))}
        className="p-2 border rounded"
      />
      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Set Budget</button>
    </form>
  );
}