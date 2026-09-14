import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, QrCode, Building2, CheckCircle2, Lock, ShieldCheck, ArrowRight, RefreshCw, X } from 'lucide-react';

export const PaymentModal = ({ isOpen, onClose, onPaymentSuccess, totalAmount, showTitle, seats }) => {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handleTestCardAutofill = () => {
    setCardNumber('4242 4242 4242 4242');
    setExpiry('12/28');
    setCvv('789');
    setCardHolder('Aarav Patel');
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      setTimeout(() => {
        onPaymentSuccess({ paymentMethod: activeTab.toUpperCase() });
      }, 1200);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-white text-[11px] font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Encrypted Gateway
            </div>
            <h2 className="text-xl font-bold text-white">CinePay Checkout</h2>
            <p className="text-xs text-emerald-100">
              {showTitle} • <span className="text-white font-semibold">{seats.join(', ')}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-emerald-100 block">Total Amount</span>
            <span className="text-2xl font-black text-white">₹{totalAmount}</span>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Processing State Overlay */}
        {isProcessing && (
          <div className="p-12 text-center space-y-4 bg-white">
            <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Verifying Transaction with Bank...</h3>
            <p className="text-xs text-slate-500">Communicating with payment gateway server. Do not refresh.</p>
          </div>
        )}

        {/* Success Completed Overlay */}
        {isCompleted && (
          <div className="p-12 text-center space-y-4 bg-white">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900">Payment Authorized!</h3>
            <p className="text-xs text-emerald-700 font-semibold">Generating digital QR entry ticket pass...</p>
          </div>
        )}

        {/* Normal Payment Tabs Form */}
        {!isProcessing && !isCompleted && (
          <div>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('upi')}
                className={`flex-1 py-3 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'upi'
                    ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/60 font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4" /> UPI / QR Scan
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('card')}
                className={`flex-1 py-3 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'card'
                    ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/60 font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Card (Debit/Credit)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('netbanking')}
                className={`flex-1 py-3 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'netbanking'
                    ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/60 font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" /> Net Banking
              </button>
            </div>

            {/* Tab Body */}
            <form onSubmit={handleProcessPayment} className="p-6 space-y-5 text-xs">
              {activeTab === 'upi' && (
                <div className="text-center space-y-4">
                  <div className="inline-block p-4 rounded-2xl bg-white shadow-xl border border-slate-200">
                    <QRCodeSVG value={`upi://pay?pa=cineledger@bank&pn=CineLedger&am=${totalAmount}&cu=INR`} size={150} />
                  </div>
                  <p className="text-slate-600 text-xs font-medium">
                    Scan with <span className="text-emerald-700 font-extrabold">GPay, PhonePe, Paytm</span> or any UPI App to approve ₹{totalAmount}
                  </p>
                </div>
              )}

              {activeTab === 'card' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-slate-700 font-bold">Card Number</label>
                    <button
                      type="button"
                      onClick={handleTestCardAutofill}
                      className="text-[10px] text-emerald-700 hover:underline font-extrabold cursor-pointer"
                    >
                      ⚡ Auto-fill Test Card
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:ring-2 focus:ring-emerald-500"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        required
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="789"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        required
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Aarav Patel"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'netbanking' && (
                <div className="space-y-3">
                  <label className="block text-slate-700 font-bold">Select Popular Indian Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" /> Pay & Authorize ₹{totalAmount} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
