import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export default function CategoryPieChart({ data, categories }) {
  const COLORS = ['#1e3a8a', '#2563eb', '#f97316', '#10b981', '#ef4444'];
  const byCat = categories.map((cat, idx) => ({
    name: cat,
    value: data.filter(t => t.category === cat)
                .reduce((sum, t) => sum + t.amount, 0)
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie dataKey="value" data={byCat} nameKey="name" cx="50%" cy="50%" outerRadius={80}>
          {byCat.map((entry, idx) => (
            <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend layout="horizontal" verticalAlign="bottom" />
      </PieChart>
    </ResponsiveContainer>
  );
}