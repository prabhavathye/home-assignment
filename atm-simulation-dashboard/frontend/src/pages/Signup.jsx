import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PinPad from '../components/PinPad.jsx';
import Loader from '../components/Loader.jsx';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', initialDeposit: '' });
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1); // 1 = details, 2 = choose PIN
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const goToPinStep = (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setStep(2);
  };

  const handleSignup = async () => {
    setError('');
    if (pin !== confirmPin) {
      setError('PIN and confirmation do not match.');
      return;
    }
    setLoading(true);
    try {
      const data = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        pin,
        confirmPin,
        initialDeposit: form.initialDeposit ? Number(form.initialDeposit) : 0,
      });
      setSuccess(`Account created! Your account number is ${data.accountNumber}. Redirecting to login…`);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="screen-panel p-8 w-full max-w-md">
        <p className="field-label text-center mb-1">Step {step} of 2</p>
        <h1 className="text-2xl font-semibold text-center mb-8">
          {step === 1 ? 'Open an account' : 'Choose a 4-digit PIN'}
        </h1>

        {error && (
          <div className="mb-6 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 text-sm text-phosphor bg-phosphor/10 border border-phosphor/30 rounded-lg px-4 py-3">
            {success}
          </div>
        )}

        {step === 1 && !success && (
          <form onSubmit={goToPinStep} className="space-y-5">
            <div>
              <label className="field-label" htmlFor="name">Full name</label>
              <input id="name" required className="field-input" value={form.name} onChange={update('name')} />
            </div>
            <div>
              <label className="field-label" htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                required
                className="field-input"
                value={form.email}
                onChange={update('email')}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                required
                className="field-input"
                value={form.password}
                onChange={update('password')}
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="confirm-password">Confirm password</label>
              <input
                id="confirm-password"
                type="password"
                required
                className="field-input"
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="initial-deposit">Initial deposit (optional)</label>
              <input
                id="initial-deposit"
                type="number"
                min="0"
                step="0.01"
                className="field-input"
                value={form.initialDeposit}
                onChange={update('initialDeposit')}
                placeholder="0.00"
              />
            </div>
            <button type="submit" className="btn-primary w-full">Continue</button>
            <p className="text-center text-sm text-slate">
              Already have an account?{' '}
              <Link to="/login" className="text-phosphor hover:underline">Log in</Link>
            </p>
          </form>
        )}

        {step === 2 && !success && (
          <div className="space-y-6">
            <div>
              <p className="text-center text-sm text-slate mb-4">Enter a 4-digit PIN</p>
              <PinPad value={pin} onChange={setPin} disabled={loading} />
            </div>
            <div>
              <p className="text-center text-sm text-slate mb-4">Confirm your PIN</p>
              <PinPad value={confirmPin} onChange={setConfirmPin} disabled={loading} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                Back
              </button>
              <button
                type="button"
                onClick={handleSignup}
                disabled={pin.length !== 4 || confirmPin.length !== 4 || loading}
                className="btn-primary flex-1"
              >
                {loading ? <Loader label="Creating account…" /> : 'Create account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
