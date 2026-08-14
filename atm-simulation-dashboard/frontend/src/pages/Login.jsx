import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PinPad from '../components/PinPad.jsx';
import Loader from '../components/Loader.jsx';

const Login = () => {
  const { loginWithPassword, loginWithPin, isAwaitingPin, pendingAccount, resetLoginFlow } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithPassword(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithPin(pin);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="screen-panel p-8 w-full max-w-md">
        <p className="field-label text-center mb-1">
          {isAwaitingPin ? 'Step 2 of 2' : 'Step 1 of 2'}
        </p>
        <h1 className="text-2xl font-semibold text-center mb-8">
          {isAwaitingPin ? 'Enter your PIN' : 'Welcome back'}
        </h1>

        {error && (
          <div className="mb-6 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {!isAwaitingPin ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                className="field-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader label="Verifying…" /> : 'Continue'}
            </button>
            <p className="text-center text-sm text-slate">
              New here?{' '}
              <Link to="/signup" className="text-phosphor hover:underline">
                Open an account
              </Link>
            </p>
          </form>
        ) : (
          <div className="space-y-6">
            <p className="text-center text-sm text-slate font-mono">Account {pendingAccount}</p>
            <PinPad value={pin} onChange={setPin} disabled={loading} />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  resetLoginFlow();
                  setPin('');
                  setError('');
                }}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePinSubmit}
                disabled={pin.length !== 4 || loading}
                className="btn-primary flex-1"
              >
                {loading ? <Loader label="Verifying…" /> : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
