import { formatCurrency } from './BalanceDisplay.jsx';

const TYPE_LABEL = {
  deposit: 'Deposit',
  withdraw: 'Withdrawal',
  'transfer-out': 'Transfer sent',
  'transfer-in': 'Transfer received',
};

const TYPE_SIGN = {
  deposit: '+',
  withdraw: '−',
  'transfer-out': '−',
  'transfer-in': '+',
};

const TYPE_COLOR = {
  deposit: 'text-phosphor',
  withdraw: 'text-amber',
  'transfer-out': 'text-amber',
  'transfer-in': 'text-phosphor',
};

const TransactionReceipt = ({ txn }) => {
  const date = new Date(txn.createdAt);

  return (
    <div className="receipt p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-paper">{TYPE_LABEL[txn.type] || txn.type}</p>
        <p className="text-xs text-slate mt-1">
          {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        {txn.counterpartyAccount && (
          <p className="font-mono text-xs text-slate mt-1">Acct **** {txn.counterpartyAccount.slice(-4)}</p>
        )}
      </div>
      <div className="text-right">
        <p className={`font-mono text-lg ${TYPE_COLOR[txn.type] || 'text-paper'}`}>
          {TYPE_SIGN[txn.type]}
          {formatCurrency(txn.amount)}
        </p>
        <p className="text-xs text-slate mt-1">Bal {formatCurrency(txn.balanceAfter)}</p>
      </div>
    </div>
  );
};

export default TransactionReceipt;
