import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ label, type = 'text', icon, placeholder, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-[#111834] opacity-80">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 pointer-events-none">
            <img src={icon} alt="" className="w-5 h-5 opacity-50" />
          </div>
        )}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full h-[52px] bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl
            transition-all duration-300 ease-in-out
            focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-100 outline-none
            text-[#111834] placeholder-gray-400 font-sans text-sm
            ${icon ? 'pl-12' : 'pl-4'} ${isPassword ? 'pr-12' : 'pr-4'}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
