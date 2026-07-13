import React, { forwardRef, InputHTMLAttributes, useState } from 'react';

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
}

const countries = [
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
];

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, helperText, className = '', countryCode = '+234', onCountryCodeChange, ...props }, ref) => {
    const [selectedCountry, setSelectedCountry] = useState(
      countries.find(c => c.code === countryCode) || countries[0]
    );
    const [isOpen, setIsOpen] = useState(false);

    const handleCountrySelect = (country: typeof countries[0]) => {
      setSelectedCountry(country);
      onCountryCodeChange?.(country.code);
      setIsOpen(false);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-xs text-[#9CA3AF] mb-2 px-1"
          >
            {label}
          </label>
        )}
        <div className="relative flex gap-2 w-full min-w-0">
          {/* Country selector */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="h-full px-3 py-3 rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 hover:border-[#5A42DE] transition-colors flex items-center gap-1.5 whitespace-nowrap"
              aria-label="Select country code"
            >
              <span className="text-base">{selectedCountry.flag}</span>
              <span className="text-sm text-[#18181B] dark:text-white">{selectedCountry.code}</span>
            </button>

            {isOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-[#E5E7EB] dark:border-gray-700 py-1 z-20 max-h-60 overflow-auto">
                  {countries.map((country) => (
                    <button key={country.code} type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="w-full px-3 py-2 text-left hover:bg-[#F7F7FC] dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                      <span className="text-base">{country.flag}</span>
                      <span className="text-sm text-[#18181B] dark:text-white flex-1">{country.name}</span>
                      <span className="text-xs text-[#717182]">{country.code}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Phone input */}
          <input
            ref={ref}
            type="tel"
            className={`
              min-w-0 flex-1 px-4 py-3 rounded-xl
              bg-white dark:bg-gray-800
              border border-[#E5E7EB] dark:border-gray-700
              text-[#18181B] dark:text-white placeholder:text-[#9CA3AF]
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[#5A42DE]/20 focus:border-[#5A42DE]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : ""}
              ${className}
            `}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p 
            id={`${props.id}-error`}
            className="mt-1.5 text-[13px] text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p 
            id={`${props.id}-helper`}
            className="mt-1.5 text-[11px] text-[#717182] leading-relaxed"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
