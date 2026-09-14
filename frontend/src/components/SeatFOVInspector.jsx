import React from 'react';
import { Eye, Volume2, Compass, ShieldCheck } from 'lucide-react';

export const SeatFOVInspector = ({ seatCode }) => {
  if (!seatCode) {
    return (
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 font-medium italic">
        Click or tap any seat to inspect 3D Viewing Angle & Audio Optics
      </div>
    );
  }

  const row = seatCode.charAt(0);
  const col = parseInt(seatCode.substring(1), 10);
  const rowIndex = row.charCodeAt(0) - 65; // A = 0, B = 1...

  // Spatial Math Computations
  const screenDistanceMeters = (6 + rowIndex * 1.6).toFixed(1);
  const centerOffset = Math.abs(col - 5.5);
  const viewingAngle = Math.max(22, Math.round(52 - rowIndex * 3 - centerOffset * 2.5));

  let tierName = 'Standard Executive';
  let tierBadge = 'bg-slate-100 text-slate-700 border-slate-200';
  let comfortPerks = 'Standard Plush Seating • Cupholder';

  if (['A', 'B'].includes(row)) {
    tierName = 'VIP Recliner Suite';
    tierBadge = 'bg-amber-100 text-amber-800 border-amber-300';
    comfortPerks = '180° Electric Recliner • Extra Legroom +40% • In-Seat Table Service';
  } else if (['C', 'D', 'E'].includes(row) && centerOffset <= 2.5) {
    tierName = 'Prime IMAX Sweetspot';
    tierBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    comfortPerks = 'Optimal Eye-Level Screen Center • Direct Dolby Atmos Focal Alignment';
  }

  return (
    <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-sm space-y-3 text-xs animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-slate-900 font-mono bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            Seat {seatCode}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${tierBadge}`}>
            {tierName}
          </span>
        </div>
        <div className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1">
          <Compass className="w-3.5 h-3.5" /> FOV Optics Engine
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center pt-1">
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
          <div className="text-slate-500 text-[10px] font-bold flex items-center justify-center gap-1">
            <Eye className="w-3 h-3 text-emerald-600" /> Viewing Angle
          </div>
          <div className="text-sm font-extrabold text-slate-900">{viewingAngle}°</div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
          <div className="text-slate-500 text-[10px] font-bold flex items-center justify-center gap-1">
            <Compass className="w-3 h-3 text-amber-600" /> Distance
          </div>
          <div className="text-sm font-extrabold text-slate-900">{screenDistanceMeters}m</div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
          <div className="text-slate-500 text-[10px] font-bold flex items-center justify-center gap-1">
            <Volume2 className="w-3 h-3 text-emerald-600" /> Audio Surround
          </div>
          <div className="text-sm font-extrabold text-emerald-700">Atmos 7.1.4</div>
        </div>
      </div>

      <div className="p-2.5 bg-emerald-50/60 rounded-xl text-[11px] text-slate-700 flex items-start gap-2 border border-emerald-200/80 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
        <span>{comfortPerks}</span>
      </div>
    </div>
  );
};
