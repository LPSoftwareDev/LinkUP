'use client';

import { useState, createContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserInfo = {
  username: string;
  id: string;
};

export const AuthContext = createContext<{
  authenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
  user: UserInfo;
  setUser: (user: UserInfo) => void;
}>({
  authenticated: false,
  setAuthenticated: () => { },
  user: { username: '', id: '' },
  setUser: () => { },
});

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo>({ username: '', id: '' });

  const router = useRouter();

  useEffect(() => {
    const userInfo = localStorage.getItem('user_info');

    if (!userInfo) {
      if (window.location.pathname !== '/register') {
        router.push('/login'); // Use router.push for navigation
        return;
      }
    } else {
      const user: UserInfo = JSON.parse(userInfo);
      if (user) {
        setUser({
          username: user.username,
          id: user.id,
        });
        console.log(user)
      }
      setAuthenticated(true);
    }
  }, [authenticated, router]); // Add router to the dependency array

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        setAuthenticated,
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
