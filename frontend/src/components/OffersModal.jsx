import React, { useState } from 'react';
import { Tag, X, Check, Copy, Sparkles, Percent, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const OffersModal = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const [copiedCode, setCopiedCode] = useState(null);

  if (!isOpen) return null;

  const offers = [
    {
      code: 'CINELEDGER50',
      title: '50% OFF Up to ₹200 on Stage Plays & Theatre',
      desc: 'Applicable on verified stage plays, musicals, and live performances across all city halls.',
      validTill: 'Valid till 30th Sept 2026',
      badge: '50% OFF',
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
    },
    {
      code: 'FLAT100',
      title: 'Flat ₹100 Instant Discount on Seat Bookings',
      desc: 'Valid on bookings of 2 or more seats for any stage play, standup show, or cricket match.',
      validTill: 'Valid till 15th Oct 2026',
      badge: 'FLAT ₹100',
      color: 'bg-amber-500/10 text-amber-700 border-amber-300',
    },
    {
      code: 'HDFC200',
      title: '₹200 Cashback via HDFC Bank Cards',
      desc: 'Instant cashback applied at final seat checkout with HDFC Credit/Debit Cards.',
      validTill: 'Valid till 31st Dec 2026',
      badge: 'BANK OFFER',
      color: 'bg-cyan-500/10 text-cyan-700 border-cyan-300',
    },
    {
      code: 'PRODUCERVIP',
      title: 'Zero Booking Fee on VIP Lounge Seats',
      desc: 'Enjoy ₹0 transaction convenience fee on all VIP recliner seat map reservations.',
      validTill: 'Valid for All Users',
      badge: 'ZERO FEE',
      color: 'bg-rose-500/10 text-rose-700 border-rose-300',
    },
  ];

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Promo Code "${code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Exclusive Partner Discounts
          </div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" /> Offers & Promo Discounts
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Apply these promotional coupon codes at seat checkout for instant savings.
          </p>
        </div>

        {/* Offers List */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {offers.map((offer) => (
            <div
              key={offer.code}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border ${offer.color}`}>
                  {offer.badge}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">{offer.validTill}</span>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-900">{offer.title}</h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{offer.desc}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <div className="px-3 py-1 rounded-xl bg-slate-200/70 border border-slate-300 font-mono font-black text-xs text-slate-800 tracking-wider">
                  {offer.code}
                </div>
                <button
                  onClick={() => handleCopy(offer.code)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-200" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Cryptographically Verified Discounts
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
