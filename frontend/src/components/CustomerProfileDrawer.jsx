import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  X,
  User,
  ShoppingBag,
  Bell,
  Heart,
  MessageSquare,
  Settings,
  Gift,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  EditProfileModal,
  NotificationsModal,
  WishlistModal,
  HelpSupportModal,
  SettingsModal,
  RewardsModal,
} from './ProfileModals';

export const CustomerProfileDrawer = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Active modal state
  const [activeModal, setActiveModal] = useState(null); // 'profile', 'notifications', 'wishlist', 'support', 'settings', 'rewards'

  if (!isOpen) return null;

  const handleNavigateOrders = () => {
    onClose();
    navigate('/my-bookings');
  };

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/');
  };

  const handleUpdateUser = (updatedData) => {
    if (user) {
      Object.assign(user, updatedData);
    }
  };

  const userName = user?.name || (user?.email ? user.email.split('@')[0] : 'Movie Buff');

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
        {/* Backdrop overlay */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        />

        {/* Right Side Drawer Container */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
            {/* Header Bar */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm overflow-hidden">
                  {user?.picture ? (
                    <img src={user.picture} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-snug flex items-center gap-1.5">
                    Hey! <span className="text-emerald-700 capitalize">{userName}</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveModal('profile')}
                    className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-0.5 font-semibold mt-0.5 cursor-pointer"
                  >
                    Edit Profile <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Yellow WhatsApp/SMS Notification Banner */}
            <div
              onClick={() => setActiveModal('profile')}
              className="p-3.5 bg-amber-50 border-b border-amber-200/80 flex items-start justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs text-slate-900 font-bold">Get tickets on WhatsApp/SMS!</strong>
                  <span className="text-[11px] text-slate-600 font-medium">Add your Mobile Number</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
            </div>

            {/* Main Menu Scrollable Area */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {/* Your Orders (Navigates to /my-bookings) */}
              <div
                onClick={handleNavigateOrders}
                className="p-4 flex items-center justify-between hover:bg-emerald-50/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center space-x-3.5">
                  <ShoppingBag className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700">Your Orders</h3>
                    <p className="text-xs text-slate-500">View all your bookings & purchases</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </div>

              {/* Notifications */}
              <div
                onClick={() => setActiveModal('notifications')}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center space-x-3.5">
                  <Bell className="w-5 h-5 text-slate-600 group-hover:text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">Notifications</h3>
                    <p className="text-xs text-slate-500">View updates, offers & show alerts</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </div>

              {/* Your Wishlist */}
              <div
                onClick={() => setActiveModal('wishlist')}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center space-x-3.5">
                  <Heart className="w-5 h-5 text-slate-600 group-hover:text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">Your Wishlist</h3>
                    <p className="text-xs text-slate-500">Saved movies & upcoming releases</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </div>

              {/* Help & Support */}
              <div
                onClick={() => setActiveModal('support')}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center space-x-3.5">
                  <MessageSquare className="w-5 h-5 text-slate-600 group-hover:text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">Help & Support</h3>
                    <p className="text-xs text-slate-500">View commonly asked queries and Chat</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </div>

              {/* Accounts & Settings */}
              <div
                onClick={() => setActiveModal('settings')}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center space-x-3.5">
                  <Settings className="w-5 h-5 text-slate-600 group-hover:text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">Accounts & Settings</h3>
                    <p className="text-xs text-slate-500">Location, Payments, Permissions & More</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </div>

              {/* Rewards */}
              <div
                onClick={() => setActiveModal('rewards')}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center space-x-3.5">
                  <Gift className="w-5 h-5 text-slate-600 group-hover:text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">Rewards</h3>
                    <p className="text-xs text-slate-500">View your rewards & unlock new ones</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </div>
            </div>

            {/* Footer Action - Red Outlined Sign Out */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 border border-rose-500 text-rose-600 hover:bg-rose-50 font-bold text-sm rounded-xl transition-all text-center shadow-sm cursor-pointer"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <EditProfileModal
        isOpen={activeModal === 'profile'}
        onClose={() => setActiveModal(null)}
        user={user}
        onUpdateUser={handleUpdateUser}
      />
      <NotificationsModal
        isOpen={activeModal === 'notifications'}
        onClose={() => setActiveModal(null)}
      />
      <WishlistModal
        isOpen={activeModal === 'wishlist'}
        onClose={() => setActiveModal(null)}
      />
      <HelpSupportModal
        isOpen={activeModal === 'support'}
        onClose={() => setActiveModal(null)}
      />
      <SettingsModal
        isOpen={activeModal === 'settings'}
        onClose={() => setActiveModal(null)}
      />
      <RewardsModal
        isOpen={activeModal === 'rewards'}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
};
