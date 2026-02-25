import React, { useState } from 'react';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../components/Login';
import SignUp from '../components/SignUp';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AuthLayout>
      <div>
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setIsLogin(true)}
            className={`w-1/2 py-4 text-center text-sm font-medium ${
              isLogin
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`w-1/2 py-4 text-center text-sm font-medium ${
              !isLogin
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>
        <div className="p-4">
            {isLogin ? <Login /> : <SignUp />}
        </div>
      </div>
    </AuthLayout>
  );
};

export default AuthPage;