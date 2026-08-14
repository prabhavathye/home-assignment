import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency } from '../components/BalanceDisplay.jsx';
import Loader from '../components/Loader.jsx';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

const Withdraw = () => {
  const { customer, refreshProfile } = useAuth();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/transactions/withdraw', { amount: Number(amount) });
      setResult(data);
      await refreshProfile();
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="screen-panel p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-2">Withdraw cash</h1>
        {customer && (
          <p className="text-center text-sm text-slate mb-8">
            Available: <span className="text-phosphor">{formatCurrency(customer.balance)}</span>
          </p>
        )}

        {error && (
          <div className="mb-6 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {result ? (
          <div className="text-center space-y-4">
            <p className="text-amber text-lg">Withdrawal successful</p>
            <p className="font-mono text-3xl">{formatCurrency(result.transaction.amount)}</p>
            <p className="text-slate text-sm">Remaining balance: {formatCurrency(result.balance)}</p>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setResult(null)} className="btn-secondary flex-1">Withdraw again</button>
              <Link to="/dashboard" className="btn-primary flex-1 text-center">Done</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((qa) => (
                <button
                  type="button"
                  key={qa}
                  onClick={() => setAmount(String(qa))}
                  className="btn-secondary text-xs py-2"
                >
                  {qa}
                </button>
              ))}
            </div>
            <div>
              <label className="field-label" htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                className="field-input font-mono text-xl"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="flex gap-3">
              <Link to="/dashboard" className="btn-secondary flex-1 text-center">Cancel</Link>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? <Loader label="Withdrawing…" /> : 'Withdraw'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Withdraw;
