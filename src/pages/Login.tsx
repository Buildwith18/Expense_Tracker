import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CreditCard, Eye, EyeOff, Mail, Lock } from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      console.log("✅ Already logged in, redirecting...");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation will happen automatically through isAuthenticated state
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("demo@example.com");
    setPassword("demo123");
    setIsLoading(true);
    setError("");

    try {
      await login("demo@example.com", "demo123");
    } catch {
      setError("Demo login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="rudra@test.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-center">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo Account:</h3>
            <p className="text-sm text-blue-800 mb-3">
              Email: demo@example.com | Password: demo123
            </p>
            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              Try Demo Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { CreditCard, Eye, EyeOff, Mail, Lock } from 'lucide-react';
// import axios from 'axios';


// const Login: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   const { setIsAuthenticated } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const from = location.state?.from?.pathname || '/dashboard';

//   useEffect(() => {
//     const token = localStorage.getItem('auth_token');
//     if (token) {
//       console.log('Login: Already authenticated, redirecting to dashboard');
//       navigate('/dashboard', { replace: true });
//     }
//   }, [navigate]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       console.log('Attempting login with:', email);
//       const response = await axios.post('http://127.0.0.1:8000/api/token/', {
//         email,
//         password,
//       });

//       const { access, refresh } = response.data;

//       if (access && refresh) {
//         // ✅ Store with correct keys to match api.ts
//         localStorage.setItem('auth_token', access);
//         localStorage.setItem('refresh_token', refresh);

//         console.log('✅ Tokens saved successfully');
//         setIsAuthenticated(true);

//         // Fetch user profile after login (optional but recommended)
//         try {
//           const profileResponse = await axios.get('http://127.0.0.1:8000/api/profile/', {
//             headers: {
//               Authorization: `Bearer ${access}`,
//             },
//           });
//           localStorage.setItem('user_data', JSON.stringify(profileResponse.data));
//           console.log('✅ Profile fetched:', profileResponse.data);
//         } catch (profileErr) {
//           console.warn('⚠️ Could not fetch profile:', profileErr);
//         }

//         // Navigate to dashboard
//         navigate(from, { replace: true });
//       } else {
//         throw new Error('Token not received');
//       }
//     } catch (err: any) {
//       console.error('Login failed:', err);
//       setError('Invalid email or password. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDemoLogin = async () => {
//     setEmail('demo@example.com');
//     setPassword('demo123');
//     setIsLoading(true);
//     setError('');

//     try {
//       await handleSubmitDemo('demo@example.com', 'demo123');
//     } catch {
//       setError('Demo login failed.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSubmitDemo = async (email: string, password: string) => {
//     try {
//       const response = await axios.post('http://127.0.0.1:8000/api/token/', {
//         email,
//         password,
//       });
//       const { access, refresh } = response.data;
//       localStorage.setItem('auth_token', access);
//       localStorage.setItem('refresh_token', refresh);
//       setIsAuthenticated(true);
//       navigate('/dashboard', { replace: true });
//     } catch (err) {
//       console.error('Demo login error:', err);
//       setError('Demo login failed.');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full">
//         {/* Back to Landing */}
//         <div className="text-center mb-8">
//           <Link
//             to="/"
//             className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
//           >
//             ← Back to Home
//           </Link>
//         </div>

//         {/* Login Card */}
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           {/* Logo and Header */}
//           <div className="text-center mb-8">
//             <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
//               <CreditCard className="w-8 h-8 text-white" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
//             <p className="text-gray-600">Sign in to your account to continue</p>
//           </div>

//           {/* Error Message */}
//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           {/* Login Form */}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Email Field */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
//                   placeholder="raghu@test.com"
//                 />
//               </div>
//             </div>

//             {/* Password Field */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   autoComplete="current-password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
//                   placeholder="••••••••"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             {/* Sign In Button */}
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <div className="flex items-center justify-center">
//                   <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
//                   Signing in...
//                 </div>
//               ) : (
//                 'Sign In'
//               )}
//             </button>
//           </form>

//           {/* Sign Up Link */}
//           <div className="mt-6 text-center">
//             <p className="text-gray-600">
//               Don't have an account?{' '}
//               <Link
//                 to="/signup"
//                 className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
//               >
//                 Sign up here
//               </Link>
//             </p>
//           </div>
//         </div>

//         {/* Demo Account */}
//         <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
//           <div className="text-center">
//             <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo Account:</h3>
//             <p className="text-sm text-blue-800 mb-3">
//               Email: demo@example.com | Password: demo123
//             </p>
//             <button
//               onClick={handleDemoLogin}
//               disabled={isLoading}
//               className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
//             >
//               Try Demo Account
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


// import React, { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { CreditCard, Eye, EyeOff, Mail, Lock } from 'lucide-react';
// import { useEffect } from 'react';

// const Login: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   const { login, isAuthenticated } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const from = location.state?.from?.pathname || '/dashboard';

//   // Redirect if already authenticated
//   useEffect(() => {
//     console.log('Login: isAuthenticated changed', { isAuthenticated });
//     if (isAuthenticated) {
//       console.log('Login: Redirecting to dashboard');
//       navigate('/dashboard', { replace: true });
//     }
//   }, [isAuthenticated, navigate]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       await login(email, password);
//       // Navigation will be handled by the useEffect that watches isAuthenticated
//     } catch (err) {
//       setError('Invalid email or password');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDemoLogin = async () => {
//     setEmail('demo@example.com');
//     setPassword('demo123');
//     setIsLoading(true);
//     setError('');

//     try {
//       await login('demo@example.com', 'demo123');
//       // Navigation will be handled by the useEffect that watches isAuthenticated
//     } catch (err) {
//       setError('Demo login failed');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full">
//         {/* Back to Landing */}
//         <div className="text-center mb-8">
//           <Link
//             to="/"
//             className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
//           >
//             ← Back to Home
//           </Link>
//         </div>

//         {/* Login Card */}
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           {/* Logo and Header */}
//           <div className="text-center mb-8">
//             <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
//               <CreditCard className="w-8 h-8 text-white" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
//             <p className="text-gray-600">Sign in to your account to continue</p>
//           </div>

//           {/* Error Message */}
//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           {/* Login Form */}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Email Field */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
//                   placeholder="raghu@test.com"
//                 />
//               </div>
//             </div>

//             {/* Password Field */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   autoComplete="current-password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
//                   placeholder="••••••••"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             {/* Sign In Button */}
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <div className="flex items-center justify-center">
//                   <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
//                   Signing in...
//                 </div>
//               ) : (
//                 'Sign In'
//               )}
//             </button>
//           </form>

//           {/* Sign Up Link */}
//           <div className="mt-6 text-center">
//             <p className="text-gray-600">
//               Don't have an account?{' '}
//               <Link
//                 to="/signup"
//                 className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
//               >
//                 Sign up here
//               </Link>
//             </p>
//           </div>
//         </div>

//         {/* Demo Account */}
//         <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
//           <div className="text-center">
//             <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo Account:</h3>
//             <p className="text-sm text-blue-800 mb-3">
//               Email: demo@example.com | Password: demo123
//             </p>
//             <button
//               onClick={handleDemoLogin}
//               disabled={isLoading}
//               className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
//             >
//               Try Demo Account
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;