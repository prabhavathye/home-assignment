const Loader = ({ label = 'Processing…' }) => (
  <div className="flex items-center gap-3 text-slate text-sm">
    <span className="w-4 h-4 border-2 border-phosphor border-t-transparent rounded-full animate-spin" />
    {label}
  </div>
);

export default Loader;
