'use client';

import { useState, FormEvent } from 'react';
import { adminAuthService } from '@/services/api';
import Image from 'next/image';
import { User, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react';

export default function AdminLoginPage() {
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [error,         setError]         = useState<string | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [showPassword,  setShowPassword]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminAuthService.login({ email, password });
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 150);
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ?? 'Invalid credentials.';
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side: Image */}
      <div className="hidden lg:block lg:w-[50%] relative bg-[#fdf8f1]">
        <Image 
          src="/public_Image/MybLoom.jpg" 
          alt="Bloom Parfums Floral" 
          fill 
          className="object-cover" 
          priority
        />
      </div>

      {/* Right Side: Login Panel */}
      <div className="w-full lg:w-[50%] flex flex-col items-center justify-center bg-[#fff4f6] relative p-6">
        
        {/* Main Box */}
        <div className="bg-white px-8 py-14 md:px-14 md:py-16 shadow-[0_4px_30px_rgba(0,0,0,0.03)] w-full max-w-[480px]">
          
          {/* Logo */}
          <div className="mb-6 flex justify-start">
            <Image
              src="/logo.png"
              alt="MyBloom Logo"
              width={140}
              height={40}
              className="object-contain h-[35px] w-auto"
            />
          </div>

          <div className="mb-10">
            <h1 className="text-[22px] font-serif font-bold text-[#3a3a3a] tracking-wide mb-2">
              Admin Portal
            </h1>
            <p className="text-[13px] font-serif text-gray-500">
              Welcome back . Please enter your credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            
            {/* Username/Email Field */}
            <div>
              <label className="block text-[12px] font-serif text-[#4a4a4a] mb-2 font-medium">
                Username
              </label>
              <div className="flex items-center gap-3 border border-[#da2966] px-3 py-3 bg-white focus-within:ring-1 focus-within:ring-[#da2966] transition-all">
                <User className="w-4 h-4 text-[#da2966] shrink-0" strokeWidth={2.5} />
                <div className="w-px h-[18px] bg-gray-200" />
                <input
                  type="email"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="flex-1 bg-transparent border-none focus:outline-none text-[14px] font-serif text-gray-800 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[12px] font-serif text-[#4a4a4a] mb-2 font-medium">
                Mot de passe
              </label>
              <div className="flex items-center gap-3 border border-[#faeef1] px-3 py-3 bg-white focus-within:border-[#da2966] focus-within:ring-1 focus-within:ring-[#da2966] transition-all">
                <Lock className="w-4 h-4 text-[#da2966] shrink-0" strokeWidth={2.5} />
                <div className="w-px h-[18px] bg-gray-200" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="flex-1 bg-transparent border-none focus:outline-none text-[14px] font-serif text-gray-800 placeholder:text-gray-400"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="focus:outline-none shrink-0 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[#da2966] hover:text-[#b11b4e] transition-colors" strokeWidth={2.5} />
                  ) : (
                    <Eye className="w-4 h-4 text-[#da2966] hover:text-[#b11b4e] transition-colors" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center font-serif mt-2">{error}</p>
            )}

            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2.5 bg-[#4b3d37] text-white text-[12px] font-serif italic py-3 px-8 rounded-sm hover:bg-[#3a2f2a] transition-all disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Authenticating…' : 'Access Dashboard'}
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </form>

          {/* Footer inside the box */}
          <div className="mt-16 text-center">
            <p className="text-[10px] text-gray-500 font-serif">
              © 2026 Bloom Parfum. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
