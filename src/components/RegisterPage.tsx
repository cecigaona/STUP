import React, { useState } from 'react';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
  onRegister: (name: string) => void;
}

function RegisterPage({ onNavigateToLogin, onRegister }: RegisterPageProps) {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    onRegister(name || username || 'User');
  };

  return (
    <div className="min-h-screen bg-[#F3E7D2] flex items-center justify-center p-4">

      <div className="absolute top-8 left-8">
        <h1 className="text-[#145147] text-5xl font-bold tracking-wide">
          STUP
        </h1>
      </div>

      <div className="w-full max-w-md">

        <div className="text-center mb-12">
          <h2 className="text-[#145147] text-4xl font-semibold leading-tight">
            Create your<br />account
          </h2>
        </div>


        <form onSubmit={handleRegister} className="space-y-6">

          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm rounded-full border-0 
                         text-gray-700 placeholder-gray-500 text-lg
                         focus:outline-none focus:ring-2 focus:ring-[#145147]/30 focus:bg-white
                         transition-all duration-300 ease-in-out
                         shadow-sm hover:shadow-md"
              required
            />
          </div>


          <div>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm rounded-full border-0 
                         text-gray-700 placeholder-gray-500 text-lg
                         focus:outline-none focus:ring-2 focus:ring-[#145147]/30 focus:bg-white
                         transition-all duration-300 ease-in-out
                         shadow-sm hover:shadow-md"
              required
            />
          </div>


          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm rounded-full border-0 
                         text-gray-700 placeholder-gray-500 text-lg
                         focus:outline-none focus:ring-2 focus:ring-[#145147]/30 focus:bg-white
                         transition-all duration-300 ease-in-out
                         shadow-sm hover:shadow-md"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm rounded-full border-0 
                         text-gray-700 placeholder-gray-500 text-lg
                         focus:outline-none focus:ring-2 focus:ring-[#145147]/30 focus:bg-white
                         transition-all duration-300 ease-in-out
                         shadow-sm hover:shadow-md"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm rounded-full border-0 
                         text-gray-700 placeholder-gray-500 text-lg
                         focus:outline-none focus:ring-2 focus:ring-[#145147]/30 focus:bg-white
                         transition-all duration-300 ease-in-out
                         shadow-sm hover:shadow-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#145147] text-white py-4 rounded-full text-lg font-medium
                       hover:bg-[#0f3d37] active:bg-[#0a2d27] 
                       focus:outline-none focus:ring-2 focus:ring-[#145147]/50 focus:ring-offset-2 focus:ring-offset-[#F3E7D2]
                       transition-all duration-300 ease-in-out
                       shadow-lg hover:shadow-xl active:shadow-md
                       transform hover:-translate-y-0.5 active:translate-y-0
                       disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Creating account...
              </div>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={onNavigateToLogin}
              className="text-[#145147] font-medium hover:underline focus:outline-none focus:underline
                         transition-all duration-200 ease-in-out"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;