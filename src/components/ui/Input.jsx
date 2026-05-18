import React from 'react';

const Input = ({ label, type = 'text', icon, placeholder, value, onChange }) => {
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
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full h-[52px] bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl
            transition-all duration-300 ease-in-out
            focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-100 outline-none
            text-[#111834] placeholder-gray-400 font-sans text-sm
            ${icon ? 'pl-12' : 'pl-4'} pr-4
          `}
        />
      </div>
    </div>
  );
};

export default Input;
