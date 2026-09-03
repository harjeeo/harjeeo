import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { login, register } from '../lib/api';
import type { ApiUser } from '../lib/api';

type AuthContextValue = {
  token: string | null;
  user: ApiUser | null;
  ready: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'jeeo_token';
const GUEST_KEY = 'jeeo_guest_credentials';

/**
 * There's no login/register UI yet, so until that's built we transparently
 * create (or reuse) a guest account per browser and store its JWT, so the
 * chat screens have a real authenticated backend to talk to.
 */
async function bootstrapGuestSession(): Promise<{ token: string; user: ApiUser }> {
  const existingToken = localStorage.getItem(TOKEN_KEY);
  const storedCredentials = localStorage.getItem(GUEST_KEY);

  if (existingToken && storedCredentials) {
    const { email, password } = JSON.parse(storedCredentials);
    try {
      return await login(email, password);
    } catch {
      // token/credentials stale, fall through to create a fresh guest
    }
  }

  const email = `guest-${crypto.randomUUID()}@jeeo.local`;
  const password = crypto.randomUUID();
  const result = await register(email, password);
  localStorage.setItem(GUEST_KEY, JSON.stringify({ email, password }));
  return result;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    bootstrapGuestSession()
      .then(({ token, user }) => {
        localStorage.setItem(TOKEN_KEY, token);
        setToken(token);
        setUser(user);
      })
      .catch((err) => {
        console.error('Failed to establish a session with the backend', err);
      })
      .finally(() => setReady(true));
  }, []);

  return <AuthContext.Provider value={{ token, user, ready }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
