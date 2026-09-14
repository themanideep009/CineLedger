import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Phone, ArrowRight, ShieldCheck, RefreshCw, KeyRound, User } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+44', country: 'UK', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+971', country: 'UAE', flag: '🇦🇪', name: 'UAE' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
];

export const PhoneOtpLogin = ({ onSuccessRedirect }) => {
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('PHONE'); // 'PHONE' | 'OTP'
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [testOtpHint, setTestOtpHint] = useState('');
  const [error, setError] = useState('');

  const { sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const cleanNumber = phoneNumber.trim().replace(/\D/g, '');
    if (cleanNumber.length < 8) {
      setError('Please enter a valid mobile phone number.');
      return;
    }

    const fullPhone = `${countryCode}${cleanNumber}`;
    setLoading(true);

    const res = await sendPhoneOtp(fullPhone);
    setLoading(false);

    if (res.success) {
      setStep('OTP');
      setResendTimer(30);
      setTestOtpHint(res.data.testOtp || '123456');
      addToast(`OTP sent to ${fullPhone}`, 'info');
    } else {
      setError(res.error || 'Failed to send OTP.');
    }
  };

  const handleDigitChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste of 6-digit code
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length === 6) {
        const digits = pasted.split('');
        setOtpDigits(digits);
        document.getElementById(`otp-input-5`)?.focus();
        return;
      }
    }

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance to next input field
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    const fullPhone = `${countryCode}${phoneNumber.trim().replace(/\D/g, '')}`;
    setLoading(true);

    const res = await verifyPhoneOtp(fullPhone, enteredOtp, name);
    setLoading(false);

    if (res.success) {
      addToast('Phone number verified! Logged in successfully.', 'success');
      if (onSuccessRedirect) onSuccessRedirect(res.user.role);
    } else {
      setError(res.error || 'Invalid OTP code.');
    }
  };

  const handleAutoFillTestOtp = () => {
    if (testOtpHint) {
      setOtpDigits(testOtpHint.split(''));
    } else {
      setOtpDigits(['1', '2', '3', '4', '5', '6']);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
          {error}
        </div>
      )}

      {step === 'PHONE' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Your Full Name (Optional)</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Verma"
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Phone Number</label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>

              <div className="relative flex-1">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="98765 43210"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 tracking-wider"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending OTP...
              </>
            ) : (
              <>
                Get Verification OTP <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
          <div className="text-center">
            <div className="text-xs text-slate-400">
              OTP sent to <span className="font-semibold text-cyan-300">{countryCode} {phoneNumber}</span>
            </div>
            <button
              type="button"
              onClick={() => setStep('PHONE')}
              className="text-[11px] text-cyan-400 hover:underline mt-0.5"
            >
              Edit phone number
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 text-center mb-2">
              Enter 6-Digit Code
            </label>
            <div className="flex justify-center gap-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-10 h-11 text-center bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl text-lg font-bold text-white focus:outline-none transition-all shadow-inner"
                />
              ))}
            </div>
          </div>

          {/* Test OTP Helper Chip */}
          {testOtpHint && (
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs">
              <span className="text-cyan-300 font-medium flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                Demo OTP: <strong className="tracking-widest">{testOtpHint}</strong>
              </span>
              <button
                type="button"
                onClick={handleAutoFillTestOtp}
                className="px-2 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-[11px] transition-all"
              >
                Auto-fill
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              'Verifying...'
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" /> Verify & Sign In
              </>
            )}
          </button>

          <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
            <span>Didn't receive code?</span>
            <button
              type="button"
              disabled={resendTimer > 0 || loading}
              onClick={handleSendOtp}
              className="text-cyan-400 hover:underline disabled:text-slate-600 disabled:no-underline flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${resendTimer > 0 ? 'animate-spin' : ''}`} />
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
