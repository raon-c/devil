'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    // Optionally, redirect to home or login page after sign out
    router.push('/'); 
  };

  // Attempt to get nickname from user_metadata, fallback to email
  const displayName = user?.user_metadata?.nickname || user?.email;

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="navbar-start">
        <Link href="/" className="btn btn-ghost text-xl">
          🎲 Raon Devils Hold&apos;em
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        {/* Can add other general navigation links here if needed */}
        {user && (
          <ul className="menu menu-horizontal px-1">
            <li><Link href="/lobby">Lobby</Link></li>
            {/* Add other game-related links here if user is logged in */}
          </ul>
        )}
      </div>

      <div className="navbar-end">
        {loading ? (
          <span className="loading loading-sm"></span>
        ) : user ? (
          <div className="flex items-center">
            {displayName && <span className="mr-3 hidden sm:inline">Welcome, {displayName}!</span>}
            <div className="dropdown dropdown-end">
              <button tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full bg-primary flex items-center justify-center text-primary-content">
                  {/* Placeholder for avatar - could be first letter of nickname/email */}
                  <span>{displayName ? displayName.charAt(0).toUpperCase() : 'U'}</span>
                </div>
              </button>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li className="sm:hidden"><span className="justify-between font-semibold">{displayName}</span></li>
                <li className="sm:hidden"><div className="divider my-0"></div></li>
                <li><Link href="/lobby" className="lg:hidden">Lobby</Link></li> {/* Show Lobby link in dropdown on smaller screens if logged in*/}
                {/* <li><Link href="/profile">Profile</Link></li> */}
                {/* <li><a>Settings</a></li> */}
                <li><button onClick={handleSignOut}>Logout</button></li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <Link href="/auth" className="btn btn-ghost">
              Login
            </Link>
            <Link href="/auth?tab=signup" className="btn btn-primary ml-2">
              Sign Up
            </Link> 
            {/* To make ?tab=signup work, AuthPage would need to read this query param */}
          </>
        )}
      </div>
    </div>
  );
} 