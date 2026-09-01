import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  error,
  required = false,
  className = '',
  size = 'md',
  dropUp = false,
  isDarkMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const selectedIndex = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, options, value]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => prev >= options.length - 1 ? 0 : prev + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => prev === 0 ? options.length - 1 : prev - 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && options[highlightedIndex]) {
            onChange?.(options[highlightedIndex].value);
            setIsOpen(false);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, highlightedIndex, options, onChange]);

  const sizeStyles = {
    sm: { trigger: 'h-8 px-2.5 text-xs', dropdown: 'max-h-40', option: 'px-2.5 py-1.5 text-xs', icon: 'w-3.5 h-3.5' },
    md: { trigger: 'h-10 px-3 text-sm', dropdown: 'max-h-48', option: 'px-3 py-2 text-sm', icon: 'w-4 h-4' },
    lg: { trigger: 'h-12 px-4 text-base', dropdown: 'max-h-56', option: 'px-4 py-2.5 text-base', icon: 'w-5 h-5' },
  };

  const handleSelect = (optionValue) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className={`block mb-1.5 text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-neutral-700'}`}>
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between ${sizeStyles[size].trigger}
          border rounded-lg transition-all duration-200 ease-out
          ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-gray-200' : 'bg-white border-neutral-200 text-neutral-800'}
          ${isOpen ? (isDarkMode ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-purple-400 ring-2 ring-purple-100') : (isDarkMode ? 'hover:border-slate-600' : 'hover:border-neutral-300')}
          ${disabled ? (isDarkMode ? 'bg-slate-900 text-gray-600 cursor-not-allowed border-slate-800' : 'bg-neutral-50 text-neutral-400 cursor-not-allowed') : 'cursor-pointer'}
          ${error ? 'border-red-300' : ''}
        `}
      >
        <span className={`flex-1 text-left truncate ${!selectedOption ? (isDarkMode ? 'text-gray-500' : 'text-neutral-400') : ''}`}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`${sizeStyles[size].icon} ml-2 ${isDarkMode ? 'text-gray-500' : 'text-neutral-400'} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className={`
          absolute z-50 w-full border rounded-lg shadow-lg overflow-hidden
          animate-fade-in-down origin-top
          ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-neutral-200'}
          ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'}
        `}>
          <div className={`${sizeStyles[size].dropdown} overflow-y-auto py-1`}>
            {options.length === 0 ? (
              <div className={`px-3 py-2 text-sm text-center ${isDarkMode ? 'text-gray-500' : 'text-neutral-400'}`}>No options available</div>
            ) : (
              options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    w-full flex items-center justify-between ${sizeStyles[size].option}
                    transition-colors duration-150
                    ${value === option.value 
                        ? (isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-50 text-purple-700') 
                        : index === highlightedIndex 
                            ? (isDarkMode ? 'bg-slate-700 text-gray-100' : 'bg-neutral-50 text-neutral-900') 
                            : (isDarkMode ? 'text-gray-300 hover:bg-slate-700' : 'text-neutral-700 hover:bg-neutral-50')
                    }
                  `}
                >
                  {option.label}
                  {value === option.value && <Check className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
};

export default Select;
