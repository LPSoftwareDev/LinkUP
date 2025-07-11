'use client';

import React, { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      // Registration succeeded, redirect to login
      router.push("/login");
    } else {
      // Handle errors as needed
      console.error("Registration failed");
    }
  };

  return (
    <div
      id="container"
      className="flex h-dvh w-screen flex-col items-center justify-center align-middle"
    >
      <div
        id="register-container"
        className="flex h-auto w-96 flex-col justify-center space-y-4 rounded-xl bg-[#332F4B] p-4 align-middle"
      >
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            name="username"
            placeholder="Username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            className="flex h-16 w-full rounded-xl bg-[#332F4B] pl-4 text-gray-50 placeholder-gray-400 outline outline-2 outline-[#443F64]"
          />
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="flex h-16 w-full rounded-xl bg-[#332F4B] pl-4 text-gray-50 placeholder-gray-400 outline outline-2 outline-[#443F64]"
          />
          <input
            name="password"
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="flex h-16 w-full rounded-xl bg-[#332F4B] pl-4 text-gray-50 placeholder-gray-400 outline outline-2 outline-[#443F64]"
          />
          <button
            type="submit"
            className="flex h-16 w-full items-center justify-center rounded-xl bg-blue-600 align-middle"
          >
            <p className="text-base font-semibold tracking-wide text-white">
              Register
            </p>
          </button>
        </form>
        <Link href="/login">
          <p className="cursor-pointer self-start text-sm text-blue-400 hover:underline">
            Back to Login
          </p>
        </Link>
      </div>
    </div>
  );
}
