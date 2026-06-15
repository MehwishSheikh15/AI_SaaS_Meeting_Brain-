import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { UserAccount } from '../types';

const USERS_STORAGE_KEY = 'meeting-brain-users-list-v1';
const SESSION_STORAGE_KEY = 'meeting-brain-session-v1';

interface AuthPortalProps {
  onAuthSuccess: (user: UserAccount) => void;
}

const AVATAR_STYLINGS = [
  { seed: 'blue', label: 'Blue Breeze', bg: 'bg-blue-100 text-blue-700 border-blue-200' },
  { seed: 'emerald', label: 'Emerald Zen', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { seed: 'purple', label: 'Cosmic Slate', bg: 'bg-purple-100 text-purple-700 border-purple-200' },
  { seed: 'rose', label: 'Crimson Radiant', bg: 'bg-rose-100 text-rose-700 border-rose-200' },
  { seed: 'amber', label: 'Amber Warmth', bg: 'bg-amber-100 text-amber-700 border-amber-200' },
];

export default function AuthPortal({ onAuthSuccess }: AuthPortalProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration and Logging forms state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('blue');
  
  // Notice & Feedback Banner States
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Auto-seed a demonstration account if empty
  useEffect(() => {
    const rawUsersList = localStorage.getItem(USERS_STORAGE_KEY);
    let users: UserAccount[] = [];
    if (rawUsersList) {
      try {
        users = JSON.parse(rawUsersList);
      } catch {
        users = [];
      }
    }

    const demoExists = users.some(u => u.email === 'demo@meetingbrain.com');
    if (!demoExists) {
      const demoAccount: UserAccount = {
        id: 'usr-demo',
        name: 'Alex Mercer',
        email: 'demo@meetingbrain.com',
        password: 'password123',
        createdAt: new Date().toISOString(),
        avatarSeed: 'purple'
      };
      users.push(demoAccount);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }, []);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const emailTrimmed = email.trim().toLowerCase();
    const passwordTrimmed = password.trim();

    if (!emailTrimmed || !passwordTrimmed) {
      setStatusMessage({ text: 'Please fill in all standard credentials fields.', type: 'error' });
      return;
    }

    if (!isLoginView && !fullName.trim()) {
      setStatusMessage({ text: 'Please enter your display name to configure your corporate account profile.', type: 'error' });
      return;
    }

    // Retrieve active registered base
    const rawUsersList = localStorage.getItem(USERS_STORAGE_KEY);
    let usersList: UserAccount[] = [];
    try {
      usersList = rawUsersList ? JSON.parse(rawUsersList) : [];
    } catch {
      usersList = [];
    }

    if (isLoginView) {
      // Find authentic matching credentials
      const matchedUser = usersList.find(u => u.email === emailTrimmed && u.password === passwordTrimmed);
      if (matchedUser) {
        setStatusMessage({ text: 'Session verified. Launching analytical workspace...', type: 'success' });
        setTimeout(() => {
          onAuthSuccess(matchedUser);
        }, 800);
      } else {
        setStatusMessage({ text: 'Incorrect email address or password. For demo quick testing, you can use: demo@meetingbrain.com with password123.', type: 'error' });
      }
    } else {
      // Registration flow
      const userAlreadyExists = usersList.some(u => u.email === emailTrimmed);
      if (userAlreadyExists) {
        setStatusMessage({ text: 'This email address is already configured with another occupant profile.', type: 'error' });
        return;
      }

      if (passwordTrimmed.length < 5) {
        setStatusMessage({ text: 'Security checkpoint: Passwords must consist of at least 5 standard characters.', type: 'error' });
        return;
      }

      const newAccountUser: UserAccount = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        name: fullName.trim(),
        email: emailTrimmed,
        password: passwordTrimmed,
        createdAt: new Date().toISOString(),
        avatarSeed: selectedAvatar
      };

      usersList.push(newAccountUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersList));
      
      setStatusMessage({ text: 'Account created with premium credentials! Proceeding to dynamic workspace...', type: 'success' });
      setTimeout(() => {
        onAuthSuccess(newAccountUser);
      }, 900);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-10 px-4">
      <div id="auth-portal-card" className="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl shadow-md p-6 sm:p-8 space-y-6 animate-fade-in-up">
        
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl mb-1 shadow-3xs">
            <BrainCircuit className="w-6.5 h-6.5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {isLoginView ? 'Welcome to Meeting Brain' : 'Create Intelligence Account'}
          </h2>
          <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto">
            {isLoginView 
              ? 'Sign in to access your secure meeting summaries, historical database, and dialogue companion'
              : 'Configure your private corporate profile to scope, export, and secure processed briefings'
            }
          </p>
        </div>

        {/* Status Messages */}
        {statusMessage && (
          <div className={`p-3 rounded-lg border text-xs flex items-start space-x-2 animate-pulse ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 m-0.5" />
            ) : (
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 m-0.5" />
            )}
            <span className="font-medium leading-relaxed">{statusMessage.text}</span>
          </div>
        )}

        {/* Quick Demo Pre-seed Reminder */}
        {isLoginView && !statusMessage && (
          <div className="bg-blue-50/40 border border-blue-100/50 p-2.5 rounded-lg text-[11px] text-blue-700 text-center leading-relaxed font-sans">
            💡 <strong>Quick Demo Credentials</strong>: Log in with <span className="font-mono bg-blue-100/60 px-1 py-0.5 rounded">demo@meetingbrain.com</span> and password <span className="font-mono bg-blue-100/60 px-1 py-0.5 rounded">password123</span> to inspect isolation.
          </div>
        )}

        {/* Main Authentication Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          
          {/* Email field */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@corporate.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-hidden rounded-lg text-xs font-sans transition-all"
              />
            </div>
          </div>

          {/* Full Name field (Only during Registration) */}
          {!isLoginView && (
            <div className="space-y-1.5 text-left animate-fade-in-up">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Display Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required={!isLoginView}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-hidden rounded-lg text-xs font-sans transition-all"
                />
              </div>
            </div>
          )}

          {/* Password field */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
              {isLoginView && (
                <span className="text-[10px] text-blue-505 select-none hover:underline cursor-not-allowed">Forgot Password?</span>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-hidden rounded-lg text-xs font-sans transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Avatar selection style (Only during registration) */}
          {!isLoginView && (
            <div className="space-y-2 text-left animate-fade-in-up">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Choose Avatar Accent</label>
              <div className="flex flex-wrap gap-2.5">
                {AVATAR_STYLINGS.map((style) => (
                  <button
                    key={style.seed}
                    type="button"
                    onClick={() => setSelectedAvatar(style.seed)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1 cursor-pointer ${
                      selectedAvatar === style.seed
                        ? 'bg-blue-600 text-white border-blue-600 shadow-3xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      style.seed === 'blue' ? 'bg-blue-500' :
                      style.seed === 'emerald' ? 'bg-emerald-500' :
                      style.seed === 'purple' ? 'bg-purple-500' :
                      style.seed === 'rose' ? 'bg-rose-500' : 'bg-amber-500'
                    }`} />
                    <span>{style.seed.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Key CTA */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-lg transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer mt-2"
          >
            <span>{isLoginView ? 'Authenticate Profile' : 'Instantiate Secure Account'}</span>
            <ArrowRight className="w-4 h-4 text-blue-200" />
          </button>
        </form>

        {/* View Toggle Footer link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-slate-400 text-xs">
            {isLoginView ? "Don't have a secure workspace?" : 'Already configured an account?'}
            <button
              onClick={() => {
                setIsLoginView(!isLoginView);
                setStatusMessage(null);
                setEmail('');
                setFullName('');
                setPassword('');
              }}
              className="text-blue-600 font-bold hover:underline ml-1 cursor-pointer inline-flex items-center"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1" />
              {isLoginView ? 'Register as occupant' : 'Sign In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
