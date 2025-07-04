export default function SummaryCards({ data, budgets }) {
  const total = data.reduce((sum, t) => sum + t.amount, 0);
  const byCategory = data.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4 border rounded">
        <h3>Total Spent</h3>
        <p>₹{total}</p>
      </div>
      <div className="p-4 border rounded">
        <h3>By Category</h3>
        <ul>
          {Object.entries(byCategory).map(([cat,amt]) => <li key={cat}>{cat}: ₹{amt}</li>)}
        </ul>
      </div>
      <div className="p-4 border rounded">
        <h3>Budgets</h3>
        <ul>
          {Object.entries(budgets).map(([cat,amt]) => <li key={cat}>{cat}: ₹{amt}</li>)}
        </ul>
      </div>
    </div>
  );
}