import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export default function BudgetVsActualChart({ data, budgets }) {
  const COLORS = ['#1e3a8a', '#f97316'];
  const byCat = Object.entries(budgets).map(([cat, bud]) => {
    const actual = data.filter(t => t.category === cat)
                       .reduce((sum, t) => sum + t.amount, 0);
    return { category: cat, Actual: actual, Budget: bud };
  });
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={byCat} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <XAxis dataKey="category" stroke="#555" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Actual" fill={COLORS[0]} />
        <Bar dataKey="Budget" fill={COLORS[1]} />
      </BarChart>
    </ResponsiveContainer>
  );
}