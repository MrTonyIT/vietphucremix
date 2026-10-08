import React, { useState } from 'react';
import { LogIn, LogOut, Cloud, CloudCheck, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';

export const UserAuthHeader: React.FC = () => {
  const { user, loading, signInWithGoogle, logout, cloudLookbooks } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in failed:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await logout();
    } catch (err) {
      console.error('Sign-out failed:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-xs text-stone-400 bg-stone-900/60 px-3 py-1.5 rounded-full border border-stone-800">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
        <span>Đang kiểm tra tài khoản...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        type="button"
        className="flex items-center space-x-2 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-900/60 to-stone-900 border border-amber-500/40 text-amber-200 hover:text-white hover:border-amber-400 transition-all shadow-md hover:shadow-amber-900/30 cursor-pointer disabled:opacity-60"
        title="Đăng nhập bằng tài khoản Google để đồng bộ Lookbook lên đám mây Firestore"
      >
        {isSigningIn ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
        ) : (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.54 0 2.94.57 4.02 1.51l3.01-3.01C17.2 1.83 14.77 1 12 1 7.48 1 3.65 3.59 1.78 7.37l3.66 2.84C6.32 7.3 8.94 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.28c0-.85-.08-1.68-.22-2.48H12v4.7h6.48c-.28 1.48-1.12 2.74-2.38 3.59l3.68 2.86c2.15-1.99 3.72-4.91 3.72-8.67z"
            />
            <path
              fill="#FBBC05"
              d="M5.44 14.79C5.16 13.93 5 13 5 12s.16-1.93.44-2.79L1.78 6.37C.65 8.63 0 10.24 0 12s.65 3.37 1.78 5.63l3.66-2.84z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.68-2.86c-1.07.72-2.44 1.15-4.25 1.15-3.06 0-5.68-2.3-6.56-5.21L1.78 16c1.87 3.78 5.7 6.37 10.22 6.37z"
            />
          </svg>
        )}
        <span>Đăng nhập Google</span>
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-2 bg-stone-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-emerald-500/30 text-xs shadow-md">
      {/* User Avatar */}
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName || 'Avatar'}
          className="w-5 h-5 rounded-full border border-emerald-400 object-cover"
        />
      ) : (
        <div className="w-5 h-5 rounded-full bg-emerald-800/80 flex items-center justify-center text-[10px] text-emerald-200 font-bold">
          {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3" />}
        </div>
      )}

      {/* User Name & Cloud Sync Badge */}
      <div className="flex items-center space-x-1.5">
        <span className="text-stone-200 font-medium max-w-[100px] sm:max-w-[130px] truncate">
          {user.displayName?.split(' ')[0] || 'Tài khoản'}
        </span>
        <span
          className="flex items-center space-x-0.5 text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30"
          title={`Đã đồng bộ Firestore: ${cloudLookbooks.length} bộ Lookbook`}
        >
          <Cloud className="w-2.5 h-2.5" />
          <span>Cloud ({cloudLookbooks.length})</span>
        </span>
      </div>

      {/* Logout button */}
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        type="button"
        className="text-stone-400 hover:text-rose-300 transition-colors p-1 rounded-full hover:bg-stone-800/60 cursor-pointer disabled:opacity-50"
        title="Đăng xuất"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
