export default function Insights({ data, budgets }) {
  return (
    <div className="space-y-1">
      <h3 className="text-xl">Spending Insights</h3>
      {Object.entries(budgets).map(([cat, bud]) => {
        const spent = data.filter(t=>t.category===cat).reduce((s,t)=>s+t.amount,0);
        const pct = bud ? Math.round((spent/bud)*100) : 0;
        return (
          <p key={cat}>
            {cat}: ₹{spent} / ₹{bud} ({pct}% used)
          </p>
        );
      })}
    </div>
  );
}