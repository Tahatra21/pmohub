"use client";
import React, { useState } from 'react';
import { Eye, EyeOff, Zap, Wifi, Database, Cloud, Leaf, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SOLARLandscapeLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setMessage('Email dan password harus diisi');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      console.log('Sending login request:', { email: username.trim(), password: '***' });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username.trim(),
          password: password.trim()
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setMessage('Login berhasil! Redirecting...');
        
        // Save token to localStorage
        if (data.data?.token) {
          localStorage.setItem('auth_token', data.data.token);
        }
        
        // Save user info to localStorage
        if (data.data?.user) {
          localStorage.setItem('user_info', JSON.stringify(data.data.user));
        }
        
        // Redirect ke dashboard using Next.js router
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setMessage(data.message || 'Login gagal');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-0 overflow-hidden relative">
      {/* Animated Background Grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#smallGrid)" />
          </svg>
        </div>
      </div>

      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

      {/* Main Container - Landscape */}
      <div className="w-full h-screen flex items-center justify-center px-20">
        <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden flex" style={{height: '85vh'}}>
          
          {/* Left Side - Login Form */}
          <div className="w-2/5 p-12 flex flex-col justify-center bg-gradient-to-br from-white to-blue-50 relative z-20">
            <div className="max-w-md mx-auto w-full relative z-20">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-35 h-35 flex items-center justify-center">
                  <img 
                    src="/icon.png" 
                    alt="SOLAR Hub Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to your workspace.</p>
                <p className="text-gray-600">Solution. Design. Deploy. Monitor.</p>
              </div>

              <div className="space-y-5">
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition relative z-10"
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition relative z-10"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">Tetap masuk</span>
                  </label>
                </div>

                {/* Login Button */}
                <button 
                  onClick={handleLogin}
                  disabled={isLoading}
                  className={`w-full font-semibold py-3.5 rounded-xl transition shadow-lg ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-600/30 hover:shadow-xl'
                  } text-white`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Memproses...
                    </div>
                  ) : (
                    'Masuk'
                  )}
                </button>

                {/* Message Display */}
                {message && (
                  <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                    message.includes('berhasil') 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}

                {/* Demo Credentials */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">
                        Demo Credentials
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p><strong>Admin:</strong> admin@projecthub.com / admin123</p>
                    <p><strong>Manager:</strong> manager@projecthub.com / manager123</p>
                    <p><strong>Engineer:</strong> engineer@projecthub.com / engineer123</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Visual & Products */}
          <div className="w-3/5 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 flex flex-col justify-center relative overflow-hidden">
            {/* Animated Network Lines */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" className="absolute">
                <line x1="10%" y1="20%" x2="90%" y2="30%" stroke="white" strokeWidth="2" className="animate-pulse"/>
                <line x1="20%" y1="40%" x2="80%" y2="60%" stroke="white" strokeWidth="2" className="animate-pulse" style={{animationDelay: '0.5s'}}/>
                <line x1="30%" y1="70%" x2="70%" y2="80%" stroke="white" strokeWidth="2" className="animate-pulse" style={{animationDelay: '1s'}}/>
              </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 text-white">
              <div className="mb-8">
                <h2 className="text-6xl font-black mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
                    SOLAR
                  </span>
                  <span className="bg-gradient-to-r from-orange-400 via-red-500 to-red-600 bg-clip-text text-transparent ml-3">
                    HUB
                  </span>
                </h2>
                
                {/* Clean decorative elements */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full animate-pulse"></div>
                  <div className="w-8 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full"></div>
                  <div className="w-6 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
                  <div className="w-4 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"></div>
                </div>
                
                {/* Solar energy icons */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-white">
                        <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <span className="text-sm text-blue-100 font-medium">Energy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-white">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <span className="text-sm text-blue-100 font-medium">Management</span>
                  </div>
                </div>
              </div>

              <p className="text-lg text-blue-100 mb-8 max-w-xl">
                Platform terintegrasi untuk mengelola Solar Energy Projects & Resources dengan teknologi terdepan
              </p>

              {/* Products Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                      <Leaf className="w-5 h-5 text-green-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-0.5">Solar Project Management</h3>
                      <p className="text-xs text-blue-100">Comprehensive solar project tracking</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                      <Zap className="w-5 h-5 text-yellow-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-0.5">Solar Resource Management</h3>
                      <p className="text-xs text-blue-100">Smart solar resource allocation</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                      <Video className="w-5 h-5 text-purple-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-0.5">Solar Installation Tasks</h3>
                      <p className="text-xs text-blue-100">Efficient solar installation tracking</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                      <Wifi className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-0.5">Solar Budget Tracking</h3>
                      <p className="text-xs text-blue-100">Solar project financial oversight</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                      <Database className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-0.5">Solar Cost Estimation</h3>
                      <p className="text-xs text-blue-100">Accurate solar cost planning</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-cyan-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                      <Cloud className="w-5 h-5 text-cyan-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-0.5">Solar Analytics & Reports</h3>
                      <p className="text-xs text-blue-100">Solar energy data insights</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 w-32 h-32 border-4 border-white/10 rounded-full"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 border-4 border-white/10 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-xs">
        <p>© 2025 SOLAR Hub - Solar Energy Project Management System</p>
      </div>
    </div>
  );
}
