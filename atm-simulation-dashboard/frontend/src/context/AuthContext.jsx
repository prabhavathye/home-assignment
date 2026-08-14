import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    const stored = localStorage.getItem('atm_customer');
    return stored ? JSON.parse(stored) : null;
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('atm_access_token'));
  const [preAuthToken, setPreAuthToken] = useState(null);
  const [pendingAccount, setPendingAccount] = useState(null); // masked account shown during PIN step

  const persistSession = (token, customerData) => {
    localStorage.setItem('atm_access_token', token);
    localStorage.setItem('atm_customer', JSON.stringify(customerData));
    setAccessToken(token);
    setCustomer(customerData);
  };

  const clearSession = () => {
    localStorage.removeItem('atm_access_token');
    localStorage.removeItem('atm_customer');
    setAccessToken(null);
    setCustomer(null);
    setPreAuthToken(null);
    setPendingAccount(null);
  };

  // Step 1: email + password
  const loginWithPassword = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login/password', { email, password });
    setPreAuthToken(data.preAuthToken);
    setPendingAccount(data.maskedAccount);
    return data;
  }, []);

  // Step 2: 4-digit PIN, using the pre-auth token from step 1
  const loginWithPin = useCallback(
    async (pin) => {
      const { data } = await api.post(
        '/auth/login/pin',
        { pin },
        { headers: { Authorization: `Bearer ${preAuthToken}` } }
      );
      persistSession(data.accessToken, data.customer);
      setPreAuthToken(null);
      setPendingAccount(null);
      return data;
    },
    [preAuthToken]
  );

  const signup = useCallback(async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if the network call fails, clear the local session
    } finally {
      clearSession();
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data } = await api.get('/account/profile');
    localStorage.setItem('atm_customer', JSON.stringify(data.customer));
    setCustomer(data.customer);
    return data.customer;
  }, []);

  const value = {
    customer,
    accessToken,
    pendingAccount,
    isAwaitingPin: !!preAuthToken,
    isAuthenticated: !!accessToken,
    loginWithPassword,
    loginWithPin,
    signup,
    logout,
    refreshProfile,
    resetLoginFlow: () => {
      setPreAuthToken(null);
      setPendingAccount(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
