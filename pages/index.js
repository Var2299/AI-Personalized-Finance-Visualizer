import { useEffect, useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import MonthlyChart from '../components/MonthlyChart';
import CategoryPieChart from '../components/CategoryPieChart';
import SummaryCards from '../components/SummaryCards';
import BudgetForm from '../components/BudgetForm';
import BudgetVsActualChart from '../components/BudgetVsActualChart';
import Insights from '../components/Insights';

const CATEGORIES = ['Food','Rent','Utilities','Transport','Other'];

export default function Home() {
  const [txns, setTxns] = useState([]);
  const [budgets, setBudgets] = useState({});

  useEffect(() => {
    fetch('/api/transactions').then(r => r.json()).then(setTxns);
    fetch('/api/budgets').then(r => r.json()).then(list => {
      setBudgets(Object.fromEntries(list.map(b => [b.category, b.amount])));
    });
  }, []);

  const addTxn = async data => {
    const res = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const newTxn = await res.json();
    setTxns([newTxn, ...txns]);
  };
   
  const setBudget = async (category, amount) => {
    await fetch('/api/budgets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category, amount }) });
    setBudgets(prev => ({ ...prev, [category]: Number(amount) }));
  };
   
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");

  const fetchSummary = async () => {
    setLoading(true);
    const res = await fetch("/api/ai-summary", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ transactions: txns })
    });
    const { summary } = await res.json();
    setText(summary);
    setLoading(false);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Personal Finance Visualizer</h1>
        <p>Track, categorize, and budget your expenses in one place.</p>
      </header>

      <div className="card">
        <div className="card-header">
          <h2>New Transaction</h2>
        </div>
        <div className="card-content">
          <TransactionForm categories={CATEGORIES} onSubmit={addTxn} />
        </div>
      </div>

      <SummaryCards data={txns} budgets={budgets} />

      <div className="card">
        <div className="card-content">
          <BudgetForm categories={CATEGORIES} budgets={budgets} onSave={setBudget} />
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><h2>Budget vs Actual</h2></div>
          <div className="card-content"><BudgetVsActualChart data={txns} budgets={budgets} /></div>
        </div>
        <div className="card">
          <div className="card-header"><h2>Monthly Expenses</h2></div>
          <div className="card-content"><MonthlyChart data={txns} /></div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><h2>Category Breakdown</h2></div>
          <div className="card-content"><CategoryPieChart data={txns} categories={CATEGORIES} /></div>
        </div>
        <div className="card">
          <div className="card-header"><h2>Spending Insights</h2></div>
          <div className="card-content"><Insights data={txns} budgets={budgets} /></div>
        </div>
      </div>

<div className="card ai-summary-card">
  <div className="card-header">
    <h2>💡 AI‑Powered Insights</h2>
  </div>
  <div className="card-content">
    <button className="ai-btn" onClick={fetchSummary} disabled={loading}>
      {loading ? "Thinking..." : "Generate AI Summary"}
    </button>
    {text && (
  <div className="ai-output enhanced">
    {text.split("\n").map((line, idx) => (
      <p key={idx} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
    ))}
  </div>
)}

  </div>
</div>


      <div className="card">
        <div className="card-header"><h2>All Transactions</h2></div>
        <div className="card-content">
          <TransactionList items={txns} onDelete={id => {
            fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
            setTxns(txns.filter(t => t._id !== id));
          }} />
        </div>
      </div>
    </div>
  );
}