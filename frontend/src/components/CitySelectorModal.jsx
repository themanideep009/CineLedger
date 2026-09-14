import React, { useState, useMemo } from 'react';
import { Search, Navigation, X, Check, MapPin, Building2 } from 'lucide-react';
import { useCity } from '../context/CityContext';

export const CitySelectorModal = () => {
  const {
    selectedCity,
    selectCity,
    isCityModalOpen,
    closeCityModal,
    POPULAR_CITIES,
    ALL_INDIAN_CITIES,
  } = useCity();

  const [searchTerm, setSearchTerm] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');

  // Filtered popular cities
  const filteredPopular = useMemo(() => {
    if (!searchTerm.trim()) return POPULAR_CITIES;
    return POPULAR_CITIES.filter((city) =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [searchTerm, POPULAR_CITIES]);

  // Filtered other cities
  const filteredOther = useMemo(() => {
    let result = ALL_INDIAN_CITIES;
    if (searchTerm.trim()) {
      result = result.filter((cityName) =>
        cityName.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    } else if (selectedLetter !== 'ALL') {
      result = result.filter((cityName) =>
        cityName.toUpperCase().startsWith(selectedLetter)
      );
    }
    return result;
  }, [searchTerm, selectedLetter, ALL_INDIAN_CITIES]);

  // Group cities alphabetically
  const groupedCities = useMemo(() => {
    const map = {};
    filteredOther.forEach((city) => {
      const firstChar = city.charAt(0).toUpperCase();
      if (!map[firstChar]) map[firstChar] = [];
      map[firstChar].push(city);
    });
    return map;
  }, [filteredOther]);

  const alphabet = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  if (!isCityModalOpen) return null;

  const handleDetectLocation = () => {
    setDetecting(true);
    setDetectError('');

    if (!navigator.geolocation) {
      setDetectError('Geolocation is not supported by your browser.');
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        let detected = 'Mumbai';
        if (lat > 28) detected = 'Delhi-NCR';
        else if (lat > 16 && lon > 78) detected = 'Hyderabad';
        else if (lat > 12 && lat <= 16 && lon > 76) detected = 'Bengaluru';
        else if (lat > 11 && lat <= 14 && lon > 79) detected = 'Chennai';
        else if (lat > 18 && lat <= 20 && lon < 74) detected = 'Mumbai';
        else if (lat > 22 && lon > 87) detected = 'Kolkata';

        selectCity(detected);
        setDetecting(false);
      },
      (error) => {
        console.warn('Geolocation failed:', error);
        setDetectError('Could not detect location automatically. Please select your city from the list.');
        setDetecting(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Search Area (Styled with CineLedger Theme) */}
        <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-20 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" /> Select Your Cinema City
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Over {ALL_INDIAN_CITIES.length} Indian cities with active multiplex & venue support
              </p>
            </div>

            <button
              onClick={closeCityModal}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box (Matching CineLedger Theme) */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search for your city (e.g. Hyderabad, Suryapet, Pune, Jaipur, Patna, Surat...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Detect Location Action & Quick Alphabet Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <button
              onClick={handleDetectLocation}
              disabled={detecting}
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-extrabold text-sm cursor-pointer group transition-colors shrink-0"
            >
              <Navigation className={`w-4 h-4 fill-emerald-600 stroke-none group-hover:scale-110 transition-transform ${detecting ? 'animate-spin' : ''}`} />
              <span>{detecting ? 'Detecting location...' : 'Detect my location'}</span>
            </button>

            {/* Quick Alphabet Filter Buttons */}
            {!searchTerm && (
              <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full scrollbar-none text-[11px]">
                {alphabet.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(letter)}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all shrink-0 cursor-pointer ${
                      selectedLetter === letter
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            )}

            {detectError && (
              <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100">
                {detectError}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
          {/* 1. POPULAR CITIES SECTION */}
          {filteredPopular.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                Popular Cities
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
                {filteredPopular.map((city) => {
                  const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
                  return (
                    <button
                      key={city.name}
                      onClick={() => selectCity(city.name)}
                      className={`p-3 rounded-2xl flex flex-col items-center justify-between text-center transition-all duration-200 border cursor-pointer relative group ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20 text-emerald-700 font-bold'
                          : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-medium'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}

                      <div className={`mb-2 transition-transform group-hover:scale-110 ${isSelected ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {city.icon}
                      </div>

                      <span className="text-xs leading-tight line-clamp-1">
                        {city.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. OTHER CITIES SECTION */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" /> Other Cities ({filteredOther.length})
              </h3>
              <span className="text-[11px] text-slate-400 font-semibold">Alphabetical Index</span>
            </div>

            {filteredOther.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm font-medium">
                No cinema cities found matching "{searchTerm}"
              </div>
            ) : (
              <div className="space-y-6">
                {Object.keys(groupedCities).sort().map((letter) => (
                  <div key={letter} className="space-y-2">
                    <div className="inline-block text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {letter}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-x-3 gap-y-2">
                      {groupedCities[letter].map((cityName) => {
                        const isSelected = selectedCity.toLowerCase() === cityName.toLowerCase();
                        return (
                          <button
                            key={cityName}
                            onClick={() => selectCity(cityName)}
                            className={`text-left text-xs py-1.5 px-2.5 rounded-lg transition-all cursor-pointer line-clamp-1 ${
                              isSelected
                                ? 'font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50 font-medium'
                            }`}
                          >
                            {cityName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
