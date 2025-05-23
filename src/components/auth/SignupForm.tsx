'use client';

import React, { useState } from 'react';
import { supabase } from '@/utils/supabaseClient'; // Import Supabase client
// import Link from 'next/link'; // Not used for now

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!supabase) {
      setError('Supabase client is not initialized. Check your environment variables.');
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          nickname: nickname, // Store nickname in user_metadata
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      // This case can happen if email confirmation is required but the user already exists without being confirmed.
      // Supabase might return a user object but with an empty identities array.
      setMessage("User already exists but is not confirmed. Please check your email to confirm signup or try logging in.");
    } else if (data.user) {
      setMessage('Signup successful! Please check your email to verify your account.');
      // Optionally, clear form fields here
      setEmail('');
      setNickname('');
      setPassword('');
      setConfirmPassword('');
    } else {
      // Fallback for unexpected response structure, though Supabase usually provides user or error
      setError("An unexpected issue occurred during signup.");
    }
  };

  return (
    <div className="card bg-base-200 shadow-xl w-full max-w-md">
      <div className="card-body">
        <h2 className="card-title text-2xl justify-center mb-4">Create Account</h2>
        <form onSubmit={handleSignup}>
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
              <span className="label-text">Nickname</span>
            </label>
            <input 
              type="text" 
              placeholder="Your Nickname" 
              className="input input-bordered" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
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
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="input input-bordered" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
              disabled={loading}
            />
          </div>
          {message && <p className="mt-4 text-sm text-success">{message}</p>}
          {error && <p className="mt-4 text-sm text-error">{error}</p>}
          <div className="form-control mt-6">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <span className="loading loading-spinner mr-2"></span>}
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>
        </form>
        <p className="mt-4 text-sm text-center">
          Already have an account? {" "}
          {/* This should ideally trigger tab switch on AuthPage */}
          <span className="link link-secondary cursor-pointer" onClick={() => { /* TODO: Implement tab switch */ }}>
            Log in
          </span> 
        </p>
      </div>
    </div>
  );
} 