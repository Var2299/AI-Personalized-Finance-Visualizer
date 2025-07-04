import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
export default function MonthlyChart({ data }) {
  const COLORS = ['#2563eb'];
  const byMonth = data.reduce((acc, { amount, date }) => {
    const m = new Date(date).toISOString().slice(0, 7);
    acc[m] = (acc[m] || 0) + amount;
    return acc;
  }, {});
  const chartData = Object.entries(byMonth).map(([month, total]) => ({ month, total }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <XAxis dataKey="month" stroke="#555" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" fill={COLORS[0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}