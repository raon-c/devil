'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // For redirection
import { supabase } from '@/utils/supabaseClient'; // Import Supabase client

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!supabase) {
      setError('Supabase client is not initialized. Check your environment variables.');
      setLoading(false);
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      if (signInError.message === "Email not confirmed") {
        setError("Email not confirmed. Please check your inbox to confirm your email address.");
      } else {
        setError(signInError.message);
      }
    } else if (data.user) {
      setMessage('Login successful! Redirecting...');
      // Clear form fields
      setEmail('');
      setPassword('');
      // Redirect to lobby or dashboard after a short delay
      setTimeout(() => {
        router.push('/lobby'); // Redirect to the lobby page
      }, 1000);
    } else {
      setError("An unexpected issue occurred during login.");
    }
  };

  return (
    <div className="card bg-base-200 shadow-xl w-full max-w-md">
      <div className="card-body">
        <h2 className="card-title text-2xl justify-center mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input 
              type="email" 
              placeholder="your@email.com" 
              className="input input-bordered" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              disabled={loading}
            />
          </div>
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="input input-bordered" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              disabled={loading}
            />
          </div>
          {message && <p className="mt-4 text-sm text-success">{message}</p>}
          {error && <p className="mt-4 text-sm text-error">{error}</p>}
          <div className="form-control mt-6">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <span className="loading loading-spinner mr-2"></span>}
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        <p className="mt-4 text-sm text-center">
          Don&apos;t have an account?{" "}
          {/* This should ideally trigger tab switch on AuthPage */}
          <span className="link link-secondary cursor-pointer" onClick={() => { /* TODO: Implement tab switch */ }}>
            Sign up
          </span> 
        </p>
      </div>
    </div>
  );
} 