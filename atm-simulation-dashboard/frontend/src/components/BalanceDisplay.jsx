const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

const BalanceDisplay = ({ balance, accountNumber }) => (
  <div className="screen-panel p-8 text-center">
    <p className="field-label mb-3">Available balance</p>
    <p className="font-mono text-5xl text-phosphor tracking-tight">{formatCurrency(balance)}</p>
    <p className="font-mono text-xs text-slate mt-4 tracking-widest">ACCOUNT · {accountNumber}</p>
  </div>
);

export default BalanceDisplay;
export { formatCurrency };
