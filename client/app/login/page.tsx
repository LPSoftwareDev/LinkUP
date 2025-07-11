'use client';

import { API_URL } from "@/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useContext, useEffect } from 'react';
import { AuthContext, UserInfo } from '../lib/auth_provider'

export default function MainPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { authenticated } = useContext(AuthContext)
  const router = useRouter();

  useEffect(() => {
    if (authenticated) {
      router.push("/")
      return 
    }
  }, [authenticated, router])

  const submitHandler = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        const user: UserInfo = {
          username: data.username,
          id: data.id,
        };
        localStorage.setItem('user_info', JSON.stringify(user));
        router.push('/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-dvh w-screen items-center justify-center align-middle">
      <div className="flex h-auto w-96 flex-col justify-center rounded-xl bg-[#332F4B] p-4 align-middle">
        <form className="flex flex-col space-y-4" onSubmit={submitHandler}>
          <h1 className="text-gray-400 self-center text-3xl font-bold">welcome!</h1>
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex h-16 w-full rounded-xl bg-[#332F4B] pl-4 text-gray-50 placeholder-gray-400 outline outline-2 outline-[#443F64]"
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex h-16 w-full rounded-xl bg-[#332F4B] pl-4 text-gray-50 placeholder-gray-400 outline outline-2 outline-[#443F64]"
          />
          <div className="flex w-full flex-row space-x-4">
            <button
              type="submit"
              className="flex h-auto w-full items-center justify-center rounded-xl bg-blue-600 align-middle"
            >
              <p className="text-base tracking-wide text-white">Login</p>
            </button>
            <Link
              href="/register"
              className="flex h-16 w-full items-center justify-center rounded-xl bg-blue-600 align-middle"
            >
              <p className="text-base tracking-wide text-white">Register</p>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
