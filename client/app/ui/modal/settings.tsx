'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/constants';
import { useContext } from 'react';
import { AuthContext } from '@/app/lib/auth_provider';

export default function Settings({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const { setAuthenticated } = useContext(AuthContext); // Access setAuthenticated from AuthContext

  const logOutHandler = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        localStorage.removeItem('user_info');
        setAuthenticated(false); // Update authenticated state
        router.push('/login'); // Redirect to the home page
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-auto w-full items-center">
        <h2 className="text-gray-400">Logout</h2>
        <div className="flex h-full flex-1"></div>
        <Link href='/'>
          <svg
            className="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Link>
      </div>
      <hr className="mx-auto my-2 h-px w-full rounded border-0 bg-gray-400" />
      <div className="flex items-center space-x-3 h-full">
        <div
          className="self-end mx-auto flex h-10 w-full shrink-0 items-center justify-center rounded-lg bg-red-600 text-gray-500 outline outline-2 outline-red-500 hover:bg-red-700 hover:outline-red-600"
          onClick={logOutHandler}
        >
          <Image
            src="/exit_w.png"
            width={30}
            height={30}
            alt="contacts"
          />
        </div>
      </div>
      {children}
    </div>
  );
}
