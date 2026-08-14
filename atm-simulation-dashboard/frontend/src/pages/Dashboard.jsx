import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import BalanceDisplay from '../components/BalanceDisplay.jsx';
import TransactionReceipt from '../components/TransactionReceipt.jsx';
import Loader from '../components/Loader.jsx';

const Dashboard = () => {
  const { customer, refreshProfile } = useAuth();
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await refreshProfile();
        const { data } = await api.get('/transactions/history?limit=5');
        setRecent(data.transactions);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!customer) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div>
        <p className="text-slate text-sm">Good to see you,</p>
        <h1 className="text-3xl font-semibold">{customer.name}</h1>
      </div>

      <BalanceDisplay balance={customer.balance} accountNumber={customer.accountNumber} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/deposit" className="btn-secondary text-center">Deposit</Link>
        <Link to="/withdraw" className="btn-secondary text-center">Withdraw</Link>
        <Link to="/transfer" className="btn-secondary text-center">Transfer</Link>
        <Link to="/history" className="btn-secondary text-center">History</Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm uppercase tracking-widest text-slate">Recent activity</h2>
          <Link to="/history" className="text-sm text-phosphor hover:underline">View all</Link>
        </div>

        {loading ? (
          <Loader label="Loading transactions…" />
        ) : recent.length === 0 ? (
          <p className="text-slate text-sm">No transactions yet. Make your first deposit to get started.</p>
        ) : (
          <div className="space-y-3">
            {recent.map((txn) => (
              <TransactionReceipt key={txn._id} txn={txn} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
