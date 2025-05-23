'use client'; // Required for useState

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import Link from 'next/link';

type AuthTab = 'login' | 'signup';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signup') {
      setActiveTab('signup');
    } else {
      setActiveTab('login');
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center">
      <div role="tablist" className="tabs tabs-boxed mb-4">
        <a 
          role="tab"
          className={`tab ${activeTab === 'login' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('login')}
        >
          Login
        </a> 
        <a 
          role="tab"
          className={`tab ${activeTab === 'signup' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('signup')}
        >
          Sign Up
        </a>
      </div>

      {activeTab === 'login' && <LoginForm />}
      {activeTab === 'signup' && <SignupForm />}

      <p className="mt-4 text-center">
        Or go back to <Link href="/" className="link link-primary">Home</Link>.
      </p>
    </div>
  );
} 