import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { customer, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-panelLight bg-panel/60 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-phosphor shadow-glow" />
          <span className="font-mono tracking-widest text-sm text-paper">SECURE<span className="text-phosphor">ATM</span></span>
        </div>

        {isAuthenticated && customer && (
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate uppercase tracking-widest">{customer.name}</p>
              <p className="font-mono text-sm text-phosphor">**** **** {customer.accountNumber.slice(-4)}</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
