export default function TransactionList({ items, onDelete }) {
  if (items.length === 0) return <p>No transactions yet.</p>;
  return (
    <ul className="divide-y">
      {items.map(tx => (
        <li key={tx._id} className="flex justify-between py-2">
          <div>
            <p>₹{tx.amount} — {tx.category}</p>
            <span className="text-gray-500 text-sm">
              {new Date(tx.date).toLocaleDateString()}
            </span>
            <p className="text-sm">{tx.description}</p>
          </div>
          <button onClick={() => onDelete(tx._id)} className="text-red-500">
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}