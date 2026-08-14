import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import TransactionReceipt from '../components/TransactionReceipt.jsx';
import Loader from '../components/Loader.jsx';

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/transactions/history?page=${page}&limit=10`)
      .then(({ data }) => {
        setTransactions(data.transactions);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Transaction history</h1>

      {loading ? (
        <Loader label="Loading transactions…" />
      ) : transactions.length === 0 ? (
        <p className="text-slate text-sm">No transactions on this page.</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((txn) => (
            <TransactionReceipt key={txn._id} txn={txn} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            className="btn-secondary text-sm py-2 px-4 disabled:opacity-30"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-sm text-slate font-mono">
            {page} / {totalPages}
          </span>
          <button
            className="btn-secondary text-sm py-2 px-4 disabled:opacity-30"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default History;
